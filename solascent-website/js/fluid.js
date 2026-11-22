/* Solascent hero: fluid smoke that follows the cursor (WebGL2).
   Gold / champagne / beige / warm-grey smoke drawn over the hero photo, hidden behind the diffusers
   (a bottle mask is used), with a soft gold glow on the surface under each diffuser when smoke drifts behind it.
   Based on the classic Navier-Stokes "stable fluids" approach (advect, curl/vorticity, pressure solve). */
(function () {
  "use strict";
  var hero = document.querySelector(".hero-brand");
  var canvas = hero && hero.querySelector("canvas.fluid");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;   // cursor devices only

  var gl = canvas.getContext("webgl2", { alpha: false, depth: false, stencil: false, antialias: false, powerPreference: "high-performance" });
  if (!gl || !(gl.getExtension("EXT_color_buffer_float") || gl.getExtension("EXT_color_buffer_half_float"))) return;

  /* ---------- look & feel ---------- */
  var CFG = {
    SIM_RES: 128, DYE_RES: 720,
    DENSITY_DISSIPATION: 0.95, VELOCITY_DISSIPATION: 1.1, PRESSURE: 0.8, PRESSURE_ITERATIONS: 18,
    CURL: 22, SPLAT_RADIUS: 0.2, SPLAT_FORCE: 5200, DYE_AMOUNT: 0.5, STRENGTH: 1.0
  };
  /* brand palette: gold, champagne, beige, warm grey, deep brass (r,g,b 0-255) */
  var PALETTE = [[210, 172, 43], [242, 220, 133], [232, 217, 191], [154, 152, 146], [185, 143, 46], [255, 243, 194]];
  /* diffusers in photo coordinates (0-1, origin top-left): body box (cx,cy,hw,hh) and the surface it stands on (cx,cy,rx,ry) */
  var BOTTLES = [
    { box: [0.373, 0.545, 0.045, 0.195], surf: [0.374, 0.742, 0.125, 0.036] },   // Cherry Mongolia on the wood block
    { box: [0.501, 0.710, 0.046, 0.180], surf: [0.501, 0.892, 0.085, 0.032] },   // Apple Cinnamon
    { box: [0.628, 0.662, 0.044, 0.200], surf: [0.628, 0.864, 0.085, 0.032] }    // Dark Amber
  ];
  var IMG_ASPECT = 1920 / 1000;

  /* ---------- tiny GL helpers ---------- */
  function compile(type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  var VERT = "#version 300 es\nprecision highp float;in vec2 aPosition;out vec2 vUv,vL,vR,vT,vB;uniform vec2 texelSize;" +
    "void main(){vUv=aPosition*.5+.5;vL=vUv-vec2(texelSize.x,0.);vR=vUv+vec2(texelSize.x,0.);vT=vUv+vec2(0.,texelSize.y);vB=vUv-vec2(0.,texelSize.y);gl_Position=vec4(aPosition,0.,1.);}";
  var HEAD = "#version 300 es\nprecision highp float;precision highp sampler2D;in vec2 vUv,vL,vR,vT,vB;out vec4 outColor;";
  function program(frag) {
    var p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, HEAD + frag));
    gl.bindAttribLocation(p, 0, "aPosition");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) { var name = gl.getActiveUniform(p, i).name.replace("[0]", ""); u[name] = gl.getUniformLocation(p, name); }
    return { p: p, u: u };
  }

  var P = {};
  try {
    P.clear = program("uniform sampler2D uTexture;uniform float value;void main(){outColor=value*texture(uTexture,vUv);}");
    P.splat = program("uniform sampler2D uTarget;uniform float aspectRatio;uniform vec3 color;uniform vec2 point;uniform float radius;" +
      "void main(){vec2 p=vUv-point;p.x*=aspectRatio;vec3 s=exp(-dot(p,p)/radius)*color;outColor=vec4(texture(uTarget,vUv).xyz+s,1.);}");
    P.advect = program("uniform sampler2D uVelocity,uSource;uniform vec2 texelSize;uniform float dt,dissipation;" +
      "void main(){vec2 coord=vUv-dt*texture(uVelocity,vUv).xy*texelSize;vec4 r=texture(uSource,coord);outColor=r/(1.+dissipation*dt);}");
    P.divergence = program("uniform sampler2D uVelocity;void main(){float L=texture(uVelocity,vL).x,R=texture(uVelocity,vR).x,T=texture(uVelocity,vT).y,B=texture(uVelocity,vB).y;" +
      "vec2 C=texture(uVelocity,vUv).xy;if(vL.x<0.)L=-C.x;if(vR.x>1.)R=-C.x;if(vT.y>1.)T=-C.y;if(vB.y<0.)B=-C.y;outColor=vec4(.5*(R-L+T-B),0.,0.,1.);}");
    P.curl = program("uniform sampler2D uVelocity;void main(){float L=texture(uVelocity,vL).y,R=texture(uVelocity,vR).y,T=texture(uVelocity,vT).x,B=texture(uVelocity,vB).x;outColor=vec4(.5*(R-L-T+B),0.,0.,1.);}");
    P.vorticity = program("uniform sampler2D uVelocity,uCurl;uniform float curl,dt;void main(){float L=texture(uCurl,vL).x,R=texture(uCurl,vR).x,T=texture(uCurl,vT).x,B=texture(uCurl,vB).x,C=texture(uCurl,vUv).x;" +
      "vec2 f=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));f/=length(f)+.0001;f*=curl*C;f.y*=-1.;vec2 v=texture(uVelocity,vUv).xy+f*dt;v=min(max(v,-1000.),1000.);outColor=vec4(v,0.,1.);}");
    P.pressure = program("uniform sampler2D uPressure,uDivergence;void main(){float L=texture(uPressure,vL).x,R=texture(uPressure,vR).x,T=texture(uPressure,vT).x,B=texture(uPressure,vB).x;" +
      "float d=texture(uDivergence,vUv).x;outColor=vec4((L+R+B+T-d)*.25,0.,0.,1.);}");
    P.gradient = program("uniform sampler2D uPressure,uVelocity;void main(){float L=texture(uPressure,vL).x,R=texture(uPressure,vR).x,T=texture(uPressure,vT).x,B=texture(uPressure,vB).x;" +
      "vec2 v=texture(uVelocity,vUv).xy-vec2(R-L,T-B);outColor=vec4(v,0.,1.);}");
    P.display = program(
      "uniform sampler2D uTexture,uMask;uniform vec4 uMap;uniform vec4 uBox[3];uniform vec4 uSurf[3];uniform float uStrength;uniform vec2 uPointer;uniform float uPointerOn,uAspect;" +
      "float lum(vec3 c){return dot(c,vec3(.3,.5,.2));}" +
      "void main(){" +
      "vec2 img=vec2(uMap.x+vUv.x*(uMap.z-uMap.x),uMap.y+(1.-vUv.y)*(uMap.w-uMap.y));" +
      "float m=texture(uMask,img).r;" +                                   /* 1 where a diffuser is */
      "vec3 dye=texture(uTexture,vUv).rgb;" +
      "vec3 smoke=1.-exp(-dye*1.5);smoke*=(1.-smoothstep(.0,.9,m))*uStrength;" +
      "float lowY=smoothstep(.56,.80,img.y);float side=smoothstep(.22,.38,abs(img.x-.5));" +
      "smoke*=1.-lowY*(1.-side*.6);" +                                  /* at table level the smoke only shows at the left / right corners, and gently */
      "float pod=smoothstep(.27,.30,img.x)*(1.-smoothstep(.46,.49,img.x))*smoothstep(.69,.73,img.y);smoke*=1.-pod;" +   /* never on the wooden podium */
      /* the pointer makes the smoke shine around it: a very soft, edge-less gaussian that is brighter where there is smoke */
      "vec2 pd=vUv-uPointer;pd.x*=uAspect;float pr=dot(pd,pd);" +
      "float shine=exp(-pr/.012)*(.06+1.4*lum(dye))+exp(-pr/.003)*(.012+.35*lum(dye));" +
      "smoke+=vec3(1.,.87,.58)*shine*uPointerOn*(1.-smoothstep(.0,.9,m));" +  /* smoke stays behind the bottles */
      "vec3 glow=vec3(0.);" +
      "for(int i=0;i<3;i++){vec4 b=uBox[i];float p=lum(texture(uTexture,b.xy).rgb)+lum(texture(uTexture,b.xy+vec2(-.7,.6)*b.zw).rgb)+lum(texture(uTexture,b.xy+vec2(.7,.6)*b.zw).rgb)" +
      "+lum(texture(uTexture,b.xy+vec2(-.7,-.6)*b.zw).rgb)+lum(texture(uTexture,b.xy+vec2(.7,-.6)*b.zw).rgb)+lum(texture(uTexture,b.xy+vec2(0.,1.3)*b.zw).rgb);" +
      "float g=clamp(p*.9,0.,1.);g=g*g*(3.-2.*g);vec4 s=uSurf[i];vec2 d=(vUv-s.xy)/s.zw;float e=exp(-dot(d,d)*1.9);" +
      "glow+=vec3(1.,.80,.44)*e*g*.65*(i==0?0.:1.);}" +          /* no glow on the wooden podium (first diffuser) */
      "outColor=vec4(smoke+glow,1.);}");
  } catch (e) { if (window.console) console.warn("fluid: shader error", e); return; }

  /* full-screen quad */
  var vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  var ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.enableVertexAttribArray(0);
  function blit(target) {
    if (target) { gl.viewport(0, 0, target.w, target.h); gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo); }
    else { gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER, null); }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  /* ---------- framebuffers ---------- */
  function makeFBO(w, h, filter) {
    gl.activeTexture(gl.TEXTURE0);
    var tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    var fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex: tex, fbo: fbo, w: w, h: h, tx: 1 / w, ty: 1 / h,
      attach: function (unit) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); return unit; } };
  }
  function makeDouble(w, h, filter) {
    var a = makeFBO(w, h, filter), b = makeFBO(w, h, filter);
    return { w: w, h: h, tx: a.tx, ty: a.ty, get read() { return a; }, get write() { return b; }, swap: function () { var t = a; a = b; b = t; } };
  }
  function res(r) {
    var asp = gl.drawingBufferWidth / gl.drawingBufferHeight; if (asp < 1) asp = 1 / asp;
    var mn = Math.round(r), mx = Math.round(r * asp);
    return gl.drawingBufferWidth > gl.drawingBufferHeight ? { w: mx, h: mn } : { w: mn, h: mx };
  }
  var dye, vel, div, curl, prs;
  function initFBOs() {
    var s = res(CFG.SIM_RES), d = res(CFG.DYE_RES);
    dye = makeDouble(d.w, d.h, gl.LINEAR); vel = makeDouble(s.w, s.h, gl.LINEAR);
    div = makeFBO(s.w, s.h, gl.NEAREST); curl = makeFBO(s.w, s.h, gl.NEAREST); prs = makeDouble(s.w, s.h, gl.NEAREST);
  }

  /* ---------- bottle mask ---------- */
  var maskTex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, maskTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, 1, 1, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array([0]));
  [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(function (k) { gl.texParameteri(gl.TEXTURE_2D, k, gl.LINEAR); });
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  var mimg = new Image();
  mimg.onload = function () {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, maskTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, gl.RED, gl.UNSIGNED_BYTE, mimg);
  };
  mimg.src = canvas.getAttribute("data-mask");

  /* ---------- photo <-> canvas mapping (object-fit: cover) ---------- */
  var map = [0, 0, 1, 1], boxU = new Float32Array(12), surfU = new Float32Array(12);
  function updateMapping() {
    var A = canvas.width / canvas.height, I = IMG_ASPECT, x0 = 0, x1 = 1, y0 = 0, y1 = 1, px = 0.5, py = 0.5;
    var im = hero.querySelector(".bg img");
    if (im) { var op = (getComputedStyle(im).objectPosition || "50% 50%").split(/\s+/); px = parseFloat(op[0]) / 100; py = parseFloat(op[1]) / 100; if (isNaN(px)) px = 0.5; if (isNaN(py)) py = 0.5; }
    if (A >= I) { var vf = I / A; y0 = (1 - vf) * py; y1 = y0 + vf; } else { var hf = A / I; x0 = (1 - hf) * px; x1 = x0 + hf; }
    map = [x0, y0, x1, y1];
    var w = x1 - x0, h = y1 - y0;
    BOTTLES.forEach(function (b, i) {
      boxU.set([(b.box[0] - x0) / w, 1 - (b.box[1] - y0) / h, b.box[2] / w, b.box[3] / h], i * 4);
      surfU.set([(b.surf[0] - x0) / w, 1 - (b.surf[1] - y0) / h, b.surf[2] / w, b.surf[3] / h], i * 4);
    });
  }

  /* ---------- simulation ---------- */
  function splat(x, y, dx, dy, color, radius) {
    gl.useProgram(P.splat.p);
    gl.uniform1i(P.splat.u.uTarget, vel.read.attach(0));
    gl.uniform1f(P.splat.u.aspectRatio, canvas.width / canvas.height);
    gl.uniform2f(P.splat.u.point, x, y); gl.uniform3f(P.splat.u.color, dx, dy, 0);
    var r = radius / 100; if (canvas.width / canvas.height > 1) r *= canvas.width / canvas.height;
    gl.uniform1f(P.splat.u.radius, r);
    blit(vel.write); vel.swap();
    gl.uniform1i(P.splat.u.uTarget, dye.read.attach(0));
    gl.uniform3f(P.splat.u.color, color[0], color[1], color[2]);
    blit(dye.write); dye.swap();
  }
  function step(dt) {
    gl.disable(gl.BLEND);
    gl.useProgram(P.curl.p); gl.uniform2f(P.curl.u.texelSize, vel.tx, vel.ty); gl.uniform1i(P.curl.u.uVelocity, vel.read.attach(0)); blit(curl);
    gl.useProgram(P.vorticity.p); gl.uniform2f(P.vorticity.u.texelSize, vel.tx, vel.ty);
    gl.uniform1i(P.vorticity.u.uVelocity, vel.read.attach(0)); gl.uniform1i(P.vorticity.u.uCurl, curl.attach(1));
    gl.uniform1f(P.vorticity.u.curl, CFG.CURL); gl.uniform1f(P.vorticity.u.dt, dt); blit(vel.write); vel.swap();
    gl.useProgram(P.divergence.p); gl.uniform2f(P.divergence.u.texelSize, vel.tx, vel.ty); gl.uniform1i(P.divergence.u.uVelocity, vel.read.attach(0)); blit(div);
    gl.useProgram(P.clear.p); gl.uniform1i(P.clear.u.uTexture, prs.read.attach(0)); gl.uniform1f(P.clear.u.value, CFG.PRESSURE); blit(prs.write); prs.swap();
    gl.useProgram(P.pressure.p); gl.uniform2f(P.pressure.u.texelSize, vel.tx, vel.ty); gl.uniform1i(P.pressure.u.uDivergence, div.attach(0));
    for (var i = 0; i < CFG.PRESSURE_ITERATIONS; i++) { gl.uniform1i(P.pressure.u.uPressure, prs.read.attach(1)); blit(prs.write); prs.swap(); }
    gl.useProgram(P.gradient.p); gl.uniform2f(P.gradient.u.texelSize, vel.tx, vel.ty);
    gl.uniform1i(P.gradient.u.uPressure, prs.read.attach(0)); gl.uniform1i(P.gradient.u.uVelocity, vel.read.attach(1)); blit(vel.write); vel.swap();
    gl.useProgram(P.advect.p); gl.uniform2f(P.advect.u.texelSize, vel.tx, vel.ty);
    var vid = vel.read.attach(0); gl.uniform1i(P.advect.u.uVelocity, vid); gl.uniform1i(P.advect.u.uSource, vid);
    gl.uniform1f(P.advect.u.dt, dt); gl.uniform1f(P.advect.u.dissipation, CFG.VELOCITY_DISSIPATION); blit(vel.write); vel.swap();
    gl.uniform1i(P.advect.u.uVelocity, vel.read.attach(0)); gl.uniform1i(P.advect.u.uSource, dye.read.attach(1));
    gl.uniform2f(P.advect.u.texelSize, dye.tx, dye.ty); gl.uniform1f(P.advect.u.dissipation, CFG.DENSITY_DISSIPATION); blit(dye.write); dye.swap();
  }
  function render() {
    gl.useProgram(P.display.p);
    gl.uniform1i(P.display.u.uTexture, dye.read.attach(0)); gl.uniform1i(P.display.u.uMask, 5);
    gl.uniform4f(P.display.u.uMap, map[0], map[1], map[2], map[3]);
    gl.uniform4fv(P.display.u.uBox, boxU); gl.uniform4fv(P.display.u.uSurf, surfU);
    gl.uniform1f(P.display.u.uStrength, CFG.STRENGTH);
    gl.uniform2f(P.display.u.uPointer, ptr.x, ptr.y); gl.uniform1f(P.display.u.uPointerOn, ptr.on); gl.uniform1f(P.display.u.uAspect, canvas.width / canvas.height);
    blit(null);
  }

  /* ---------- colour: a slow, elegant drift through gold -> champagne -> beige -> warm grey ---------- */
  function smokeColor(t) {
    var n = PALETTE.length, f = ((t % n) + n) % n, i = Math.floor(f), k = f - i, a = PALETTE[i], b = PALETTE[(i + 1) % n];
    k = k * k * (3 - 2 * k);
    return [(a[0] + (b[0] - a[0]) * k) / 255, (a[1] + (b[1] - a[1]) * k) / 255, (a[2] + (b[2] - a[2]) * k) / 255];
  }

  /* ---------- sizing ---------- */
  function resize() {
    var r = hero.querySelector(".bg").getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; initFBOs(); }
    updateMapping();
  }

  /* ---------- pointer ---------- */
  var last = null, running = true, visible = true, lastT = performance.now(), colorT = 0;
  var ptr = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, on: 0, ton: 0 };   /* the shining area of smoke around the pointer */
  function onMove(e) {
    if (e.pointerType === "touch") return;
    var r = canvas.getBoundingClientRect();
    if (e.clientY < r.top || e.clientY > r.bottom) { last = null; ptr.ton = 0; return; }
    var x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height;
    if (!ptr.ton) { ptr.x = x; ptr.y = y; }
    ptr.tx = x; ptr.ty = y; ptr.ton = 1;
    if (last) {
      var asp = r.width / r.height;
      var dx = (x - last.x) * (asp < 1 ? asp : 1), dy = (y - last.y) / (asp > 1 ? asp : 1);
      var speed = Math.sqrt(dx * dx + dy * dy);
      if (speed > 0.0004) {
        colorT += speed * 9;                                         /* colour drifts with movement */
        var c = smokeColor(colorT), amt = CFG.DYE_AMOUNT * Math.min(1, 0.35 + speed * 40);
        splat(x, y, dx * CFG.SPLAT_FORCE, dy * CFG.SPLAT_FORCE, [c[0] * amt, c[1] * amt, c[2] * amt], CFG.SPLAT_RADIUS * (0.8 + Math.min(speed * 18, 0.9)));
      }
    }
    last = { x: x, y: y };
  }
  hero.addEventListener("pointermove", onMove, { passive: true });
  hero.addEventListener("pointerleave", function () { last = null; ptr.ton = 0; }, { passive: true });

  function frame(now) {
    requestAnimationFrame(frame);
    if (!running || !visible || document.hidden) { lastT = now; return; }
    var dt = Math.min((now - lastT) / 1000, 0.0167); lastT = now;
    if (dt <= 0) return;
    ptr.x += (ptr.tx - ptr.x) * 0.16; ptr.y += (ptr.ty - ptr.y) * 0.16; ptr.on += (ptr.ton - ptr.on) * 0.08;   /* glide, so it feels like drifting light, not a dot */
    step(dt); render();
  }

  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0 }) : null;
  if (io) io.observe(hero);
  var rz; window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(resize, 150); });
  resize();
  canvas.classList.add("on");
  requestAnimationFrame(frame);
})();
