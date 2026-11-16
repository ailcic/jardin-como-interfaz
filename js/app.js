/* El jardín como interfaz — lógica de la página (tríptico, lectura, recorrido). Los contenidos están en datos.js. */
(function(){
"use strict";
var J = window.JARDIN;
var PANELS = J.PANELS, TOTAL_H = J.TOTAL_H, EJES = J.EJES, S = J.SECTORES, IMG = J.IMAGEN, REC = J.RECORRIDOS || [], F = J.FRASES;
var BY = {}; S.forEach(function(s){BY[s.id]=s;});
function $(id){ return document.getElementById(id); }
function esc(t){ return String(t).replace(/[&<>"]/g, function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
function suave(){ return matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"; }

/* ---------- geometría ----------
   El escenario se mide en píxeles de la reproducción: dos alas del mismo ancho
   y el panel central, sin separaciones. Cada ancla se ubica dentro de su panel
   por fracciones (x / ancho nominal, y / alto nominal). */
var R = IMG.recortes;
function rw(r){ return r[2]-r[0]; } function rh(r){ return r[3]-r[1]; }
var ALA = (rw(R.izq) + rw(R.der)) / 2, CEN = rw(R.cen), TW = 2*ALA + CEN, TH = (rh(R.izq) + rh(R.cen) + rh(R.der)) / 3;
var BOX = {izq:[0,ALA], cen:[ALA,CEN], ext:[ALA,CEN], der:[ALA+CEN,ALA]};
function pos(s){ var b = BOX[s.panel]; return {u: b[0] + s.x / PANELS[s.panel].w * b[1], v: s.y / TOTAL_H * TH}; }
var frame = $("frame"), lienzo = $("lienzo"), trip = $("triptych");
frame.style.aspectRatio = TW + " / " + TH;
frame.style.setProperty("--ala", (ALA/TW*100) + "%");
frame.style.setProperty("--centro", (CEN/TW*100) + "%");
frame.style.setProperty("--dorso", (CEN/2/ALA*100) + "%");
$("panelNames").style.gridTemplateColumns = (ALA/TW*100) + "% " + (CEN/TW*100) + "% " + (ALA/TW*100) + "%";

/* ---------- estado ---------- */
var state = {current:"der-arbol", closed:false, zoom:false, path:[], re:false};
var KEY = "jardin-interfaz-v1";
function limpiar(ids){ var out = []; ids.forEach(function(id){ if(BY[id] && out[out.length-1] !== id) out.push(id); }); return out; }
function load(){ try{ var raw = localStorage.getItem(KEY); if(raw){ var d = JSON.parse(raw); if(d && Array.isArray(d.path)){ state.path = limpiar(d.path.map(function(p){ return p && p.id ? p.id : p; })); state.re = !!d.re; } } }catch(e){} }
function save(){ try{ localStorage.setItem(KEY, JSON.stringify({path:state.path, re:state.re})); }catch(e){} }

/* ---------- imagen ----------
   Se carga la reproducción y, si llega, cubre el esquema SVG, que queda como
   alternativa sin red. */
var imgOK = false;
var SRC = (window.innerWidth * (window.devicePixelRatio || 1) >= 1300) ? IMG.src : IMG.ligera;
function recortar(el, r, im){
  var cw = rw(r), ch = rh(r), src = im ? im.src : SRC; im = im || IMG;
  el.style.backgroundImage = 'url("' + src + '")';
  el.style.backgroundSize = (im.w/cw*100) + "% " + (im.h/ch*100) + "%";
  el.style.backgroundPosition = (r[0]/(im.w-cw)*100) + "% " + (r[1]/(im.h-ch)*100) + "%";
}
var EXT = IMG.exterior, extOK = false;
function credito(){
  $("credito").textContent = (state.closed ? (extOK ? EXT.credito : "Exterior en esquema") : (imgOK ? IMG.credito : "Esquema")) + " · medidas aprox. 205,5 × 384,9 cm (Museo del Prado)";
}
var probe = new Image();
probe.onload = function(){
  imgOK = true;
  document.querySelectorAll(".pintura:not(.ext)").forEach(function(el){ recortar(el, R[el.dataset.panel]); });
  frame.classList.add("con-imagen");
  credito(); miniBase(); render();
};
probe.src = SRC;
if(EXT){
  var probeExt = new Image();
  probeExt.onload = function(){
    extOK = true;
    document.querySelectorAll(".pintura.ext").forEach(function(el){ recortar(el, EXT.recortes[el.dataset.panel], EXT); });
    frame.classList.add("con-exterior");
    credito(); render();
  };
  probeExt.src = EXT.src;
}

/* ---------- globo exterior ---------- */
function globeSVG(sfx){
  return '<svg viewBox="0 0 192 205.5" preserveAspectRatio="none" aria-hidden="true">'+
  '<defs><radialGradient id="gl'+sfx+'" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="var(--surface)"/><stop offset="1" stop-color="var(--gris)"/></radialGradient></defs>'+
  '<rect width="192" height="205.5" fill="var(--gris-dark)" opacity=".55"/>'+
  '<circle cx="96" cy="106" r="88" fill="url(#gl'+sfx+')" stroke="var(--gris-line)" stroke-width=".7"/>'+
  '<g fill="var(--surface)" opacity=".55"><ellipse cx="66" cy="50" rx="26" ry="7"/><ellipse cx="128" cy="44" rx="30" ry="8"/><ellipse cx="98" cy="64" rx="22" ry="5"/></g>'+
  '<path d="M18 120 Q40 98 62 108 Q80 88 100 104 Q122 86 146 102 Q164 96 174 118 Q150 140 96 142 Q42 140 18 120Z" fill="var(--gris-dark)"/>'+
  '<g stroke="var(--gris-line)" stroke-width=".6" fill="none" opacity=".7"><path d="M60 108 l0 -10 M60 98 q-4 -2 -5 2 M60 98 q4 -3 6 1"/><path d="M120 100 l0 -12 M120 88 q-5 -2 -6 3 M120 88 q5 -3 7 1"/><path d="M90 106 q4 -8 8 0"/></g>'+
  '<g stroke="var(--surface)" stroke-width=".5" opacity=".6"><path d="M70 40 L60 90"/><path d="M80 38 L78 92"/><path d="M92 36 L98 94"/></g>'+
  '<circle cx="12" cy="14" r="4" fill="var(--gris-line)" opacity=".8"/><rect x="15" y="16" width="5" height="3" fill="var(--gris-line)" opacity=".8"/>'+
  '<text x="26" y="12" font-family="Texturina, serif" font-size="4.6" fill="var(--gris-line)" letter-spacing=".3">IPSE DIXIT ET FACTA SUNT</text>'+
  '<text x="102" y="12" font-family="Texturina, serif" font-size="4.6" fill="var(--gris-line)" letter-spacing=".3">IPSE MANDAVIT ET CREATA SUNT</text>'+
  '</svg>';
}
document.querySelector('[data-globe="l"]').innerHTML = globeSVG("l");
document.querySelector('[data-globe="r"]').innerHTML = globeSVG("r");

/* ---------- puntos sobre el tríptico ---------- */
var hsWrap = $("hotspots");
S.forEach(function(s){
  var p = pos(s), xp = p.u / TW * 100, yp = p.v / TH * 100;
  var b = document.createElement("button");
  b.type = "button"; b.className = "hs"; b.dataset.id = s.id; b.dataset.panel = s.panel;
  b.style.left = xp + "%"; b.style.top = yp + "%";
  if(xp > 84) b.classList.add("edge-r"); if(xp < 14) b.classList.add("edge-l"); if(yp < 16) b.classList.add("low");
  b.innerHTML = '<span class="n" aria-hidden="true"></span><span class="tip">' + esc(s.nombre) + '</span>';
  b.addEventListener("click", function(){ go(s.id); });
  hsWrap.appendChild(b);
});

/* ---------- índice ---------- */
var idx = $("index");
["ext","izq","cen","der"].forEach(function(k){
  var col = document.createElement("div");
  var items = S.filter(function(s){return s.panel===k;});
  col.innerHTML = '<h4><span class="meta"><span class="dot" style="background:var('+PANELS[k].dot+')"></span></span>'+PANELS[k].corto+'</h4><ul>'+
    items.map(function(s){return '<li><button type="button" class="ix" data-id="'+s.id+'">'+esc(s.nombre)+'</button></li>';}).join("")+'</ul>';
  idx.appendChild(col);
});

/* ---------- mapa de ejes ---------- */
var tb = $("axisTable");
Object.keys(EJES).forEach(function(code){
  var ss = S.filter(function(s){return s.eje===code;});
  ss.forEach(function(s, i){
    var tr = document.createElement("tr");
    tr.innerHTML = (i===0 ? '<td class="code" rowspan="'+ss.length+'">'+code+'</td><td rowspan="'+ss.length+'">'+esc(EJES[code])+'</td>' : '') +
      '<td><button type="button" class="ix" data-id="'+s.id+'">'+esc(s.nombre)+'</button></td><td class="code">'+PANELS[s.panel].corto+' · '+s.x+' × '+s.y+' cm</td>';
    tb.appendChild(tr);
  });
});
document.addEventListener("click", function(e){
  var t = e.target.closest(".ix"); if(t){ go(t.dataset.id); frame.scrollIntoView({behavior:suave(), block:"start"}); }
});

/* ---------- epígrafe: la inscripción del exterior ---------- */
(function(){
  var s = BY["ext-creacion"], n = s && s.inscripcion; if(!n){ $("epigrafe").hidden = true; return; }
  $("epigrafe").innerHTML = '<span class="latin" lang="la">' + n.latin.map(function(l){ return resaltar(l, n.verbos); }).join(" · ") + '</span>' +
    '<button type="button" class="ix" data-id="' + s.id + '">' + n.trad.map(function(l){ return resaltar(l, n.verbos); }).join("; ") + '. Leer la inscripción</button>';
})();

/* ---------- recorridos propuestos ---------- */
var prop = $("propuestos");
if(REC.length){
  prop.innerHTML = '<summary>Recorridos propuestos</summary><div class="links">' + REC.map(function(r, i){
    return '<button type="button" class="link" data-i="'+i+'"><span class="arrow" aria-hidden="true">☞\uFE0E</span><span class="to">'+esc(r.nombre)+'</span><span class="why">'+esc(r.nota)+' · '+r.pasos.length+' sectores · reemplaza tu recorrido</span></button>';
  }).join("") + '</div>';
  prop.addEventListener("click", function(e){
    var b = e.target.closest(".link"); if(!b) return;
    var p = limpiar(REC[+b.dataset.i].pasos); if(!p.length) return;
    state.path = p; state.re = false; state.current = p[p.length-1]; save(); sync();
  });
} else prop.hidden = true;

/* ---------- puertas y acercamiento ---------- */
var doors = $("doors"), zoomBtn = $("zoom");
function setClosed(c){
  state.closed = c;
  trip.classList.toggle("closed", c);
  frame.classList.toggle("cerrado", c);
  doors.textContent = c ? "Abrir las puertas" : "Cerrar las puertas";
  doors.setAttribute("aria-pressed", String(c));
  document.querySelectorAll(".hs").forEach(function(h){
    var ext = h.dataset.panel === "ext";
    var hide = c ? !ext : ext;
    h.classList.toggle("gone", hide);
    h.tabIndex = hide ? -1 : 0;
  });
  $("panelNames").innerHTML = c ? '<span></span><span class="closed-name">Exterior · el mundo en grisalla</span><span></span>' : '<span>Paraíso</span><span>El jardín</span><span>Infierno</span>';
  aplicarZoom(); credito();
}
var Z = 2.2;
function aplicarZoom(){
  var on = state.zoom && !state.closed;
  frame.classList.toggle("zoom", on);
  zoomBtn.textContent = state.zoom ? "Ver el tríptico entero" : "Acercar al detalle";
  zoomBtn.setAttribute("aria-pressed", String(state.zoom));
  if(!on){ lienzo.style.transform = ""; lienzo.style.setProperty("--iz", "1"); return; }
  var p = pos(BY[state.current]);
  var tx = Math.min(0, Math.max(1 - Z, .5 - p.u/TW*Z)), ty = Math.min(0, Math.max(1 - Z, .5 - p.v/TH*Z));
  lienzo.style.transform = "translate(" + (tx*100) + "%," + (ty*100) + "%) scale(" + Z + ")";
  lienzo.style.setProperty("--iz", String(1/Z));
}
doors.addEventListener("click", function(){ setClosed(!state.closed); });
zoomBtn.addEventListener("click", function(){ state.zoom = !state.zoom; aplicarZoom(); });
$("toMap").addEventListener("click", function(){ $("mapa").scrollIntoView({behavior:suave()}); });

/* ---------- navegación ---------- */
function sync(){
  var s = BY[state.current];
  if((s.panel === "ext") !== state.closed) setClosed(s.panel === "ext"); else aplicarZoom();
  try{ history.replaceState(null, "", "#" + s.id); }catch(e){}
  render();
}
function go(id){
  if(!BY[id]) return;
  state.current = id;
  if(state.path[state.path.length-1] !== id){ state.path.push(id); save(); }
  sync();
}

/* ---------- mediación ----------
   Mediación es el camino por el que se llegó a un sector. Ningún paso llega
   sin camino. La mediación es fuerte cuando el sector anterior declara un
   reenvío con su razón; si no, es débil y plural: la sostienen varias causas
   más lejanas que se leen en lo ya recorrido. Todo se deriva de la secuencia
   de sectores, así que un recorrido compartido por enlace compone el mismo
   argumento. */
function enlace(de, a){ for(var i=0;i<de.enlaces.length;i++) if(de.enlaces[i].to === a) return de.enlaces[i]; return null; }
function autores(s){ return s.refs.map(function(r){ return r.split(/[,.(]/)[0].trim(); }); }
function del(l){ return ("de " + l).replace(/^de el /, "del "); }
function al(l){ return ("a " + l).replace(/^a el /, "al "); }
function mediacion(i){
  var path = state.path, a = BY[path[i-1]], b = BY[path[i]], l = enlace(a, b.id), c = [], k, y, hecho;
  if(l) return {fuerte:true, causas:[l.por]};
  for(k = i-2; k >= 0; k--){ y = BY[path[k]]; if(y.id !== b.id && y.id !== a.id && (l = enlace(y, b.id))){ c.push("un reenvío que había quedado abierto en «" + y.nombre + "»: " + l.por); break; } }
  if((l = enlace(b, a.id))) c.push("un reenvío declarado en sentido inverso: " + l.por);
  for(k = i-1; k >= 0; k--){ y = BY[path[k]]; if(y.id !== b.id && y.eje === b.eje){ c.push("el eje " + b.eje + ", ya abierto en «" + y.nombre + "»"); break; } }
  var au = autores(b);
  for(k = i-1, hecho = false; k >= 0 && !hecho; k--){
    y = BY[path[k]]; if(y.id === b.id) continue;
    autores(y).forEach(function(n){ if(!hecho && au.indexOf(n) >= 0){ c.push("la referencia a " + n + ", ya presente en «" + y.nombre + "»"); hecho = true; } });
  }
  c.push(a.panel === b.panel ? "la vecindad en " + PANELS[a.panel].lugar : "el paso " + del(PANELS[a.panel].lugar) + " " + al(PANELS[b.panel].lugar));
  return {fuerte:false, causas:c};
}

/* ---------- argumento ----------
   Todas las frases salen de FRASES (datos.js) y de los campos de cada sector.
   Se recuperan y se combinan por reglas; nada se genera mientras se navega. */
function lowerFirst(t){ return t.charAt(0).toLowerCase() + t.slice(1); }
function upperFirst(t){ return t.charAt(0).toUpperCase() + t.slice(1); }
function fr(t, o){ return t.replace(/\{(\w+)\}/g, function(_, k){ return o[k]; }); }
function composeArgument(){
  var seen = {}, out = [], P = F.paso;
  state.path.forEach(function(id, i){
    var s = BY[id], t, m, como;
    if(i === 0) t = fr(P.inicio, {n:s.nombre, tesis:lowerFirst(s.tesis)});
    else{
      m = mediacion(i);
      como = fr(m.fuerte ? P.fuerte : P.debil, {causas:m.causas.join("; ")});
      t = seen[id] ? fr(P.vuelta, {n:s.nombre, como:como, prev:BY[state.path[i-1]].nombre})
                   : fr(P.llegada, {como:upperFirst(como), n:s.nombre, tesis:lowerFirst(s.tesis)});
    }
    seen[id] = true;
    out.push(t);
  });
  return out;
}
function resumen(){
  var ids = {}, axes = {}, fuertes = 0, debiles = 0;
  state.path.forEach(function(id, i){ ids[id] = 1; axes[BY[id].eje] = 1; if(i > 0){ if(mediacion(i).fuerte) fuertes++; else debiles++; } });
  return {ids:ids, axes:axes, fuertes:fuertes, debiles:debiles};
}
/* La pregunta de partida es la del primer sector, salvo que el recorrido haya
   recomenzado desde el final de otro: entonces es la pregunta que aquel dejó. */
function preguntaInicial(){ var a = BY[state.path[0]]; return state.re ? a.reabre : a.pregunta; }
function preguntaNueva(){ var b = BY[state.path[state.path.length-1]]; return (state.re && state.path[0] === b.id) ? b.pregunta : b.reabre; }
/* Respuesta a medida: si el recorrido coincide paso a paso con uno propuesto
   que trae la suya, reemplaza a la del sector final, que es genérica. */
function aMedida(){
  if(state.re) return null;
  var k = state.path.join(".");
  for(var i = 0; i < REC.length; i++) if(REC[i].responde && REC[i].pasos.join(".") === k) return REC[i];
  return null;
}
function composeCierre(){
  var path = state.path; if(path.length < 2) return [];
  var b = BY[path[path.length-1]], am = aMedida();
  return [fr(path[0] === b.id ? F.cierre.circular : F.cierre.lineal, {b:b.nombre, pregunta:preguntaInicial(), breve:(am && am.breve) || b.breve, reabre:preguntaNueva()})];
}
function sentido(){
  var path = state.path, a = BY[path[0]], b = BY[path[path.length-1]], orden = {ext:0, izq:1, cen:2, der:3}, T = F.conclusion.sentido;
  var la = PANELS[a.panel].lugar, lb = PANELS[b.panel].lugar;
  if(a.id === b.id) return T.circular;
  if(a.panel === b.panel) return fr(T.mismo, {l:la});
  return fr(orden[a.panel] < orden[b.panel] ? T.favor : T.contra, {de:del(la), al:al(lb)});
}
/* Conclusión desplegada, en cuatro párrafos: la pregunta del inicio, su
   exploración en hasta tres sectores intermedios, la respuesta desde el final
   y la pregunta nueva. */
function composeConclusion(){
  var path = state.path; if(path.length < 2) return [];
  var T = F.conclusion, a = BY[path[0]], b = BY[path[path.length-1]], out = [], medios = [], visto = {}, m, am = aMedida();
  visto[a.id] = visto[b.id] = 1;
  path.forEach(function(id){ if(!visto[id]){ visto[id] = 1; medios.push(BY[id]); } });
  out.push(fr(state.re ? T.abreRe : T.abre, {a:a.nombre, pregunta:preguntaInicial(), tesis:lowerFirst(a.tesis)}));
  if(medios.length){
    var n = medios.length, elegidos = n <= 3 ? medios : [medios[0], medios[Math.floor((n-1)/2)], medios[n-1]];
    var p2 = elegidos.map(function(s, i){ return fr(T.explora[i], {n:s.nombre, explora:s.explora}); });
    if(n === 4) p2.push(T.restoUno); else if(n > 4) p2.push(fr(T.restoVarios, {k:n-3}));
    out.push(p2.join(" "));
  } else {
    m = mediacion(1);
    out.push(fr(m.fuerte ? T.directoFuerte : T.directoDebil, {causas:m.causas.join("; ")}));
  }
  out.push(fr(a.id === b.id ? T.finalCircular : T.final, {b:b.nombre, responde:am ? am.responde : b.responde}) + " " + sentido());
  out.push(fr(T.reabre, {reabre:preguntaNueva()}));
  return out;
}
function forma(){
  var r = resumen(), n = Object.keys(r.ids).length, m = state.path.length - 1, total = Object.keys(EJES).length;
  var faltan = Object.keys(EJES).filter(function(e){ return !r.axes[e]; });
  function pl(k, uno, varios){ return k + " " + (k === 1 ? uno : varios); }
  return pl(n, "sector", "sectores") + " · " + pl(m, "paso", "pasos") + ": " + r.fuertes + " por reenvío, " + r.debiles + " por el camino · " +
    (faltan.length ? (total - faltan.length) + " de " + total + " ejes (sin recorrer: " + faltan.join(", ") + ")" : "los " + total + " ejes") +
    (aMedida() ? " · respuesta redactada a medida para «" + aMedida().nombre + "»" : "");
}
function referencias(){
  var seen = {}, out = [];
  state.path.forEach(function(id){ BY[id].refs.forEach(function(r){ if(!seen[r]){ seen[r] = 1; out.push(r); } }); });
  return out.sort(function(x, y){ return x.localeCompare(y, "es"); });
}
function enlaceRecorrido(){ return location.href.split("#")[0] + "#r=" + (state.re ? "~" : "") + state.path.join("."); }

/* ---------- trazo del recorrido sobre el cuadro ---------- */
function curva(a, b, k){
  var dx = b.u - a.u, dy = b.v - a.v;
  return "M" + a.u.toFixed(1) + " " + a.v.toFixed(1) + " Q" + ((a.u+b.u)/2 - dy*k).toFixed(1) + " " + ((a.v+b.v)/2 + dx*k).toFixed(1) + " " + b.u.toFixed(1) + " " + b.v.toFixed(1);
}
function trazoSVG(arcos){
  var out = "", path = state.path, cur = BY[state.current];
  for(var i = 1; i < path.length; i++){
    var d = curva(pos(BY[path[i-1]]), pos(BY[path[i]]), .08);
    out += '<path class="caja" d="' + d + '"/><path class="' + (mediacion(i).fuerte ? "fuerte" : "debil") + '" d="' + d + '"/>';
  }
  if(arcos) cur.enlaces.forEach(function(l){ if(BY[l.to].panel !== "ext" && cur.panel !== "ext") out += '<path class="arco" d="' + curva(pos(cur), pos(BY[l.to]), -.2) + '"/>'; });
  return out;
}
function miniBase(){
  var fondo;
  if(imgOK) fondo = ["izq","cen","der"].map(function(k){
    var r = R[k], b = BOX[k];
    return '<svg x="' + b[0] + '" y="0" width="' + b[1] + '" height="' + TH + '" viewBox="' + r[0] + ' ' + r[1] + ' ' + rw(r) + ' ' + rh(r) + '" preserveAspectRatio="none"><image href="' + IMG.ligera + '" width="' + IMG.w + '" height="' + IMG.h + '"/></svg>';
  }).join("");
  else fondo = '<rect class="m-izq" x="0" y="0" width="' + ALA + '" height="' + TH + '"/><rect class="m-cen" x="' + ALA + '" y="0" width="' + CEN + '" height="' + TH + '"/><rect class="m-der" x="' + (ALA+CEN) + '" y="0" width="' + ALA + '" height="' + TH + '"/>';
  $("mini").setAttribute("viewBox", "0 0 " + TW + " " + TH);
  $("mini").innerHTML = fondo + '<rect class="velo" x="0" y="0" width="' + TW + '" height="' + TH + '"/><g id="miniTrazo"></g>';
}
$("trazo").setAttribute("viewBox", "0 0 " + TW + " " + TH);
miniBase();

/* ---------- lectura ---------- */
function detalleHTML(s){
  if(s.panel === "ext" ? !(extOK && s.inscripcion) : !imgOK) return "";
  if(s.panel === "ext") return '<figure class="detalle"><div class="recorte" id="recorte" role="img" aria-label="Detalle del exterior: la figura con el libro, arriba a la izquierda"></div><figcaption>Detalle · la figura que dice, arriba a la izquierda de la hoja izquierda</figcaption></figure>';
  return '<figure class="detalle"><div class="recorte" id="recorte" role="img" aria-label="Detalle del cuadro: ' + esc(s.nombre) + '"></div><figcaption>Detalle · ' + esc(s.ubic) + '</figcaption></figure>';
}
function pintarDetalle(s){
  var el = $("recorte"); if(!el) return;
  if(s.panel === "ext"){ var c = s.inscripcion.recorte; el.style.aspectRatio = rw(c) + " / " + rh(c); recortar(el, c, EXT); return; }
  var reg = s.reg || IMG.detalle, pw = PANELS[s.panel].w, r = R[s.panel];
  var w = Math.min(reg[0], pw), h = Math.min(reg[1], TOTAL_H);
  var x0 = Math.min(Math.max(s.x - w/2, 0), pw - w), y0 = Math.min(Math.max(s.y - h/2, 0), TOTAL_H - h);
  var px = [r[0] + x0/pw*rw(r), r[1] + y0/TOTAL_H*rh(r), r[0] + (x0+w)/pw*rw(r), r[1] + (y0+h)/TOTAL_H*rh(r)];
  el.style.aspectRatio = (px[2]-px[0]) + " / " + (px[3]-px[1]);
  recortar(el, px);
}
/* Texto escrito en el cuadro: latín, traducción y glosa, con los verbos resaltados. */
function resaltar(t, verbos){
  var h = esc(t); (verbos || []).forEach(function(v){ h = h.replace(new RegExp("(^|[^\\wáéíóú])(" + v + ")(?![\\wáéíóú])", "i"), '$1<em class="verbo">$2</em>'); });
  return h;
}
function inscripcionHTML(s){
  var n = s.inscripcion; if(!n) return "";
  return '<h3>La inscripción</h3><div class="inscripcion">' + n.latin.map(function(l, i){
      return (extOK && n.recortes ? '<div class="linea" role="img" aria-label="La inscripción tal como está pintada, línea ' + (i+1) + '"></div>' : '') + '<p class="latin" lang="la">' + resaltar(l, n.verbos) + '</p><p class="trad">' + resaltar(n.trad[i], n.verbos) + '</p>';
    }).join("") + '<p class="fuente">' + esc(n.fuente) + '</p></div><p>' + esc(n.glosa) + '</p>';
}
function renderReading(){
  var s = BY[state.current], p = PANELS[s.panel];
  var el = $("reading");
  el.innerHTML =
    '<div class="meta"><span><span class="dot" style="background:var('+p.dot+')"></span>'+esc(p.nombre)+'</span><span>'+esc(s.ubic)+'</span><span>ancla '+s.x+' × '+s.y+' cm</span></div>'+
    '<h2>'+esc(s.nombre)+'</h2>'+
    '<div class="axis"><b>'+s.eje+'</b><span>'+esc(EJES[s.eje])+'</span></div>'+
    '<p class="thesis">'+esc(s.tesis)+'</p>'+
    detalleHTML(s)+
    inscripcionHTML(s)+
    '<h3>Iconografía</h3><p>'+esc(s.icon)+'</p>'+
    '<h3>Lectura</h3><p class="lectura">'+esc(s.lectura)+'</p>'+
    '<p class="question">'+esc(s.pregunta)+'</p>'+
    '<h3>Conceptos</h3><div class="chips">'+s.conceptos.map(function(c){return '<span class="chip">'+esc(c)+'</span>';}).join("")+'</div>'+
    '<h3>Reenvíos</h3><div class="links">'+s.enlaces.map(function(l, i){var t = BY[l.to]; return '<button type="button" class="link" data-i="'+i+'"><span class="arrow" aria-hidden="true">☞\uFE0E</span><span class="to">'+esc(t.nombre)+'</span><span class="why">'+esc(l.por)+'</span></button>';}).join("")+'</div>'+
    '<h3>Referencias</h3><ul class="refs">'+s.refs.map(function(r){return '<li>'+esc(r)+'</li>';}).join("")+'</ul>';
  pintarDetalle(s);
  el.style.setProperty("--panel", "var(" + p.dot + ")");
  if(s.inscripcion && extOK) el.querySelectorAll(".linea").forEach(function(d, i){ var c = s.inscripcion.recortes[i]; d.style.aspectRatio = rw(c) + " / " + rh(c); recortar(d, c, EXT); });
  el.querySelectorAll(".link").forEach(function(b){
    b.addEventListener("click", function(){
      go(s.enlaces[+b.dataset.i].to);
      $("reading").scrollIntoView({behavior:suave(), block:"start"});
    });
  });
}

/* ---------- recorrido ---------- */
function renderPath(){
  var path = state.path, cur = BY[state.current], r = resumen();
  $("steps").innerHTML = path.map(function(id, i){
    var s = BY[id], m = i > 0 ? mediacion(i) : null;
    return '<li><span><button type="button" class="paso" data-id="'+id+'"><span class="meta" style="display:inline"><span class="dot" style="background:var('+PANELS[s.panel].dot+')"></span></span>'+esc(s.nombre)+'</button>'+
      (m ? '<span class="via">'+(m.fuerte ? 'por reenvío: ' : 'por el camino: ')+esc(m.causas.join("; "))+'</span>' : '')+'</span></li>';
  }).join("");
  var paras = composeArgument(), cierre = composeCierre(), concl = composeConclusion();
  $("partida").innerHTML = '<b>Pregunta de partida</b>' + esc(preguntaInicial());
  $("argument").innerHTML = paras.map(function(p){return '<p>'+esc(p)+'</p>';}).join("") +
    (cierre.length ? '<div class="cierre"><h4>Cierre provisorio</h4>'+cierre.map(function(p){return '<p>'+esc(p)+'</p>';}).join("")+'<p><a href="#conclusion" id="irConcl">Leer la conclusión desplegada ↓</a></p></div>' : '<p class="hint">Con el segundo sector aparece un cierre: la respuesta que el final le da a la pregunta de partida.</p>');
  $("conclTexto").innerHTML = concl.length ? '<p class="forma">'+esc(forma())+'</p>' + concl.map(function(p){return '<p>'+esc(p)+'</p>';}).join("")
    : '<p class="hint">La conclusión se compone cuando el recorrido tiene al menos dos sectores: responde, desde el último, la pregunta del primero.</p>';
  $("reabrir").hidden = !concl.length;
  if(concl.length) $("reabrir").textContent = "Recomenzar desde «" + BY[path[path.length-1]].nombre + "» con la nueva pregunta";
  $("cSect").textContent = Object.keys(r.ids).length;
  $("cAxes").textContent = Object.keys(r.axes).length;
  $("cLinks").textContent = r.fuertes;
  $("undo").disabled = path.length < 2;

  var orden = {}; path.forEach(function(id, i){ if(!orden[id]) orden[id] = i + 1; });
  document.querySelectorAll(".hs").forEach(function(h){
    var s = BY[h.dataset.id], l = enlace(cur, s.id);
    h.classList.toggle("on", s.id === cur.id); h.classList.toggle("seen", !!orden[s.id]); h.classList.toggle("dest", !!l);
    h.querySelector(".n").textContent = orden[s.id] || "";
    h.setAttribute("aria-label", s.nombre + ". Eje: " + EJES[s.eje] + (orden[s.id] ? ". Paso " + orden[s.id] + " de tu recorrido" : "") + (l ? ". Reenvío desde el sector actual: " + l.por : ""));
  });
  document.querySelectorAll(".ix").forEach(function(h){ h.classList.toggle("on", h.dataset.id === cur.id); h.classList.toggle("seen", !!orden[h.dataset.id]); });

  $("trazo").innerHTML = trazoSVG(true);
  var pc = pos(cur);
  $("miniTrazo").innerHTML = trazoSVG(false) + path.map(function(id){ var p = pos(BY[id]); return '<circle class="nodo" cx="'+p.u.toFixed(1)+'" cy="'+p.v.toFixed(1)+'" r="'+(TW/130).toFixed(1)+'"/>'; }).join("") +
    '<circle class="actual" cx="'+pc.u.toFixed(1)+'" cy="'+pc.v.toFixed(1)+'" r="'+(TW/85).toFixed(1)+'"/>';
}
function render(){ renderReading(); renderPath(); }

$("steps").addEventListener("click", function(e){ var b = e.target.closest(".paso"); if(b) go(b.dataset.id); });

var st = $("status");
function avisar(t){ st.textContent = t; setTimeout(function(){ if(st.textContent === t) st.textContent = ""; }, 3500); }
function copiar(text, ok){
  function fallback(){ var r = document.createRange(); r.selectNodeContents($("argument")); var sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); avisar("No se pudo copiar: seleccioná el texto y usá Ctrl+C"); }
  try{ navigator.clipboard.writeText(text).then(function(){ avisar(ok); }, fallback); }catch(e){ fallback(); }
}
$("copyArg").addEventListener("click", function(){
  var concl = composeConclusion();
  var text = composeArgument().join("\n\n") + (concl.length ? "\n\nConclusión\n\n" + concl.join("\n\n") : "");
  text += "\n\nReferencias\n" + referencias().join("\n") + "\n\nRecorrido: " + enlaceRecorrido();
  copiar(text, "Argumento copiado, con sus referencias");
});
$("copyLink").addEventListener("click", function(){ copiar(enlaceRecorrido(), "Enlace al recorrido copiado"); });
$("undo").addEventListener("click", function(){
  if(state.path.length < 2) return;
  state.path.pop(); state.current = state.path[state.path.length-1]; save(); sync();
});
$("resetPath").addEventListener("click", function(){ state.path = [state.current]; state.re = false; save(); sync(); });
/* Reinicia el ciclo: el final pasa a ser el inicio y su pregunta nueva, la pregunta de partida. */
$("reabrir").addEventListener("click", function(){
  var re = preguntaNueva() === BY[state.current].reabre;
  state.path = [state.current]; state.re = re; save(); sync();
  frame.scrollIntoView({behavior:suave(), block:"start"});
});
$("argument").addEventListener("click", function(e){
  if(e.target.id === "irConcl"){ e.preventDefault(); $("conclusion").scrollIntoView({behavior:suave(), block:"start"}); }
});

/* ---------- inicio ----------
   #sector abre un sector y lo suma al recorrido guardado; #r=a.b.c abre un
   recorrido compartido, que reemplaza al guardado. #r=~a.b.c indica que el
   recorrido recomenzó en «a» con la pregunta que dejó uno anterior. */
function leerHash(){
  var h = decodeURIComponent((location.hash || "").replace("#", ""));
  if(h.indexOf("r=") === 0){ var re = h.charAt(2) === "~", p = limpiar(h.slice(re ? 3 : 2).split(".")); if(p.length) return {path:p, re:re}; }
  return BY[h] ? {id:h} : null;
}
load();
var ini = leerHash();
if(ini && ini.path){ state.path = ini.path; state.re = ini.re; }
else if(ini && state.path[state.path.length-1] !== ini.id) state.path.push(ini.id);
if(!state.path.length) state.path.push("der-arbol");
state.current = state.path[state.path.length-1];
save();
setClosed(BY[state.current].panel === "ext");
sync();
window.addEventListener("hashchange", function(){
  var h = leerHash(); if(!h) return;
  if(h.path){ state.path = h.path; state.re = h.re; state.current = h.path[h.path.length-1]; save(); sync(); }
  else if(h.id !== state.current) go(h.id);
});
})();
