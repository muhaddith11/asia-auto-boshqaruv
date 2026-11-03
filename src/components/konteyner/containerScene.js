/* eslint-disable */
// Konteyner ombori - 3D sahna (40' High Cube, SEGU 550123 6). Claude Design'dagi
// 'Konteyner ombori 3D' dan ko'chirilgan; three.js r149 ga bog'liq (sRGBEncoding va h.k.),
// shuning uchun package.json da three aynan 0.149.0.
import * as T from 'three';

if (T.ColorManagement) T.ColorManagement.legacyMode = false;

// ---- O'lchamlar (metr) ----
var L = 12.03, W = 2.35, H = 2.69;
var NS = 6, SL = 1.8, RD = 0.6;
var RACK_FRONT = W / 2 - 0.03 - RD;
var Z0 = -L / 2 + 0.05;
var ZD = Z0 + NS * SL;
var LEVELS = [0.12, 0.62, 1.12, 1.62, 2.12];
var NL = LEVELS.length;
var DECK_T = 0.03;
var RACK_TOP = 2.45;
var EYE = 1.62;
var EL = 12.19, EW = 2.44, YB = -0.16, YT = 2.73;

function secZ(s) { return ZD - (s - 0.5) * SL; }
function parseCell(id) {
  var m = /^([AB])(\d)-(\d)$/.exec(id || '');
  if (!m) return null;
  return { side: m[1], sec: +m[2], lvl: +m[3], sign: m[1] === 'A' ? -1 : 1 };
}
var CELLS = [];
['A', 'B'].forEach(function (sd) {
  for (var s = 1; s <= NS; s++) for (var l = 1; l <= NL; l++) CELLS.push(sd + s + '-' + l);
});

// ---- Tasodifiy (barqaror) ----
var seed = 7;
function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
function hash(str) { var h = 0; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0; return Math.abs(h); }

// ---- Teksturalar ----
function canvasTex(w, h, draw, srgb) {
  var c = document.createElement('canvas'); c.width = w; c.height = h;
  var g = c.getContext('2d'); draw(g, w, h);
  var t = new T.CanvasTexture(c); t.anisotropy = 8;
  if (srgb !== false) t.encoding = T.sRGBEncoding;
  return t;
}
function speckle(g, w, h, n, col, aMax, sMin, sMax) {
  for (var i = 0; i < n; i++) {
    g.fillStyle = col.replace('A', (rnd() * aMax).toFixed(3));
    var s = sMin + rnd() * (sMax - sMin);
    g.beginPath(); g.ellipse(rnd() * w, rnd() * h, s, s * (0.5 + rnd()), rnd() * 3, 0, 6.3); g.fill();
  }
}
function wrapText(g, text, x, y, maxW, lh, maxLines) {
  var words = String(text).split(/\s+/), line = '', lines = [];
  for (var i = 0; i < words.length; i++) {
    var t = line ? line + ' ' + words[i] : words[i];
    if (g.measureText(t).width > maxW && line) { lines.push(line); line = words[i]; } else line = t;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) { lines = lines.slice(0, maxLines); lines[maxLines - 1] += '\u2026'; }
  lines.forEach(function (l, k) { g.fillText(l, x, y + k * lh); });
  return lines.length;
}

// ---- Zapchast turlari ----
var CATS = {
  motor:  { w: 0.30, d: 0.26, h: 0.20, stack: 2, deep: 2, box: '#b48655', color: '#b98a5a' },
  tormoz: { w: 0.30, d: 0.30, h: 0.03, stack: 6, deep: 1, color: '#8f949a' },
  filtr:  { w: 0.12, d: 0.12, h: 0.13, stack: 3, deep: 4, color: '#2f7bd6' },
  elektr: { w: 0.20, d: 0.14, h: 0.12, stack: 3, deep: 3, box: '#3a3f47', color: '#5b6470' },
  osma:   { w: 0.08, d: 0.50, h: 0.07, stack: 5, deep: 1, color: '#b8322a' },
  moy:    { w: 0.17, d: 0.11, h: 0.32, stack: 1, deep: 4, color: '#e0a526' },
  shina:  { w: 0.52, d: 0.52, h: 0.17, stack: 2, deep: 1, color: '#3a3c40' },
  kuzov:  { w: 0.06, d: 0.50, h: 0.38, stack: 1, deep: 1, color: '#9aa3ad' },
  akkum:  { w: 0.20, d: 0.18, h: 0.19, stack: 2, deep: 3, box: '#1d1f22', color: '#1d1f22' },
  boshqa: { w: 0.26, d: 0.24, h: 0.20, stack: 2, deep: 2, box: '#c19463', color: '#c49a6c' }
};
var TINTS = ['#e0a526', '#2f7bd6', '#d0452f', '#3ba272', '#8e5bd1', '#e07b2c', '#2aa1b3', '#c9c03a'];

var M = {}, G = {}, TX = {};
function mat(key, p) { if (!M[key]) M[key] = new T.MeshStandardMaterial(p); return M[key]; }
function geo(key, make) { if (!G[key]) G[key] = make(); return G[key]; }

var cardboardTex = null;
function cardboard() {
  if (!cardboardTex) cardboardTex = canvasTex(256, 256, function (g, w, h) {
    g.fillStyle = '#c19463'; g.fillRect(0, 0, w, h);
    for (var x = 0; x < w; x += 3) { g.fillStyle = 'rgba(90,60,30,' + (0.03 + rnd() * 0.05) + ')'; g.fillRect(x, 0, 1, h); }
    speckle(g, w, h, 120, 'rgba(80,50,20,A)', 0.12, 1, 6);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 0, w, 4); g.fillRect(0, h - 4, w, 4);
  });
  return cardboardTex;
}
function itemLabel(name, cat, tint) {
  var key = cat + '|' + tint + '|' + name;
  if (TX[key]) return TX[key];
  TX[key] = canvasTex(320, 200, function (g, w, h) {
    g.fillStyle = '#f7f4ec'; g.fillRect(0, 0, w, h);
    g.fillStyle = tint; g.fillRect(0, 0, w, 34);
    g.fillStyle = '#ffffff'; g.font = 'bold 22px sans-serif'; g.textBaseline = 'middle';
    g.fillText((cat || '').toUpperCase(), 14, 18);
    g.fillStyle = '#16181b'; g.font = 'bold 34px sans-serif'; g.textBaseline = 'top';
    wrapText(g, name || '', 14, 48, w - 28, 38, 3);
    for (var i = 0; i < 26; i++) { g.fillStyle = '#16181b'; g.fillRect(w - 120 + i * 4, h - 30, (i % 3 === 0 ? 3 : 1), 20); }
  });
  return TX[key];
}
var CAT_UZ = { motor: 'Dvigatel', tormoz: 'Tormoz', filtr: 'Filtr', elektr: 'Elektr', osma: 'Osma', moy: 'Moy', shina: 'Shina', kuzov: 'Kuzov', akkum: 'Akkumulyator', boshqa: 'Zapchast' };
function labelMat(name, cat, tint) {
  var k = 'L' + cat + tint + name;
  if (!M[k]) M[k] = new T.MeshStandardMaterial({ map: itemLabel(name, CAT_UZ[cat] || '', tint), roughness: 0.6 });
  return M[k];
}
var treadTex = null;

function makeUnit(cat, tint, face, name) {
  var g = new T.Group();
  var s = CATS[cat] || CATS.boshqa;
  var m, rot = face > 0 ? Math.PI / 2 : -Math.PI / 2;
  function add(mesh, x, y, z) { mesh.position.set(x || 0, y || 0, z || 0); mesh.castShadow = true; mesh.receiveShadow = true; g.add(mesh); return mesh; }
  if (cat === 'tormoz') {
    add(new T.Mesh(geo('disc', function () { return new T.CylinderGeometry(0.14, 0.14, 0.026, 32); }), mat('disc', { color: '#9ba0a6', metalness: 0.85, roughness: 0.35 })), 0, 0.013, 0);
    add(new T.Mesh(geo('hub', function () { return new T.CylinderGeometry(0.065, 0.065, 0.03, 24); }), mat('hub', { color: '#4b4f55', metalness: 0.6, roughness: 0.5 })), 0, 0.016, 0);
  } else if (cat === 'filtr') {
    add(new T.Mesh(geo('filt', function () { return new T.CylinderGeometry(0.048, 0.048, 0.105, 24); }), mat('filt' + tint, { color: tint, roughness: 0.3, metalness: 0.3 })), 0, 0.0525, 0);
    add(new T.Mesh(geo('filtb', function () { return new T.CylinderGeometry(0.046, 0.046, 0.015, 24); }), mat('filtb', { color: '#2b2d31', roughness: 0.5, metalness: 0.4 })), 0, 0.112, 0);
  } else if (cat === 'osma') {
    add(new T.Mesh(geo('shock', function () { var c = new T.CylinderGeometry(0.028, 0.028, 0.36, 18); c.rotateZ(Math.PI / 2); return c; }), mat('shock', { color: '#b8322a', roughness: 0.35, metalness: 0.3 })), -0.06, 0.032, 0);
    add(new T.Mesh(geo('rod', function () { var c = new T.CylinderGeometry(0.011, 0.011, 0.2, 10); c.rotateZ(Math.PI / 2); return c; }), mat('chrome', { color: '#e3e6e9', metalness: 1, roughness: 0.15 })), 0.17, 0.032, 0);
    add(new T.Mesh(geo('eye', function () { var c = new T.TorusGeometry(0.02, 0.008, 8, 16); return c; }), mat('chrome', {})), 0.27, 0.032, 0);
  } else if (cat === 'moy') {
    add(new T.Mesh(geo('can', function () { return new T.BoxGeometry(0.1, 0.27, 0.16); }), mat('can' + tint, { color: tint, roughness: 0.35 })), 0, 0.135, 0);
    add(new T.Mesh(geo('cap', function () { return new T.CylinderGeometry(0.02, 0.02, 0.04, 12); }), mat('capm', { color: '#1b1b1b', roughness: 0.5 })), 0, 0.29, 0.05);
    add(new T.Mesh(geo('hdl', function () { return new T.BoxGeometry(0.025, 0.035, 0.08); }), mat('can' + tint, {})), 0, 0.285, -0.03);
    var cl = new T.Mesh(geo('canlbl', function () { return new T.PlaneGeometry(0.13, 0.11); }), labelMat(name, cat, tint));
    cl.rotation.y = rot; cl.position.set(face * 0.0505, 0.13, 0); g.add(cl);
  } else if (cat === 'shina') {
    if (!treadTex) {
      treadTex = canvasTex(64, 512, function (gg, w, h) { gg.fillStyle = '#26272a'; gg.fillRect(0, 0, w, h); for (var y = 0; y < h; y += 16) { gg.fillStyle = '#121314'; gg.fillRect(8, y, 20, 8); gg.fillRect(36, y + 8, 20, 8); } });
      treadTex.wrapS = treadTex.wrapT = T.RepeatWrapping; treadTex.repeat.set(1, 4);
    }
    add(new T.Mesh(geo('tire', function () { var t = new T.TorusGeometry(0.18, 0.075, 16, 48); t.rotateX(Math.PI / 2); return t; }), mat('tire', { color: '#2a2b2e', map: treadTex, roughness: 0.92 })), 0, 0.08, 0);
    add(new T.Mesh(geo('rim', function () { return new T.CylinderGeometry(0.125, 0.125, 0.11, 32); }), mat('rim', { color: '#c4c8cd', metalness: 0.9, roughness: 0.25 })), 0, 0.08, 0);
  } else if (cat === 'kuzov') {
    add(new T.Mesh(geo('panel', function () { return new T.BoxGeometry(0.48, 0.36, 0.035); }), mat('pan' + tint, { color: tint, roughness: 0.18, metalness: 0.4 })), 0, 0.18, 0);
  } else {
    var bw = s.w - 0.02, bd = s.d - 0.02, bh = s.h - 0.01;
    var bm = cat === 'motor' || cat === 'boshqa'
      ? mat('cb' + cat, { map: cardboard(), color: cat === 'motor' ? '#e9d6bd' : '#ffffff', roughness: 0.9 })
      : mat('box' + cat, { color: s.box, roughness: cat === 'akkum' ? 0.45 : 0.6 });
    add(new T.Mesh(geo('box' + cat, function () { return new T.BoxGeometry(bd, bh, bw); }), bm), 0, bh / 2, 0);
    if (cat === 'akkum') {
      var tp = geo('term', function () { return new T.CylinderGeometry(0.012, 0.012, 0.025, 10); });
      add(new T.Mesh(tp, mat('tred', { color: '#d32f2f', roughness: 0.4 })), 0, bh + 0.012, bw / 2 - 0.04);
      add(new T.Mesh(tp, mat('tblk', { color: '#3a3a3a', roughness: 0.4 })), 0, bh + 0.012, -bw / 2 + 0.04);
    } else if (cat === 'motor' || cat === 'boshqa') {
      add(new T.Mesh(geo('tape' + cat, function () { return new T.BoxGeometry(bd + 0.003, 0.003, 0.05); }), mat('tape', { color: '#e6d8b8', roughness: 0.35 })), 0, bh + 0.001, 0);
    }
    var lw = Math.min(bw * 0.86, 0.22), lh = Math.min(bh * 0.62, lw * 0.62);
    var lb = new T.Mesh(new T.PlaneGeometry(lw, lh), labelMat(name, cat, tint));
    lb.position.set(face * (bd / 2 + 0.002), bh * 0.55, 0); lb.rotation.y = rot; g.add(lb);
  }
  return g;
}

// ---- Qovurg'ali (gofr) devor geometriyasi ----
// uzunlik X bo'ylab, balandlik Y, qovurg'a -Z tomonga
function corrugated(len, height, pitch, depth, thick) {
  var sh = new T.Shape(), pts = [];
  var f = pitch * 0.32, sl = pitch * 0.18;
  var x = 0;
  pts.push([0, 0]);
  while (x < len - 0.001) {
    var seg = [[f, 0], [sl, depth], [f, 0], [sl, -depth]];
    for (var i = 0; i < seg.length; i++) {
      x = Math.min(len, x + seg[i][0]);
      var yPrev = pts[pts.length - 1][1];
      pts.push([x, x >= len ? 0 : yPrev + seg[i][1]]);
      if (x >= len) break;
    }
  }
  sh.moveTo(pts[0][0], pts[0][1]);
  for (var a = 1; a < pts.length; a++) sh.lineTo(pts[a][0], pts[a][1]);
  for (var b = pts.length - 1; b >= 0; b--) sh.lineTo(pts[b][0], pts[b][1] - thick);
  var gm = new T.ExtrudeGeometry(sh, { depth: height, bevelEnabled: false, steps: 1 });
  gm.rotateX(-Math.PI / 2);
  gm.computeVertexNormals();
  return gm;
}

function create(canvas, opts) {
  opts = opts || {};
  seed = 7;
  var renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'high-performance' });
  var lowEnd = Math.min(window.screen ? window.screen.width : 1200, window.innerWidth || 1200) < 700;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowEnd ? 1.5 : 2));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.78;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;

  var scene = new T.Scene();
  var camera = new T.PerspectiveCamera(68, 1, 0.05, 260);
  camera.rotation.order = 'YXZ';

  // ---- Osmon ----
  function skyMesh() {
    var sg = new T.SphereGeometry(120, 32, 16);
    var cols = [], top = new T.Color('#5b8fd1'), mid = new T.Color('#a9c8ea'), hor = new T.Color('#e8eef3');
    var p = sg.attributes.position;
    for (var i = 0; i < p.count; i++) {
      var y = p.getY(i) / 120, c = new T.Color();
      if (y > 0.25) c.copy(mid).lerp(top, Math.min(1, (y - 0.25) / 0.75)); else c.copy(hor).lerp(mid, Math.max(0, y / 0.25));
      cols.push(c.r, c.g, c.b);
    }
    sg.setAttribute('color', new T.Float32BufferAttribute(cols, 3));
    return new T.Mesh(sg, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false, depthWrite: false }));
  }
  scene.add(skyMesh());
  scene.fog = new T.Fog('#dfe7ee', 35, 110);

  // muhit yoritilishi (aks etish uchun)
  var pmrem = new T.PMREMGenerator(renderer);
  var envScene = new T.Scene();
  envScene.add(skyMesh());
  var gnd = new T.Mesh(new T.CircleGeometry(100, 16), new T.MeshBasicMaterial({ color: '#8d8a84', side: T.DoubleSide }));
  gnd.rotation.x = -Math.PI / 2; gnd.position.y = -2; envScene.add(gnd);
  var sunBall = new T.Mesh(new T.SphereGeometry(8, 12, 8), new T.MeshBasicMaterial({ color: new T.Color(6, 5.6, 5) }));
  sunBall.position.set(50, 70, 40); envScene.add(sunBall);
  var envRT = pmrem.fromScene(envScene, 0.02);
  scene.environment = envRT.texture;

  // ---- Yorug'lik ----
  var hemi = new T.HemisphereLight('#dbe8ff', '#6d675c', 0.15); scene.add(hemi);
  var sun = new T.DirectionalLight('#ffe9cf', 1.7);
  sun.position.set(9, 14, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(lowEnd ? 1024 : 2048, lowEnd ? 1024 : 2048);
  var sc = sun.shadow.camera; sc.left = -12; sc.right = 12; sc.top = 12; sc.bottom = -12; sc.near = 1; sc.far = 45;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
  scene.add(sun); scene.add(sun.target);

  var roofGroup = new T.Group(); scene.add(roofGroup);
  var inLights = [];
  for (var li = 0; li < 4; li++) {
    var pl = new T.PointLight('#fff3e2', 0, 7.5, 1.6);
    pl.position.set(0, 2.5, -L / 2 + 1.5 + li * 3);
    scene.add(pl); inLights.push(pl);
  }
  var fillIn = new T.PointLight('#fff3e2', 0, 5, 1.6); fillIn.position.set(0, 1.0, 5.2); scene.add(fillIn); inLights.push(fillIn);

  // ---- Hovli: beton, panjara, uy, daraxt ----
  var concreteTex = canvasTex(1024, 1024, function (g, w, h) {
    g.fillStyle = '#8f8b84'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 4000, 'rgba(60,58,54,A)', 0.18, 0.5, 2.2);
    speckle(g, w, h, 1500, 'rgba(240,238,232,A)', 0.2, 0.5, 2);
    speckle(g, w, h, 40, 'rgba(70,64,56,A)', 0.05, 20, 90);
    g.strokeStyle = 'rgba(50,48,44,0.35)'; g.lineWidth = 1.5;
    for (var k = 0; k < 12; k++) { g.beginPath(); var x = rnd() * w, y = rnd() * h; g.moveTo(x, y); for (var j = 0; j < 8; j++) { x += (rnd() - 0.5) * 70; y += (rnd() - 0.5) * 70; g.lineTo(x, y); } g.stroke(); }
  });
  concreteTex.wrapS = concreteTex.wrapT = T.RepeatWrapping; concreteTex.repeat.set(10, 10);
  var ground = new T.Mesh(new T.PlaneGeometry(90, 90), new T.MeshStandardMaterial({ map: concreteTex, roughness: 0.95 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.17; ground.receiveShadow = true; scene.add(ground);

  function box(w, h, d, m, x, y, z, parent, cast) {
    var b = new T.Mesh(new T.BoxGeometry(w, h, d), m); b.position.set(x, y, z);
    b.castShadow = cast !== false; b.receiveShadow = true;
    (parent || scene).add(b); return b;
  }

  // yashil panjara (ko'cha tomoni)
  var hedgeTex = canvasTex(512, 512, function (g, w, h) {
    g.fillStyle = '#25521f'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 9000; i++) {
      var c = ['#2f6b28', '#3d8a33', '#4fa33f', '#1f4a1b', '#5cb548'][i % 5];
      g.fillStyle = c; g.save(); g.translate(rnd() * w, rnd() * h); g.rotate(rnd() * 6.3);
      g.beginPath(); g.ellipse(0, 0, 6, 2.4, 0, 0, 6.3); g.fill(); g.restore();
    }
    g.strokeStyle = 'rgba(20,50,20,0.9)'; g.lineWidth = 3;
    for (var x = 0; x <= w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (var y = 0; y <= h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  });
  hedgeTex.wrapS = hedgeTex.wrapT = T.RepeatWrapping; hedgeTex.repeat.set(7, 1);
  var hedgeMat = new T.MeshStandardMaterial({ map: hedgeTex, roughness: 0.9 });
  var postMat = new T.MeshStandardMaterial({ color: '#1f4d2a', roughness: 0.5, metalness: 0.4 });
  var curbMat = new T.MeshStandardMaterial({ color: '#c9c5bc', roughness: 0.9 });
  var FX = -1.75;
  box(0.3, 0.35, 14.6, curbMat, FX, 0.0, -0.4);
  box(0.04, 1.75, 14.4, hedgeMat, FX, 1.05, -0.4);
  for (var fp = 0; fp <= 6; fp++) {
    var zz = -7.6 + fp * 2.4;
    box(0.07, 2.0, 0.07, postMat, FX, 1.0, zz);
    var ball = new T.Mesh(new T.SphereGeometry(0.05, 12, 8), postMat); ball.position.set(FX, 2.04, zz); ball.castShadow = true; scene.add(ball);
  }
  box(0.05, 0.05, 14.4, postMat, FX, 1.93, -0.4); box(0.05, 0.05, 14.4, postMat, FX, 0.2, -0.4);

  // beton ustun
  var pole = box(0.18, 7.5, 0.18, new T.MeshStandardMaterial({ color: '#b9b6ae', roughness: 0.95 }), FX - 0.35, 3.6, 1.2);

  // uy devori + qizil tom (orqa tomonda)
  var wallTex = canvasTex(512, 512, function (g, w, h) {
    g.fillStyle = '#d8d0bf'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 3000, 'rgba(120,110,95,A)', 0.08, 0.5, 2);
    g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(0, h - 60, w, 60);
  });
  wallTex.wrapS = wallTex.wrapT = T.RepeatWrapping; wallTex.repeat.set(4, 1);
  var houseMat = new T.MeshStandardMaterial({ map: wallTex, roughness: 0.95 });
  var HX = 1.95;
  box(6.3, 3.3, 17, houseMat, HX + 3.15, 1.48, -2.3);
  box(6.3, 0.35, 17, new T.MeshStandardMaterial({ color: '#ece7dc', roughness: 0.8 }), HX + 3.15, 0.01, -2.3);
  var roofMat = new T.MeshStandardMaterial({ color: '#9a3326', roughness: 0.55, metalness: 0.3 });
  var roofG = new T.BoxGeometry(4.2, 0.05, 17.6);
  var houseTop = new T.Group(); scene.add(houseTop); houseTop.add(pole);
  var r1 = new T.Mesh(roofG, roofMat); r1.position.set(HX + 1.6, 3.75, -2.3); r1.rotation.z = 0.32; r1.castShadow = true; houseTop.add(r1);
  var r2 = new T.Mesh(roofG, roofMat); r2.position.set(HX + 4.7, 3.75, -2.3); r2.rotation.z = -0.32; r2.castShadow = true; houseTop.add(r2);
  box(0.6, 0.12, 17.4, new T.MeshStandardMaterial({ color: '#f1efe9', roughness: 0.7 }), HX - 0.05, 3.1, -2.3);
  var chim = box(0.45, 1.0, 0.45, new T.MeshStandardMaterial({ color: '#9c4a33', roughness: 0.9 }), HX + 2.4, 4.2, -5, houseTop);
  var winMat = new T.MeshStandardMaterial({ color: '#30404d', roughness: 0.1, metalness: 0.6 });
  var frameMat = new T.MeshStandardMaterial({ color: '#f4f2ec', roughness: 0.6 });
  [3.2, 5.3].forEach(function (wz) {
    box(0.06, 1.35, 0.95, frameMat, HX - 0.02, 1.75, wz);
    box(0.06, 1.2, 0.8, winMat, HX - 0.05, 1.75, wz, null, false);
  });

  // uzoqdagi kulrang ikki qavatli bino
  var greyMat = new T.MeshStandardMaterial({ color: '#7f8483', roughness: 0.95 });
  box(9, 6.5, 7, greyMat, -3, 3.1, -17);
  box(9.4, 0.25, 7.4, new T.MeshStandardMaterial({ color: '#efefef', roughness: 0.7 }), -3, 6.45, -17);
  for (var wi = 0; wi < 4; wi++) for (var wj = 0; wj < 2; wj++) box(0.9, 1.3, 0.06, winMat, -6.3 + wi * 2.2, 1.6 + wj * 3, -13.47, null, false);

  // daraxt (eshik yonida)
  var tree = new T.Group(); tree.position.set(-2.55, -0.17, 7.3); scene.add(tree);
  var bark = new T.MeshStandardMaterial({ color: '#7a6a58', roughness: 0.95 });
  var trunk = new T.Mesh(new T.CylinderGeometry(0.07, 0.12, 2.6, 10), bark); trunk.position.y = 1.3; trunk.rotation.z = 0.12; trunk.castShadow = true; tree.add(trunk);
  var br = new T.Mesh(new T.CylinderGeometry(0.04, 0.06, 1.4, 8), bark); br.position.set(0.35, 2.2, 0); br.rotation.z = -0.7; br.castShadow = true; tree.add(br);
  var leafCols = ['#4f7a35', '#628f3f', '#3f6a2c', '#7aa04a'];
  var leaves = [];
  for (var lv = 0; lv < 14; lv++) {
    var lm = new T.Mesh(new T.IcosahedronGeometry(0.45 + rnd() * 0.4, 1), new T.MeshStandardMaterial({ color: leafCols[lv % 4], roughness: 0.85, flatShading: true }));
    lm.position.set((rnd() - 0.5) * 2.2, 2.6 + rnd() * 1.6, (rnd() - 0.5) * 1.8);
    lm.castShadow = true; tree.add(lm); leaves.push({ m: lm, p: rnd() * 6, y: lm.position.y });
  }
  // yerdagi barglar
  var leafG = new T.PlaneGeometry(0.06, 0.035);
  for (var fl = 0; fl < 70; fl++) {
    var lf = new T.Mesh(leafG, new T.MeshStandardMaterial({ color: ['#c9b23c', '#a7b545', '#d4a53a', '#8aa63c'][fl % 4], side: T.DoubleSide, roughness: 0.9 }));
    lf.rotation.set(-Math.PI / 2, 0, rnd() * 6.3); lf.position.set(-3.4 + rnd() * 3.4, -0.165, 6.3 + rnd() * 3.0); lf.receiveShadow = true; scene.add(lf);
  }

  // ---- Konteyner ----
  var paintTex = canvasTex(1024, 256, function (g, w, h) {
    g.fillStyle = '#3e4a6c'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 900, 'rgba(25,30,45,A)', 0.15, 1, 4);
    for (var i = 0; i < 60; i++) { var x = rnd() * w; g.fillStyle = 'rgba(110,70,40,' + (rnd() * 0.25) + ')'; g.fillRect(x, rnd() * 30, 1 + rnd() * 3, 20 + rnd() * 140); }
    for (var j = 0; j < 140; j++) { g.fillStyle = 'rgba(130,80,45,' + (0.2 + rnd() * 0.5) + ')'; g.beginPath(); g.ellipse(rnd() * w, h - rnd() * 40, 1 + rnd() * 5, 1 + rnd() * 3, 0, 0, 6.3); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,0.05)'; for (var k = 0; k < 30; k++) g.fillRect(rnd() * w, rnd() * h, 40 + rnd() * 120, 1);
  });
  paintTex.wrapS = paintTex.wrapT = T.RepeatWrapping;
  var liningTex = canvasTex(2048, 512, function (g, w, h) {
    g.fillStyle = '#dcd8cf'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 260; i++) { g.fillStyle = 'rgba(150,80,40,' + (0.25 + rnd() * 0.5) + ')'; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 0.8 + rnd() * 2.5, 0.8 + rnd() * 2, 0, 0, 6.3); g.fill(); }
    for (var s2 = 0; s2 < 90; s2++) { g.fillStyle = 'rgba(40,40,45,' + (rnd() * 0.18) + ')'; g.fillRect(rnd() * w, h * 0.3 + rnd() * h * 0.6, 2 + rnd() * 10, 10 + rnd() * 60); }
    for (var p = 0; p < 14; p++) { g.fillStyle = 'rgba(90,75,60,' + (0.15 + rnd() * 0.25) + ')'; g.fillRect(rnd() * w, h * 0.45 + rnd() * h * 0.3, 18 + rnd() * 30, 40 + rnd() * 70); }
    var gr = g.createLinearGradient(0, h, 0, h * 0.7); gr.addColorStop(0, 'rgba(70,60,50,0.35)'); gr.addColorStop(1, 'rgba(70,60,50,0)'); g.fillStyle = gr; g.fillRect(0, h * 0.7, w, h * 0.3);
  });
  liningTex.wrapS = liningTex.wrapT = T.RepeatWrapping;

  function wallMat(tex, len, hgt, color, rough, metal) {
    var t = tex.clone(); t.needsUpdate = true; t.repeat.set(1 / len, -1 / hgt); t.offset.set(0, 1 / hgt);
    return new T.MeshStandardMaterial({ map: t, color: color || '#ffffff', roughness: rough, metalness: metal || 0 });
  }
  var blockers = [];
  // uzun devorlar
  [-1, 1].forEach(function (sg) {
    var ext = new T.Mesh(corrugated(EL - 0.2, YT - YB - 0.28, 0.278, 0.036, 0.012), wallMat(paintTex, EL, YT - YB, '#ffffff', 0.62, 0.25));
    ext.rotation.y = sg > 0 ? -Math.PI / 2 : Math.PI / 2;
    if (sg > 0) ext.position.set(EW / 2 - 0.02, YB + 0.16, -EL / 2 + 0.1); else ext.position.set(-EW / 2 + 0.02, YB + 0.16, EL / 2 - 0.1);
    ext.castShadow = true; ext.receiveShadow = true; scene.add(ext); blockers.push(ext);
    var inn = new T.Mesh(corrugated(L, H, 0.278, 0.036, 0.008), wallMat(liningTex, L, H, '#ffffff', 0.85, 0.05));
    inn.rotation.y = sg > 0 ? Math.PI / 2 : -Math.PI / 2;
    if (sg > 0) inn.position.set(W / 2, 0, L / 2); else inn.position.set(-W / 2, 0, -L / 2);
    inn.receiveShadow = true; scene.add(inn);
  });
  // orqa devor
  var backE = new T.Mesh(corrugated(EW - 0.2, YT - YB - 0.28, 0.278, 0.03, 0.012), wallMat(paintTex, EW, YT - YB, '#ffffff', 0.62, 0.25));
  backE.position.set(-EW / 2 + 0.1, YB + 0.16, -EL / 2 + 0.03); backE.castShadow = true; scene.add(backE); blockers.push(backE);
  var backI = new T.Mesh(corrugated(W, H, 0.278, 0.03, 0.008), wallMat(liningTex, W, H, '#ffffff', 0.85, 0));
  backI.rotation.y = Math.PI; backI.position.set(W / 2, 0, -L / 2); backI.receiveShadow = true; scene.add(backI);
  // tom va shift
  var roof = box(EW, 0.03, EL, new T.MeshStandardMaterial({ map: (function () { var t = paintTex.clone(); t.needsUpdate = true; t.repeat.set(1, 4); return t; })(), roughness: 0.65, metalness: 0.25 }), 0, YT, 0, roofGroup);
  blockers.push(roof);
  var ceilG = corrugated(L, W, 0.3, 0.035, 0.008);
  ceilG.applyMatrix4(new T.Matrix4().set(0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1));
  var ceil = new T.Mesh(ceilG, wallMat(liningTex, L, W, '#f2efe9', 0.85, 0));
  ceil.position.set(-W / 2, H, -L / 2);
  roofGroup.add(ceil);
  box(W, 0.01, L, new T.MeshStandardMaterial({ color: '#d9d5cc', roughness: 0.9 }), 0, H + 0.03, 0, roofGroup, false);

  // ramka, burchak ustunlari
  var rust = new T.MeshStandardMaterial({ color: '#5e4433', roughness: 0.8, metalness: 0.35 });
  var rustTex = canvasTex(256, 256, function (g, w, h) {
    g.fillStyle = '#5e4433'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 600, 'rgba(150,80,40,A)', 0.5, 1, 5); speckle(g, w, h, 300, 'rgba(40,40,60,A)', 0.4, 2, 8);
  });
  rust.map = rustTex; rust.color.set('#ffffff');
  [-1, 1].forEach(function (sx) {
    [-1, 1].forEach(function (sz) { box(0.17, YT - YB + 0.02, 0.17, rust, sx * (EW / 2 - 0.05), (YT + YB) / 2, sz * (EL / 2 - 0.05)); });
    box(0.13, 0.17, EL, rust, sx * (EW / 2 - 0.03), YB + 0.085, 0);
    box(0.13, 0.12, EL, rust, sx * (EW / 2 - 0.03), YT - 0.05, 0, roofGroup);
  });
  var stripeTex = canvasTex(512, 64, function (g, w, h) {
    g.fillStyle = '#5e4433'; g.fillRect(0, 0, w, h);
    for (var x = 0; x < 6; x++) { g.save(); g.translate(150 + x * 48, 0); g.fillStyle = x % 2 ? '#141414' : '#f2b705'; g.beginPath(); g.moveTo(0, h); g.lineTo(24, 0); g.lineTo(48, 0); g.lineTo(24, h); g.fill(); g.restore(); }
  });
  box(EW, 0.22, 0.15, new T.MeshStandardMaterial({ map: stripeTex, roughness: 0.7, metalness: 0.3 }), 0, YT - 0.09, EL / 2 - 0.06, roofGroup);
  box(EW, 0.2, 0.15, rust, 0, YB + 0.1, EL / 2 - 0.06);
  // eshik ostonasi
  box(W, 0.04, 0.12, new T.MeshStandardMaterial({ color: '#41435a', roughness: 0.5, metalness: 0.5 }), 0, 0.0, L / 2 + 0.02);
  // beton bloklar (konteyner tagida)
  var blockMat = new T.MeshStandardMaterial({ color: '#b5b1a8', roughness: 0.95 });
  [-1, 1].forEach(function (sx) { [-1, 1].forEach(function (sz) { box(0.4, 0.2, 0.4, blockMat, sx * 0.95, -0.17, sz * 5.7); }); });

  // ---- Pol ----
  var floorTex = canvasTex(1024, 1024, function (g, w, h) {
    g.fillStyle = '#7f705d'; g.fillRect(0, 0, w, h);
    for (var n = 0; n < 5000; n++) { g.fillStyle = 'rgba(' + (40 + rnd() * 60 | 0) + ',' + (35 + rnd() * 40 | 0) + ',30,' + (rnd() * 0.12) + ')'; g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 26, 1 + rnd() * 2); }
    speckle(g, w, h, 160, 'rgba(45,38,30,A)', 0.25, 4, 22);
    speckle(g, w, h, 80, 'rgba(200,190,170,A)', 0.12, 3, 14);
    g.strokeStyle = 'rgba(35,26,18,0.6)'; g.lineWidth = 3;
    for (var x = 0; x <= w; x += 256) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (var y = 0; y <= h; y += 512) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    for (var bb = 0; bb < 60; bb++) { g.fillStyle = 'rgba(30,25,20,0.5)'; g.beginPath(); g.arc(((bb % 5) * 256 + 30) % w, (bb * 97) % h, 3, 0, 6.3); g.fill(); }
  });
  floorTex.wrapS = floorTex.wrapT = T.RepeatWrapping; floorTex.repeat.set(1, 5);
  var floor = new T.Mesh(new T.PlaneGeometry(W, L), new T.MeshStandardMaterial({ map: floorTex, roughness: 0.82 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = 0.001; floor.receiveShadow = true; scene.add(floor);
  box(EW, 0.155, EL, rust, 0, -0.08, 0);
  // poldagi barglar (eshik yonida)
  for (var fl2 = 0; fl2 < 14; fl2++) {
    var lf2 = new T.Mesh(leafG, new T.MeshStandardMaterial({ color: ['#c9b23c', '#a7b545', '#8aa63c'][fl2 % 3], side: T.DoubleSide, roughness: 0.9 }));
    lf2.rotation.set(-Math.PI / 2, 0, rnd() * 6.3); lf2.position.set((rnd() - 0.5) * 1.6, 0.004, 4.9 + rnd() * 1.0); scene.add(lf2);
  }

  // ---- Eshiklar ----
  var doorTex = canvasTex(1024, 2048, function (g, w, h) {
    g.fillStyle = '#3e4a6c'; g.fillRect(0, 0, w, h);
    for (var y = 60; y < h; y += 150) { var gr = g.createLinearGradient(0, y, 0, y + 75); gr.addColorStop(0, 'rgba(0,0,0,0.25)'); gr.addColorStop(1, 'rgba(255,255,255,0.06)'); g.fillStyle = gr; g.fillRect(0, y, w, 75); }
    speckle(g, w, h, 400, 'rgba(120,75,40,A)', 0.35, 1, 4);
    g.fillStyle = '#f2f2f2'; g.font = 'bold 120px sans-serif'; g.textAlign = 'left';
    g.fillText('SEGU 550123', 120, 330); g.strokeStyle = '#f2f2f2'; g.lineWidth = 7; g.strokeRect(830, 225, 90, 130); g.fillText('6', 845, 330);
    g.fillText('45G1', 120, 490);
    g.font = 'bold 60px sans-serif';
    var rows = [['MGW', '32 500 KGS'], ['', '71 650 LBS'], ['TARE', '3 830 KGS'], ['', '8 440 LBS'], ['PAYLOAD', '28 670 KGS'], ['', '63 210 LBS']];
    rows.forEach(function (r, i) { g.fillText(r[0], 120, 760 + i * 80); g.fillText(r[1], 520, 760 + i * 80); });
    g.fillStyle = '#c9a65a'; g.fillRect(640, 1300, 220, 160); g.fillStyle = '#7a6a40'; g.font = '22px sans-serif'; for (var k = 0; k < 6; k++) g.fillRect(660, 1320 + k * 22, 180, 6);
    g.fillStyle = '#f2b705'; g.beginPath(); g.moveTo(420, 1600); g.lineTo(560, 1750); g.lineTo(420, 1900); g.lineTo(280, 1750); g.closePath(); g.fill();
    g.fillStyle = '#141414'; g.font = 'bold 34px sans-serif'; g.textAlign = 'center'; g.fillText('SUPER', 420, 1740); g.fillText('HEAVY', 420, 1785);
  });
  var doorLeft = canvasTex(1024, 2048, function (g, w, h) {
    g.fillStyle = '#3e4a6c'; g.fillRect(0, 0, w, h);
    for (var y = 60; y < h; y += 150) { var gr = g.createLinearGradient(0, y, 0, y + 75); gr.addColorStop(0, 'rgba(0,0,0,0.25)'); gr.addColorStop(1, 'rgba(255,255,255,0.06)'); g.fillStyle = gr; g.fillRect(0, y, w, 75); }
    speckle(g, w, h, 400, 'rgba(120,75,40,A)', 0.35, 1, 4);
  });
  var doorInside = new T.MeshStandardMaterial({ map: liningTex, color: '#e6e2da', roughness: 0.85 });
  var doorEdge = new T.MeshStandardMaterial({ color: '#3e4a6c', roughness: 0.6, metalness: 0.3 });
  var rodMat = new T.MeshStandardMaterial({ color: '#cfcfc8', roughness: 0.45, metalness: 0.5 });
  var hingeMat = rust;
  function makeDoor(sg, tex) {
    var pivot = new T.Group(); pivot.position.set(sg * 1.2, H / 2 + 0.03, EL / 2 + 0.02);
    var dw = 1.17, dh = 2.6;
    var mats = [doorEdge, doorEdge, doorEdge, doorEdge, new T.MeshStandardMaterial({ map: tex, roughness: 0.6, metalness: 0.25 }), doorInside];
    var leaf = new T.Mesh(new T.BoxGeometry(dw, dh, 0.05), mats);
    leaf.position.set(-sg * dw / 2, 0, 0); leaf.castShadow = true; leaf.receiveShadow = true; pivot.add(leaf);
    [0.3, 0.82].forEach(function (ox) {
      var r = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, dh + 0.12, 12), rodMat);
      r.position.set(-sg * ox, 0, 0.065); r.castShadow = true; pivot.add(r);
      [-0.9, 0, 0.9].forEach(function (oy) { var cl = new T.Mesh(new T.BoxGeometry(0.07, 0.04, 0.04), rodMat); cl.position.set(-sg * ox, oy, 0.05); pivot.add(cl); });
      var hd = new T.Mesh(new T.BoxGeometry(0.22, 0.035, 0.03), rodMat); hd.position.set(-sg * (ox + 0.1), -0.25, 0.095); pivot.add(hd);
    });
    [-1.0, -0.33, 0.33, 1.0].forEach(function (oy) { var hg = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, 0.12, 10), hingeMat); hg.position.set(0, oy, 0.03); pivot.add(hg); });
    pivot.rotation.y = sg < 0 ? -1.86 : 1.86;
    scene.add(pivot);
  }
  makeDoor(-1, doorLeft); makeDoor(1, doorTex);

  var sideTex = canvasTex(1024, 256, function (g, w, h) {
    g.clearRect(0, 0, w, h); g.fillStyle = '#f1f1f1'; g.font = 'bold 120px sans-serif'; g.textAlign = 'center'; g.fillText('SEGU 550123 6', w / 2, 170);
  });
  [-1, 1].forEach(function (sg) {
    var sl = new T.Mesh(new T.PlaneGeometry(2.4, 0.6), new T.MeshStandardMaterial({ map: sideTex, transparent: true, roughness: 0.6 }));
    sl.position.set(sg * (EW / 2 + 0.03), 2.15, 4.5); sl.rotation.y = sg * Math.PI / 2; scene.add(sl);
  });

  // ---- LED chiroqlar ----
  var ledMat = new T.MeshStandardMaterial({ color: '#f5f2ea', emissive: new T.Color('#fff6e8'), emissiveIntensity: 0, roughness: 0.4 });
  var ledHouse = new T.MeshStandardMaterial({ color: '#d0d0cc', roughness: 0.5, metalness: 0.4 });
  for (var j = 0; j < 4; j++) {
    box(0.09, 0.03, 1.24, ledHouse, 0, H - 0.05, -L / 2 + 1.5 + j * 3, roofGroup, false);
    box(0.06, 0.025, 1.2, ledMat, 0, H - 0.075, -L / 2 + 1.5 + j * 3, roofGroup, false);
  }
  var cable = new T.Mesh(new T.CylinderGeometry(0.006, 0.006, L - 1, 6), new T.MeshStandardMaterial({ color: '#f3f3f3', roughness: 0.6 }));
  cable.rotation.x = Math.PI / 2; cable.position.set(0.12, H - 0.04, 0); roofGroup.add(cable);
  var switchBox = box(0.08, 0.12, 0.05, new T.MeshStandardMaterial({ color: '#efefe9', roughness: 0.5 }), -W / 2 + 0.06, 1.3, 5.6);

  // ---- Stelajlar ----
  var uprTex = canvasTex(64, 512, function (g, w, h) {
    g.fillStyle = '#2f5d8a'; g.fillRect(0, 0, w, h);
    for (var y = 8; y < h; y += 24) { g.fillStyle = '#10243a'; g.fillRect(22, y, 7, 13); g.fillRect(36, y, 7, 13); }
  });
  uprTex.wrapT = T.RepeatWrapping; uprTex.repeat.set(1, 5);
  var upright = new T.MeshStandardMaterial({ map: uprTex, roughness: 0.5, metalness: 0.35 });
  var beam = new T.MeshStandardMaterial({ color: '#e36f1c', roughness: 0.45, metalness: 0.25 });
  var deckTex = canvasTex(256, 256, function (g, w, h) {
    g.fillStyle = '#a4a8ad'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 500, 'rgba(255,255,255,A)', 0.08, 1, 4);
    speckle(g, w, h, 400, 'rgba(70,75,80,A)', 0.08, 1, 3);
    g.fillStyle = 'rgba(0,0,0,0.12)'; for (var x = 0; x < w; x += 64) g.fillRect(x, 0, 2, h);
  });
  deckTex.wrapS = deckTex.wrapT = T.RepeatWrapping; deckTex.repeat.set(1, 3);
  var deck = new T.MeshStandardMaterial({ map: deckTex, roughness: 0.55, metalness: 0.3 });
  function labelTex(text, big) {
    return canvasTex(big ? 256 : 256, big ? 128 : 96, function (g, w, h) {
      g.fillStyle = big ? '#141414' : '#fbf7ea'; g.fillRect(0, 0, w, h);
      if (!big) { g.strokeStyle = '#141414'; g.lineWidth = 4; g.strokeRect(4, 4, w - 8, h - 8); }
      g.fillStyle = big ? '#f2a33a' : '#141414';
      g.font = 'bold ' + (big ? 84 : 60) + 'px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(text, w / 2, h / 2 + 3);
    });
  }
  var cellHits = {}, cellBoxes = {};
  ['A', 'B'].forEach(function (sd) {
    var sg = sd === 'A' ? -1 : 1;
    var xf = sg * RACK_FRONT, xb = sg * (RACK_FRONT + RD - 0.03), xc = sg * (RACK_FRONT + RD / 2);
    for (var s = 0; s <= NS; s++) {
      var z = ZD - s * SL;
      box(0.06, RACK_TOP, 0.06, upright, xf, RACK_TOP / 2, z);
      box(0.06, RACK_TOP, 0.06, upright, xb, RACK_TOP / 2, z);
      for (var dy = 0.3; dy < RACK_TOP; dy += 0.6) {
        var br2 = new T.Mesh(new T.BoxGeometry(0.015, 0.7, 0.03), upright);
        br2.position.set(xc, dy + 0.3, z); br2.rotation.x = 0; br2.rotation.z = sg * 0.62 * (Math.round(dy / 0.6) % 2 ? 1 : -1);
        scene.add(br2);
      }
      [0.02].forEach(function (fy) { box(0.12, 0.01, 0.12, upright, xf, fy, z, null, false); box(0.12, 0.01, 0.12, upright, xb, fy, z, null, false); });
    }
    for (var sec = 1; sec <= NS; sec++) {
      var zc = secZ(sec);
      for (var l = 0; l < NL; l++) {
        var y = LEVELS[l];
        box(0.045, 0.085, SL - 0.06, beam, xf, y - 0.03, zc);
        box(0.045, 0.085, SL - 0.06, beam, xb, y - 0.03, zc);
        box(RD - 0.04, DECK_T, SL - 0.07, deck, xc, y + DECK_T / 2 - 0.005, zc);
        var id = sd + sec + '-' + (l + 1);
        var lp = new T.Mesh(new T.PlaneGeometry(0.17, 0.064), new T.MeshStandardMaterial({ map: labelTex(id), roughness: 0.6 }));
        lp.position.set(xf - sg * 0.024, y - 0.03, zc); lp.rotation.y = sg < 0 ? Math.PI / 2 : -Math.PI / 2; scene.add(lp);
        var top = l < NL - 1 ? LEVELS[l + 1] - 0.07 : 2.62;
        var hb = new T.Mesh(new T.BoxGeometry(RD, top - y, SL - 0.08), new T.MeshBasicMaterial());
        hb.position.set(xc, (top + y) / 2, zc); hb.visible = false; hb.userData.cell = id;
        scene.add(hb); cellHits[id] = hb;
        cellBoxes[id] = { x: xc, y: (top + y) / 2, z: zc, h: top - y, top: top, base: y };
      }
      var sp = new T.Mesh(new T.PlaneGeometry(0.34, 0.17), new T.MeshStandardMaterial({ map: labelTex(sd + sec, true), roughness: 0.5, emissive: new T.Color('#ffffff'), emissiveMap: null, emissiveIntensity: 0 }));
      sp.position.set(xf - sg * 0.035, RACK_TOP - 0.07, zc); sp.rotation.y = sg < 0 ? Math.PI / 2 : -Math.PI / 2; scene.add(sp);
    }
    box(0.045, 0.085, NS * SL, beam, xf, RACK_TOP - 0.04, (Z0 + ZD) / 2);
  });
  var sideSign = function (txt, x, rotY) {
    var t = canvasTex(512, 128, function (g, w, h) { g.fillStyle = '#141414'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2a33a'; g.font = 'bold 60px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 2); });
    var m = new T.Mesh(new T.PlaneGeometry(0.6, 0.15), new T.MeshStandardMaterial({ map: t, roughness: 0.5 }));
    m.position.set(x, 2.52, ZD + 0.04); m.rotation.y = rotY; scene.add(m);
  };
  sideSign('A \u2014 CHAP', -0.85, 0); sideSign("B \u2014 O'NG", 0.85, 0);

  // ---- Chang zarralari ----
  var DUST = lowEnd ? 260 : 520;
  var dg = new T.BufferGeometry(), dp = new Float32Array(DUST * 3), dphase = [];
  for (var di = 0; di < DUST; di++) {
    dp[di * 3] = (rnd() - 0.5) * 1.1; dp[di * 3 + 1] = 0.2 + rnd() * 2.4; dp[di * 3 + 2] = (rnd() - 0.5) * (L - 0.6);
    dphase.push(rnd() * 6.3);
  }
  dg.setAttribute('position', new T.BufferAttribute(dp, 3));
  var dustTex = canvasTex(32, 32, function (g, w, h) { var gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,250,235,1)'); gr.addColorStop(1, 'rgba(255,250,235,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  var dustMat = new T.PointsMaterial({ size: 0.009, map: dustTex, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, color: '#fff3d6' });
  var dust = new T.Points(dg, dustMat); scene.add(dust);

  // ---- Belgilash ----
  function makeMark(color, opacity) {
    var g = new T.Group();
    var fill = new T.Mesh(new T.BoxGeometry(1, 1, 1), new T.MeshBasicMaterial({ color: color, transparent: true, opacity: opacity, depthWrite: false, toneMapped: false }));
    var edges = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(1, 1, 1)), new T.LineBasicMaterial({ color: color, toneMapped: false }));
    g.add(fill); g.add(edges); g.visible = false; g.userData.fill = fill; g.userData.base = opacity; scene.add(g); return g;
  }
  function placeMark(mk, id) {
    var b = cellBoxes[id]; if (!b) { mk.visible = false; return; }
    mk.position.set(b.x, b.y, b.z); mk.scale.set(RD + 0.02, b.h + 0.01, SL - 0.04); mk.visible = true;
  }
  var selMark = makeMark('#f2a33a', 0.14);
  var hovMark = makeMark('#ffffff', 0.05);
  var hiMarks = [];

  // ---- Ma'lumot tablochasi (3D) ----
  var tipCanvas = document.createElement('canvas'); tipCanvas.width = 640; tipCanvas.height = 320;
  var tipTex = new T.CanvasTexture(tipCanvas); tipTex.encoding = T.sRGBEncoding;
  var tip = new T.Sprite(new T.SpriteMaterial({ map: tipTex, depthTest: false, transparent: true, toneMapped: false }));
  tip.scale.set(0.4, 0.2, 1); tip.renderOrder = 10; tip.visible = false; scene.add(tip);
  var tipFor = null, inventory = {};
  function drawTip(id) {
    var g = tipCanvas.getContext('2d'), w = 640, h = 320;
    g.clearRect(0, 0, w, h);
    g.fillStyle = 'rgba(16,19,23,0.92)';
    g.beginPath(); if (g.roundRect) g.roundRect(4, 4, w - 8, h - 8, 26); else g.rect(4, 4, w - 8, h - 8); g.fill();
    g.strokeStyle = '#f2a33a'; g.lineWidth = 4; g.stroke();
    g.fillStyle = '#f2a33a'; g.font = 'bold 54px monospace'; g.textBaseline = 'top'; g.fillText(id, 30, 26);
    var items = inventory[id] || [];
    g.font = '32px sans-serif'; g.fillStyle = '#9aa3ad';
    var tot = 0; items.forEach(function (it) { tot += (+it.qty || 0); });
    g.fillText(items.length ? (items.length + ' xil \u00b7 ' + tot + ' dona') : "bo'sh javon", 240, 40);
    g.font = 'bold 36px sans-serif';
    items.slice(0, 4).forEach(function (it, k) {
      g.fillStyle = '#e9ecef'; var nm = it.name; if (nm.length > 24) nm = nm.slice(0, 23) + '\u2026';
      g.fillText(nm, 30, 110 + k * 48); g.fillStyle = '#f2a33a'; g.textAlign = 'right'; g.fillText(it.qty + ' ta', w - 30, 110 + k * 48); g.textAlign = 'left';
    });
    if (items.length > 4) { g.fillStyle = '#9aa3ad'; g.font = '30px sans-serif'; g.fillText('+ yana ' + (items.length - 4), 30, 110 + 4 * 48); }
    tipTex.needsUpdate = true;
  }
  function showTip(id) {
    if (id && id !== hovered && mode !== 'top') id = null;
    if (!id) { tip.visible = false; return; }
    if (tipFor !== id) { drawTip(id); tipFor = id; }
    var b = cellBoxes[id], c = parseCell(id);
    if (mode === 'top') { tip.scale.set(2.2, 1.1, 1); tip.position.set(b.x - c.sign * 0.2, 3.3, b.z); }
    else { tip.scale.set(0.4, 0.2, 1); tip.position.set(b.x - c.sign * (RD / 2 + 0.06), b.top - 0.13, b.z); }
    tip.visible = true;
  }

  // ---- Zapchastlarni joylash ----
  var itemGroups = {}, itemSig = {}, overflow = {}, anims = [], firstLoad = true;
  function buildCell(id, items, animate) {
    if (itemGroups[id]) scene.remove(itemGroups[id]);
    var c = parseCell(id); if (!c) return;
    var grp = new T.Group(); itemGroups[id] = grp; scene.add(grp);
    var y0 = LEVELS[c.lvl - 1] + DECK_T - 0.005;
    var zStart = secZ(c.sec) + SL / 2 - 0.08;
    var avail = SL - 0.16, cursor = 0, xC = c.sign * (RACK_FRONT + RD / 2);
    var over = false, idx = 0;
    (items || []).forEach(function (it) {
      if (over) return;
      var spec = CATS[it.cat] || CATS.boshqa;
      var n = Math.max(1, Math.min(+it.qty || 1, 24));
      var per = spec.stack * spec.deep, cols = Math.ceil(n / per), placed = 0;
      var tint = TINTS[hash(it.name || '') % TINTS.length];
      for (var col = 0; col < cols; col++) {
        if (cursor + spec.w > avail) { over = true; break; }
        var zc = zStart - cursor - spec.w / 2;
        for (var k = 0; k < per && placed < n; k++, placed++) {
          var row = k % spec.deep, layer = Math.floor(k / spec.deep);
          var u = makeUnit(it.cat, tint, -c.sign, it.name || '');
          var jit = (hash(id + it.name + col + k) % 100) / 100;
          var ty = y0 + layer * spec.h;
          u.position.set(xC + (row - (spec.deep - 1) / 2) * spec.d + (jit - 0.5) * 0.012, ty, zc + (jit - 0.5) * 0.01);
          if (it.cat !== 'shina' && it.cat !== 'tormoz' && it.cat !== 'filtr') u.rotation.y = (jit - 0.5) * 0.06;
          grp.add(u);
          if (animate) { u.position.y = ty + 0.35; u.scale.setScalar(0.01); anims.push({ o: u, ty: ty, t: -idx * 0.035 }); }
          idx++;
        }
        cursor += spec.w + 0.012;
      }
      cursor += 0.05;
    });
    overflow[id] = over;
  }
  function setInventory(inv) {
    inventory = inv || {};
    var changed = false;
    CELLS.forEach(function (id) {
      var items = inventory[id] || [];
      var sig = JSON.stringify(items.map(function (i) { return [i.name, i.cat, i.qty]; }));
      if (itemSig[id] !== sig) { itemSig[id] = sig; buildCell(id, items, !firstLoad); changed = true; if (tipFor === id) tipFor = null; }
    });
    firstLoad = false;
    if (changed) renderer.shadowMap.needsUpdate = true;
    if (tip.visible) showTip(hovered || selected);
  }

  // ---- Kamera ----
  var mode = 'walk';
  var pos = new T.Vector3(0, EYE, 10.5), yaw = 0.0, pitch = -0.04;
  var vel = new T.Vector2(0, 0), bob = 0, bobAmp = 0;
  var target = null;
  var orbit = { tx: 0, ty: 0.6, tz: 0.5, r: 12, az: -0.55, el: 1.05 };
  var keys = {};
  var selected = null, hovered = null;
  var lightsOn = 0, lightT = -1;

  function allowedX(z) { return z < ZD + 0.1 ? 0.3 : (z < 6.35 ? 0.9 : 3.2); }
  function valid(x, z) {
    if (z < -L / 2 + 0.3 || z > 16) return false;
    if (x < -3.6 || x > 3.4) return false;
    if (Math.abs(x) > allowedX(z)) return false;
    if (z > 6.0 && z < 7.5 && Math.abs(x) > 0.95 && Math.abs(x) < 1.75) return false;
    var tx = x + 2.55, tz = z - 7.3; if (tx * tx + tz * tz < 0.12) return false;
    return true;
  }
  function moveBy(dx, dz) {
    if (valid(pos.x + dx, pos.z)) pos.x += dx;
    if (valid(pos.x, pos.z + dz)) pos.z += dz;
  }
  function applyCamera() {
    if (mode === 'walk') {
      camera.position.set(pos.x + Math.cos(bob) * 0.012 * bobAmp, pos.y + Math.abs(Math.sin(bob)) * 0.035 * bobAmp, pos.z);
      camera.rotation.set(pitch, yaw, Math.sin(bob) * 0.004 * bobAmp);
    } else {
      var o = orbit;
      camera.position.set(o.tx + o.r * Math.cos(o.el) * Math.sin(o.az), o.ty + o.r * Math.sin(o.el), o.tz + o.r * Math.cos(o.el) * Math.cos(o.az));
      camera.lookAt(o.tx, o.ty, o.tz);
    }
  }
  function setMode(m) {
    if (m === mode) return;
    mode = m;
    roofGroup.visible = m !== 'top'; houseTop.visible = m !== 'top';
    if (tip.visible) showTip(hovered || selected);
    if (m === 'top' && lightT < 0) lightT = 0;
    renderer.shadowMap.needsUpdate = true;
    if (opts.onMode) opts.onMode(m);
  }
  function goToCell(id) {
    var b = cellBoxes[id], c = parseCell(id); if (!b) return;
    if (mode !== 'walk') setMode('walk');
    var standX = -c.sign * 0.26;
    var dist = Math.abs(b.x - standX);
    target = { x: standX, z: b.z, yaw: c.sign < 0 ? Math.PI / 2 : -Math.PI / 2, pitch: Math.max(-0.75, Math.min(0.55, Math.atan2(b.y - EYE, dist))) };
    if (pos.z > 6.3) { pos.x = Math.max(-0.8, Math.min(0.8, pos.x)); pos.z = Math.min(pos.z, 7.0); }
  }

  // ---- Raycast ----
  var ray = new T.Raycaster(), ndc = new T.Vector2();
  var hitList = Object.keys(cellHits).map(function (k) { return cellHits[k]; });
  function pick(cx, cy) {
    var r = canvas.getBoundingClientRect();
    ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    var list = hitList.concat(blockers.filter(function (b) { return b !== roof || mode !== 'top'; }));
    var hits = ray.intersectObjects(list, false);
    if (!hits.length) return null;
    return hits[0].object.userData.cell || null;
  }

  // ---- Kiritish ----
  canvas.tabIndex = 0;
  canvas.style.outline = 'none';
  canvas.style.touchAction = 'none';
  var ptrs = {};
  function onDown(e) {
    try { canvas.focus({ preventScroll: true }); } catch (er) { /* */ }
    try { canvas.setPointerCapture(e.pointerId); } catch (er2) { /* */ }
    var r = canvas.getBoundingClientRect();
    var joy = e.pointerType === 'touch' && mode === 'walk' && (e.clientX - r.left) < r.width * 0.4;
    ptrs[e.pointerId] = { x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, moved: 0, joy: joy, t: Date.now() };
    target = null;
    if (e.pointerType === 'mouse') canvas.style.cursor = 'grabbing';
  }
  function onMove(e) {
    var p = ptrs[e.pointerId];
    if (!p) {
      if (e.pointerType === 'mouse') {
        var h = pick(e.clientX, e.clientY);
        if (h !== hovered) { hovered = h; placeMark(hovMark, h); hovMark.visible = !!h && h !== selected; showTip(h || selected); }
        canvas.style.cursor = h ? 'pointer' : 'grab';
      }
      return;
    }
    var dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY; p.moved += Math.abs(dx) + Math.abs(dy);
    if (p.joy) return;
    if (mode === 'walk') { yaw -= dx * 0.0038; pitch = Math.max(-1.3, Math.min(1.3, pitch - dy * 0.0038)); }
    else { orbit.az -= dx * 0.006; orbit.el = Math.max(0.15, Math.min(1.5, orbit.el + dy * 0.005)); }
  }
  function onUp(e) {
    var p = ptrs[e.pointerId]; delete ptrs[e.pointerId];
    if (e.pointerType === 'mouse') canvas.style.cursor = 'grab';
    if (p && p.moved < 8 && Date.now() - p.t < 600) {
      var id = pick(e.clientX, e.clientY);
      if (id) { selected = id; placeMark(selMark, id); hovMark.visible = false; showTip(id); if (opts.onSelect) opts.onSelect(id); }
    }
  }
  function onLeave() { hovMark.visible = false; hovered = null; showTip(selected); }
  function onWheel(e) {
    e.preventDefault();
    if (mode === 'walk') { var f = -e.deltaY * 0.004; moveBy(-Math.sin(yaw) * f, -Math.cos(yaw) * f); target = null; }
    else orbit.r = Math.max(4, Math.min(30, orbit.r * (1 + e.deltaY * 0.001)));
  }
  function onKey(e, v) {
    var k = (e.key || '').toLowerCase();
    var map = { w: 'f', arrowup: 'f', s: 'b', arrowdown: 'b', a: 'l', d: 'r', arrowleft: 'tl', arrowright: 'tr', shift: 'run', '\u0446': 'f', '\u044b': 'b', '\u0444': 'l', '\u0432': 'r' };
    if (map[k]) { keys[map[k]] = v; e.preventDefault(); target = null; }
  }
  var kd = function (e) { onKey(e, true); }, ku = function (e) { onKey(e, false); }, bl = function () { keys = {}; };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('keydown', kd);
  canvas.addEventListener('keyup', ku);
  canvas.addEventListener('blur', bl);
  canvas.style.cursor = 'grab';

  function resize() {
    var w = canvas.clientWidth || 640, h = canvas.clientHeight || 480;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.fov = w / h < 0.8 ? 80 : 68; camera.updateProjectionMatrix();
  }
  var ro = null;
  if (window.ResizeObserver) { ro = new ResizeObserver(resize); ro.observe(canvas); }
  resize();
  renderer.shadowMap.needsUpdate = true;

  // ---- Animatsiya ----
  var last = performance.now(), alive = true, tAll = 0;
  var flick = [0, 1, 0, 0, 1, 0.3, 1, 0, 1, 1];
  function frame(now) {
    if (!alive) return;
    var dt = Math.min(0.05, (now - last) / 1000); last = now; tAll += dt;

    if (mode === 'walk') {
      var fw = 0, st = 0;
      if (keys.f) fw += 1; if (keys.b) fw -= 1; if (keys.l) st -= 1; if (keys.r) st += 1;
      if (keys.tl) yaw += 1.8 * dt; if (keys.tr) yaw -= 1.8 * dt;
      for (var pid in ptrs) {
        var p = ptrs[pid];
        if (p.joy) { fw += Math.max(-1, Math.min(1, -(p.y - p.y0) / 60)); st += Math.max(-1, Math.min(1, (p.x - p.x0) / 60)); }
      }
      var maxS = keys.run ? 3.4 : 1.9;
      var len = Math.hypot(fw, st); if (len > 1) { fw /= len; st /= len; }
      var k = 1 - Math.pow(0.0005, dt);
      vel.x += (fw * maxS - vel.x) * k; vel.y += (st * maxS - vel.y) * k;
      var spd = Math.hypot(vel.x, vel.y);
      if (spd > 0.02) {
        moveBy((-Math.sin(yaw) * vel.x + Math.cos(yaw) * vel.y) * dt, (-Math.cos(yaw) * vel.x - Math.sin(yaw) * vel.y) * dt);
        bob += dt * spd * 5.2;
      }
      bobAmp += ((spd > 0.2 ? Math.min(1, spd / 1.9) : 0) - bobAmp) * Math.min(1, dt * 6);
      if (target) {
        var a = 1 - Math.pow(0.004, dt);
        var nx = pos.x + (target.x - pos.x) * a, nz = pos.z + (target.z - pos.z) * a;
        if (nz < ZD + 0.1 && Math.abs(nx) > 0.3) nx = Math.max(-0.3, Math.min(0.3, nx));
        var moved = Math.hypot(nx - pos.x, nz - pos.z);
        pos.x = nx; pos.z = nz; bob += moved * 9; bobAmp = Math.min(1, moved / dt / 2);
        var dyaw = target.yaw - yaw; while (dyaw > Math.PI) dyaw -= 2 * Math.PI; while (dyaw < -Math.PI) dyaw += 2 * Math.PI;
        yaw += dyaw * a; pitch += (target.pitch - pitch) * a;
        if (Math.abs(target.z - pos.z) < 0.01 && Math.abs(target.x - pos.x) < 0.01 && Math.abs(dyaw) < 0.01) target = null;
      }
      if (pos.z < 6.1 && lightT < 0) lightT = 0;
    }

    // chiroqlar yonishi
    if (lightT >= 0 && lightsOn < 1) {
      lightT += dt;
      var fi = Math.floor(lightT / 0.09);
      lightsOn = fi < flick.length ? flick[fi] * 0.95 : 1;
      if (fi >= flick.length) lightsOn = 1;
    }
    var lv = lightsOn;
    ledMat.emissiveIntensity = 2.2 * lv;
    inLights.forEach(function (pl, i) { pl.intensity = (i < 4 ? 1.9 : 0.7) * lv; });
    dustMat.opacity = 0.4 * lv;

    // chang harakati
    var arr = dg.attributes.position.array;
    for (var d = 0; d < DUST; d++) {
      var ph = dphase[d];
      arr[d * 3] += Math.sin(tAll * 0.3 + ph) * 0.0009;
      arr[d * 3 + 1] += Math.sin(tAll * 0.21 + ph * 2) * 0.0007 - 0.00012;
      arr[d * 3 + 2] += Math.cos(tAll * 0.17 + ph) * 0.0009;
      if (arr[d * 3 + 1] < 0.1) arr[d * 3 + 1] = 2.5;
    }
    dg.attributes.position.needsUpdate = true;

    // daraxt barglari tebranishi
    for (var lf3 = 0; lf3 < leaves.length; lf3++) { var Lf = leaves[lf3]; Lf.m.position.y = Lf.y + Math.sin(tAll * 1.3 + Lf.p) * 0.02; Lf.m.rotation.z = Math.sin(tAll * 0.9 + Lf.p) * 0.04; }

    // yangi zapchastlar tushishi
    for (var ai = anims.length - 1; ai >= 0; ai--) {
      var an = anims[ai]; an.t += dt;
      if (an.t <= 0) continue;
      var q = Math.min(1, an.t / 0.32), e2 = 1 - Math.pow(1 - q, 3);
      an.o.scale.setScalar(Math.max(0.01, e2 + Math.sin(q * Math.PI) * 0.08));
      an.o.position.y = an.ty + (1 - e2) * 0.35;
      if (q >= 1) { an.o.scale.setScalar(1); an.o.position.y = an.ty; anims.splice(ai, 1); }
    }

    var op = 0.5 + 0.5 * Math.sin(tAll * 4);
    hiMarks.forEach(function (m) { m.userData.fill.material.opacity = 0.1 + 0.16 * op; });
    selMark.userData.fill.material.opacity = 0.08 + 0.1 * (0.5 + 0.5 * Math.sin(tAll * 2.5));

    applyCamera();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    cells: CELLS.slice(),
    setInventory: setInventory,
    setSelected: function (id) {
      selected = id;
      if (id) { placeMark(selMark, id); showTip(id); } else { selMark.visible = false; if (!hovered) showTip(null); }
    },
    setHighlights: function (ids) {
      ids = ids || [];
      while (hiMarks.length < ids.length) hiMarks.push(makeMark('#ffe066', 0.2));
      hiMarks.forEach(function (m, i) { if (i < ids.length) placeMark(m, ids[i]); else m.visible = false; });
    },
    setMode: setMode,
    getMode: function () { return mode; },
    goToCell: goToCell,
    goToDoor: function () { setMode('walk'); target = null; vel.set(0, 0); pos.set(0, EYE, 10.5); yaw = 0; pitch = -0.04; },
    isOverflow: function (id) { return !!overflow[id]; },
    resize: resize,
    dispose: function () {
      alive = false; if (ro) ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('wheel', onWheel); canvas.removeEventListener('keydown', kd);
      canvas.removeEventListener('keyup', ku); canvas.removeEventListener('blur', bl);
      envRT.dispose(); pmrem.dispose(); renderer.dispose();
    }
  };
}

export const ContainerScene = { create: create, CELLS: CELLS, parseCell: parseCell };
