/* ============================================================
   PRECISION BUILD v4.0  —  script.js  (Fixed)
   ============================================================ */
'use strict';

/* ── 1. SCHEDULE DATA ───────────────────────────────────── */
const SCHEDULE = [
  { start:'09:00', end:'09:20', type:'routine',  badge:'ROUTINE',   dur:'20m',    name:'Wake & Morning Activation',
    desc:'500 ml water before standing. Remain seated upright 5 minutes before rising. No phone or screen. Dress fully before entering workspace.' },
  { start:'09:20', end:'10:30', type:'planning', badge:'PLANNING',  dur:'70m',    name:'Day Planning and Session Review',
    desc:'Review prior session close note. Set precise completion targets for Sessions A and B. Eliminate all ambiguity before the nap.' },
  { start:'10:30', end:'11:00', type:'prep',     badge:'PREP',      dur:'30m',    name:'Pre-Nap Wind-Down',
    desc:'Reduce screen exposure. Lower physiological arousal. Light movement. No high-stimulation content. Prepare nap environment.' },
  { start:'11:00', end:'11:20', type:'nap',      badge:'NAP',       dur:'20m',    name:'Nap 01 — Prophylactic (20 min)',
    desc:'Pre-fatigue nap. Stage 1 to 2 sleep only. Pre-loads alertness by 15 to 20 percent versus skipping. Alarm set. First task written before sleeping.' },
  { start:'11:20', end:'11:30', type:'routine',  badge:'ROUTINE',   dur:'10m',    name:'Nap Recovery and Session Launch',
    desc:'Remain still 3 minutes. Hydrate. Enter workspace with first task already documented.' },
  { start:'11:30', end:'13:30', type:'deepwork', badge:'DEEP WORK', dur:'2h',     name:'Session A — Deep Work',
    desc:'Late-morning executive peak. Highest prefrontal cortex availability window of the day. Single-task only. No communication tools open. No interruptions.' },
  { start:'13:30', end:'14:00', type:'meal',     badge:'MEAL',      dur:'30m',    name:'Lunch',
    desc:'Complete workspace departure. Eat sitting down with no screens. Step outside briefly if possible. Mandatory psychological break from work context.' },
  { start:'14:00', end:'16:15', type:'deepwork', badge:'DEEP WORK', dur:'2h 15m', name:'Session B — Deep Work',
    desc:'Builds directly on Session A while project context is still warm in working memory. Context-loading overhead is near zero.' },
  { start:'16:15', end:'17:15', type:'nap',      badge:'NAP',       dur:'60m',    name:'Nap 02 — Power Nap (60 min)',
    desc:'Primary recovery instrument. Completes one full NREM cycle: N1 to N2 to early N3. Consolidates Block I output. Resets working memory buffer.' },
  { start:'17:15', end:'19:15', type:'buffer',   badge:'BUFFER',    dur:'2h',     name:'Buffer — Personal Time',
    desc:'Zero work. Physical movement, personal administration, non-work activity. Mandatory cognitive separation before evening block.' },
  { start:'19:15', end:'19:35', type:'nap',      badge:'NAP',       dur:'20m',    name:'Nap 03 — Prime Nap (20 min)',
    desc:'Ignition nap. Sharpens reaction time, working memory retrieval, and sustained attention. Do not exceed 20 minutes — Stage 3 causes sleep inertia.' },
  { start:'19:35', end:'19:45', type:'routine',  badge:'ROUTINE',   dur:'10m',    name:'Evening Session Launch',
    desc:'Hydrate. Review Block II session target. Write one clear deliverable before starting.' },
  { start:'19:45', end:'21:45', type:'deepwork', badge:'DEEP WORK', dur:'2h',     name:'Session C — Deep Work',
    desc:'First evening sprint. Often the highest-quality creative output window of the day. No dinner yet. Maximum focus window.' },
  { start:'21:45', end:'22:15', type:'dinner',   badge:'DINNER',    dur:'30m',    name:'Dinner — Fixed Anchor',
    desc:'Non-negotiable fixed anchor. Bisects the evening block. Metabolic refuelling between Session C sprint and Sessions D and E.' },
  { start:'22:15', end:'00:15', type:'deepwork', badge:'DEEP WORK', dur:'2h',     name:'Session D — Deep Work',
    desc:'Two-hour post-dinner sprint. Refuelled metabolic state enables a second wind. Frequently yields strong analytical output.' },
  { start:'00:15', end:'01:15', type:'deepwork', badge:'DEEP WORK', dur:'1h',     name:'Session E — Deep Work',
    desc:'Final focused sprint. Close all open threads. Write explicit session close note at 01:15 — not a summary, a precise re-entry point.' },
  { start:'01:15', end:'01:20', type:'winddown', badge:'WINDDOWN',  dur:'5m',     name:'Session Close and Documentation',
    desc:'Write next-action record. A precise re-entry point only — this releases the task from active cognitive processing loops and protects sleep onset.' },
  { start:'01:20', end:'02:15', type:'winddown', badge:'WINDDOWN',  dur:'55m',    name:'Wind-Down Protocol',
    desc:'Physical release, journaling, sensory quieting. Zero phone, work, gaming, or bright overhead lighting after 01:15 AM.' },
  { start:'02:15', end:'09:00', type:'sleep',    badge:'SLEEP',     dur:'6h 45m', name:'Core Sleep',
    desc:'6 hours 45 minutes. Full sleep cycle completion required. Alarm at 09:00. Non-negotiable sleep boundary.' },
];

const CAT_COLOUR = {
  deepwork:'#0057A8', nap:'#6B3FA0', sleep:'#1A3A6B', buffer:'#BF360C',
  meal:'#2E7D32', dinner:'#2E7D32', routine:'#546E7A', planning:'#546E7A',
  prep:'#546E7A', winddown:'#C8102E',
};

const CAT_LABEL = {
  deepwork:'Deep Work', nap:'Nap Protocol', sleep:'Core Sleep',
  buffer:'Buffer', meal:'Meal', dinner:'Dinner',
  routine:'Routine', planning:'Planning', prep:'Preparation', winddown:'Wind-Down',
};

const ALLOC_DATA = [
  { cat:'Deep Work',          slot:'11:30 to 01:15 (5 sessions)', mins:540, colour:'#0057A8' },
  { cat:'Core Sleep',         slot:'02:15 to 09:00',              mins:405, colour:'#1A3A6B' },
  { cat:'Buffer and Personal',slot:'16:15 to 19:15',              mins:120, colour:'#BF360C' },
  { cat:'Wind-Down and Plan', slot:'01:15 to 02:15 plus planning', mins:130, colour:'#C8102E' },
  { cat:'Nap Protocols',      slot:'Three nap events',            mins:100, colour:'#6B3FA0' },
  { cat:'Meals',              slot:'13:30 lunch and 21:45 dinner',mins: 60, colour:'#2E7D32' },
  { cat:'Routine and Prep',   slot:'09:00 to 09:20 and pre-nap', mins: 85,  colour:'#546E7A' },
];

/* ── 2. TIME UTILITIES ──────────────────────────────────── */
function parseMins(str) {
  const parts = str.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}
function nowMins() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
function fmtDuration(totalMins) {
  const m = Math.max(0, totalMins);
  const h = Math.floor(m / 60), mm = m % 60;
  if (h === 0) return mm + 'm';
  return mm === 0 ? h + 'h' : h + 'h ' + mm + 'm';
}
function timerFmt(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}
/* Correctly detects if raw now (0-1439) falls inside a schedule slot */
function inSlot(now, rawStart, rawEnd) {
  if (rawEnd <= rawStart) {
    /* slot crosses midnight: e.g. 22:15 -> 00:15 */
    return now >= rawStart || now < rawEnd;
  }
  return now >= rawStart && now < rawEnd;
}
function slotDuration(rawStart, rawEnd) {
  if (rawEnd <= rawStart) return rawEnd + 1440 - rawStart;
  return rawEnd - rawStart;
}
function minutesElapsed(now, rawStart, rawEnd) {
  if (rawEnd <= rawStart) {
    /* crosses midnight */
    if (now >= rawStart) return now - rawStart;
    return now + 1440 - rawStart;
  }
  return Math.max(0, now - rawStart);
}

/* ── 3. CLOCK ───────────────────────────────────────────── */
function updateClock() {
  const d   = new Date();
  const pad = function(n) { return String(n).padStart(2, '0'); };
  const t   = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const ds = DAYS[d.getDay()] + ', ' + pad(d.getDate()) + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();

  const q = function(id) { return document.getElementById(id); };
  const clk = q('utilClock'), dt = q('utilDate'), fc = q('footerClock');
  if (clk) clk.textContent = t;
  if (dt)  dt.textContent  = ds;
  if (fc)  fc.textContent  = t;
}

/* ── 4. NAV ─────────────────────────────────────────────── */
function initNav() {
  const nav = document.getElementById('primaryNav');
  const bar = document.getElementById('navScrollBar');
  const ham = document.getElementById('hamburger');
  const mob = document.getElementById('mobileDrawer');

  window.addEventListener('scroll', function() {
    var scrolled = window.scrollY;
    var total    = document.body.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
    if (nav) nav.classList.toggle('scrolled', scrolled > 20);
  }, { passive: true });

  if (ham && mob) {
    ham.addEventListener('click', function() {
      var isOpen = mob.classList.toggle('open');
      mob.style.display = isOpen ? 'flex' : 'none';
    });
    mob.querySelectorAll('.md-link').forEach(function(link) {
      link.addEventListener('click', function() {
        mob.classList.remove('open');
        mob.style.display = 'none';
      });
    });
  }

  /* Active nav link on scroll */
  var sections = Array.from(document.querySelectorAll('section[id]'));
  var links    = Array.from(document.querySelectorAll('a.nl'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          links.forEach(function(l) { l.classList.remove('active'); });
          var match = document.querySelector('a.nl[href="#' + e.target.id + '"]');
          if (match) match.classList.add('active');
        }
      });
    }, { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' });
    sections.forEach(function(s) { io.observe(s); });
  }
}

/* ── 5. HERO COUNTER ANIMATION ──────────────────────────── */
function animateCounter(el) {
  var target  = parseInt(el.dataset.target, 10);
  var current = 0;
  var step    = Math.max(1, target / 50);
  var id = setInterval(function() {
    current = Math.min(current + step, target);
    el.textContent = Math.round(current);
    if (current >= target) clearInterval(id);
  }, 25);
}
function initCounters() {
  var els = document.querySelectorAll('[data-target]');
  if (!('IntersectionObserver' in window)) {
    els.forEach(animateCounter);
    return;
  }
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        animateCounter(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  els.forEach(function(el) { io.observe(el); });
}

/* ── 6. SCROLL REVEAL ───────────────────────────────────── */
function initReveal() {
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    /* Fallback: show all immediately */
    items.forEach(function(el) { el.classList.add('in-view'); });
    return;
  }
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e, i) {
      if (e.isIntersecting) {
        var el = e.target;
        setTimeout(function() { el.classList.add('in-view'); }, i * 55);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  items.forEach(function(el) { io.observe(el); });
}

/* ── 7. CYCLE SVG DIAGRAM ───────────────────────────────── */
function buildCycleDiagram() {
  var svg = document.getElementById('cycleSvg');
  if (!svg) return;

  var CX = 210, CY = 210, R = 168, R2 = 110, R3 = 62;
  var NS = 'http://www.w3.org/2000/svg';

  function mkEl(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function(k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function polar(angleDeg, r) {
    var rad = angleDeg * Math.PI / 180;
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
  }
  function toAngle(timeStr) {
    return (parseMins(timeStr) / 1440) * 360 - 90;
  }
  function arcPath(sa, ea, outerR, innerR) {
    var gap = 1.0;
    var s1 = polar(sa + gap, outerR), e1 = polar(ea - gap, outerR);
    var s2 = polar(ea - gap, innerR), e2 = polar(sa + gap, innerR);
    var large = (ea - sa) > 180 ? 1 : 0;
    return 'M' + s1.x + ',' + s1.y +
           ' A' + outerR + ',' + outerR + ' 0 ' + large + ' 1 ' + e1.x + ',' + e1.y +
           ' L' + s2.x + ',' + s2.y +
           ' A' + innerR + ',' + innerR + ' 0 ' + large + ' 0 ' + e2.x + ',' + e2.y + ' Z';
  }

  /* Defs + filter */
  var defs = mkEl('defs', {});
  var filt = mkEl('filter', { id:'redGlow', x:'-50%', y:'-50%', width:'200%', height:'200%' });
  var blur = mkEl('feGaussianBlur', { stdDeviation:'2', result:'b' });
  var merg = mkEl('feMerge', {});
  var mn1  = mkEl('feMergeNode', { in:'b' });
  var mn2  = mkEl('feMergeNode', { in:'SourceGraphic' });
  merg.appendChild(mn1); merg.appendChild(mn2);
  filt.appendChild(blur); filt.appendChild(merg);
  defs.appendChild(filt);
  svg.appendChild(defs);

  /* Background ring */
  svg.appendChild(mkEl('circle', { cx:CX, cy:CY, r:R, fill:'none', stroke:'#EEF1F4', 'stroke-width':'52' }));

  /* Hour ticks and labels */
  for (var h = 0; h < 24; h++) {
    var a = (h / 24) * 360 - 90;
    var major = (h % 6 === 0);
    var p1 = polar(a, R + 3), p2 = polar(a, R + (major ? 18 : 10));
    svg.appendChild(mkEl('line', {
      x1:p1.x, y1:p1.y, x2:p2.x, y2:p2.y,
      stroke: major ? '#7A8899' : '#D8DDE3',
      'stroke-width': major ? '1.5' : '0.8'
    }));
    if (major) {
      var tp = polar(a, R + 28);
      var txt = mkEl('text', {
        x: tp.x, y: tp.y,
        'text-anchor':'middle', 'dominant-baseline':'middle',
        'font-family':'Roboto Mono, monospace', 'font-size':'9',
        fill:'#7A8899'
      });
      txt.textContent = String(h).padStart(2, '0') + 'h';
      svg.appendChild(txt);
    }
  }

  /* Schedule arcs */
  SCHEDULE.forEach(function(item) {
    var rawS = parseMins(item.start), rawE = parseMins(item.end);
    var sa   = toAngle(item.start);
    var ea   = toAngle(item.end);
    if (rawE <= rawS) ea += 360; /* midnight crossing */
    var colour = CAT_COLOUR[item.type] || '#546E7A';
    var path   = mkEl('path', { d: arcPath(sa, ea, R, R2), fill: colour, opacity:'0.72' });
    var title  = document.createElementNS(NS, 'title');
    title.textContent = item.name + ' (' + item.start + ' to ' + item.end + ')';
    path.appendChild(title);
    svg.appendChild(path);
  });

  /* Inner white fill */
  svg.appendChild(mkEl('circle', { cx:CX, cy:CY, r:R3, fill:'#FFFFFF', stroke:'#EEF1F4', 'stroke-width':'1' }));

  /* Centre labels */
  var labels = [
    { text:'PRECISION', y: CY - 13, size:'9', weight:'700', fill:'#0A1628' },
    { text:'BUILD',     y: CY + 3,  size:'9', weight:'700', fill:'#0A1628' },
    { text:'v4.0',      y: CY + 18, size:'8', weight:'400', fill:'#7A8899' },
  ];
  labels.forEach(function(l) {
    var t = mkEl('text', {
      x: CX, y: l.y, 'text-anchor':'middle',
      'font-family':'Source Sans 3, sans-serif',
      'font-size': l.size, 'font-weight': l.weight, fill: l.fill
    });
    t.textContent = l.text;
    svg.appendChild(t);
  });

  /* Live clock hand */
  function drawHand() {
    var old1 = document.getElementById('cycleHand');
    var old2 = document.getElementById('cycleDot');
    if (old1) old1.parentNode.removeChild(old1);
    if (old2) old2.parentNode.removeChild(old2);
    var ang = (nowMins() / 1440) * 360 - 90;
    var ph1 = polar(ang, R3 - 6), ph2 = polar(ang, R + 10);
    var hand = mkEl('line', {
      id:'cycleHand', x1:ph1.x, y1:ph1.y, x2:ph2.x, y2:ph2.y,
      stroke:'#C8102E', 'stroke-width':'2', 'stroke-linecap':'round',
      filter:'url(#redGlow)'
    });
    var dot = mkEl('circle', {
      id:'cycleDot', cx:CX, cy:CY, r:'4',
      fill:'#C8102E', filter:'url(#redGlow)'
    });
    svg.appendChild(hand);
    svg.appendChild(dot);
  }
  drawHand();
  setInterval(drawHand, 60000);

  /* Legend */
  var legendData = [
    { type:'deepwork', label:'Deep Work'   },
    { type:'nap',      label:'Nap Protocol'},
    { type:'sleep',    label:'Core Sleep'  },
    { type:'buffer',   label:'Buffer'      },
    { type:'meal',     label:'Meals'       },
    { type:'winddown', label:'Wind-Down'   },
  ];
  var lg = document.getElementById('cycleLegend');
  if (lg) {
    legendData.forEach(function(ld) {
      var item = document.createElement('div');
      item.className = 'cl-item-row';
      var swatch = document.createElement('div');
      swatch.className = 'cl-swatch';
      swatch.style.background = CAT_COLOUR[ld.type];
      var lbl = document.createTextNode(ld.label);
      item.appendChild(swatch);
      item.appendChild(lbl);
      lg.appendChild(item);
    });
  }
}

/* ── 8. ARCHITECTURE TABLE ──────────────────────────────── */
function buildArchTable() {
  var tb = document.querySelector('#archTable tbody');
  if (!tb) return;

  ALLOC_DATA.forEach(function(row) {
    var pct = (row.mins / 1440 * 100).toFixed(1);
    var tr  = document.createElement('tr');

    /* Category cell with colour swatch */
    var td1 = document.createElement('td');
    var sw  = document.createElement('span');
    sw.className = 'at-swatch';
    sw.style.background = row.colour;
    td1.appendChild(sw);
    td1.appendChild(document.createTextNode(' ' + row.cat));
    tr.appendChild(td1);

    /* Remaining cells */
    var vals = [row.slot, fmtDuration(row.mins), pct + '%'];
    vals.forEach(function(v) {
      var td = document.createElement('td');
      td.textContent = v;
      tr.appendChild(td);
    });
    tb.appendChild(tr);
  });

  /* Total row */
  var totalTr = document.createElement('tr');
  totalTr.className = 'at-total';
  var c1 = document.createElement('td');
  c1.setAttribute('colspan', '2');
  c1.textContent = 'Total Verified';
  var c2 = document.createElement('td');
  c2.textContent = '24h 00m';
  var c3 = document.createElement('td');
  c3.textContent = '100%';
  totalTr.appendChild(c1); totalTr.appendChild(c2); totalTr.appendChild(c3);
  tb.appendChild(totalTr);
}

function buildStackedBar() {
  var bar = document.getElementById('stackedBar');
  var leg = document.getElementById('stackedLegend');
  if (!bar || !leg) return;

  ALLOC_DATA.forEach(function(row) {
    var pct = (row.mins / 1440) * 100;

    var seg = document.createElement('div');
    seg.className = 'sb-seg';
    seg.style.width = pct + '%';
    seg.style.background = row.colour;
    seg.title = row.cat + ': ' + fmtDuration(row.mins) + ' (' + pct.toFixed(1) + '%)';
    bar.appendChild(seg);

    var li = document.createElement('div');
    li.className = 'sbl-item';
    var dot = document.createElement('span');
    dot.className = 'sbl-dot';
    dot.style.background = row.colour;
    li.appendChild(dot);
    li.appendChild(document.createTextNode(row.cat + ': ' + fmtDuration(row.mins)));
    leg.appendChild(li);
  });
}

/* ── 9. SCHEDULE TABLE ──────────────────────────────────── */
function buildScheduleTable() {
  var tbody = document.getElementById('schedBody');
  if (!tbody) return;

  SCHEDULE.forEach(function(item, idx) {
    var tr = document.createElement('tr');
    tr.dataset.idx  = idx;
    tr.dataset.type = item.type;

    /* Time cell */
    var tdTime = document.createElement('td');
    var timeMain = document.createElement('div');
    timeMain.className = 'st-time';
    timeMain.textContent = item.start;
    var timeEnd = document.createElement('div');
    timeEnd.className = 'st-time-end';
    timeEnd.textContent = 'to ' + item.end;
    tdTime.appendChild(timeMain);
    tdTime.appendChild(timeEnd);
    tr.appendChild(tdTime);

    /* Duration cell */
    var tdDur = document.createElement('td');
    tdDur.className = 'st-dur';
    tdDur.textContent = item.dur;
    tr.appendChild(tdDur);

    /* Badge cell */
    var tdBadge = document.createElement('td');
    var badge = document.createElement('span');
    badge.className = 'st-badge badge-' + item.type;
    badge.textContent = item.badge;
    tdBadge.appendChild(badge);
    tr.appendChild(tdBadge);

    /* Activity name cell */
    var tdName = document.createElement('td');
    var actName = document.createElement('div');
    actName.className = 'st-act-name';
    actName.id = 'act-name-' + idx;
    actName.textContent = item.name;
    tdName.appendChild(actName);
    tr.appendChild(tdName);

    /* Description cell */
    var tdDesc = document.createElement('td');
    tdDesc.className = 'st-act-desc';
    tdDesc.textContent = item.desc;
    tr.appendChild(tdDesc);

    tbody.appendChild(tr);
  });

  /* Filter buttons */
  document.querySelectorAll('.fb').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.fb').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.dataset.filter;
      var count = 0;
      document.querySelectorAll('#schedBody tr').forEach(function(row) {
        var t = row.dataset.type;
        var show = f === 'all'
          || (f === 'deepwork' && t === 'deepwork')
          || (f === 'nap'      && t === 'nap')
          || (f === 'meal'     && (t === 'meal' || t === 'dinner'))
          || (f === 'buffer'   && t === 'buffer')
          || (f === 'routine'  && (t === 'routine' || t === 'planning' || t === 'prep'))
          || (f === 'winddown' && t === 'winddown');
        row.classList.toggle('is-hidden', !show);
        if (show) count++;
      });
      var sc = document.getElementById('schedCount');
      if (sc) sc.textContent = count;
    });
  });
}

/* ── 10. PHASE DETECTION (fixed midnight logic) ─────────── */
function detectPhase() {
  var now = nowMins(); /* 0 – 1439 */
  for (var i = 0; i < SCHEDULE.length; i++) {
    var rawS = parseMins(SCHEDULE[i].start);
    var rawE = parseMins(SCHEDULE[i].end);
    if (inSlot(now, rawS, rawE)) {
      return {
        item: SCHEDULE[i],
        idx:  i,
        rawS: rawS,
        rawE: rawE,
        next: SCHEDULE[(i + 1) % SCHEDULE.length]
      };
    }
  }
  /* Fallback — return first slot */
  return {
    item: SCHEDULE[0],
    idx:  0,
    rawS: parseMins(SCHEDULE[0].start),
    rawE: parseMins(SCHEDULE[0].end),
    next: SCHEDULE[1]
  };
}

function updateLivePanel() {
  var phase = detectPhase();
  var item = phase.item, rawS = phase.rawS, rawE = phase.rawE;
  var now  = nowMins();

  var dur     = slotDuration(rawS, rawE);
  var elapsed = minutesElapsed(now, rawS, rawE);
  elapsed     = Math.min(elapsed, dur);
  var pct     = dur > 0 ? Math.round((elapsed / dur) * 100) : 0;

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }
  function setWidth(id, w) {
    var el = document.getElementById(id);
    if (el) el.style.width = w + '%';
  }

  setText('livePhName', item.name);
  setText('livePhCat',  (CAT_LABEL[item.type] || item.type).toUpperCase());
  setWidth('phProgFill', pct);
  setText('phStart',     item.start);
  setText('phPct',       pct + '%');
  setText('phEnd',       item.end);
  setText('lmElapsed',   fmtDuration(elapsed));
  setText('lmRemaining', fmtDuration(dur - elapsed));
  setText('lmNext',      phase.next ? phase.next.name : 'End of Cycle');

  /* Time to next */
  var nextS   = parseMins(phase.next.start);
  var toNext  = nextS - now;
  if (toNext < 0) toNext += 1440;
  setText('lmStartsIn', fmtDuration(toNext));

  /* Daily progress: 09:00 (540 mins) to 02:15 next day (540 + 1035 = 1575 wrapped) */
  var dayStart = 540, daySpan = 1035;
  var nowW     = (now < 540) ? now + 1440 : now;
  var dayPct   = Math.min(100, Math.max(0, Math.round(((nowW - dayStart) / daySpan) * 100)));
  setWidth('dayFill', dayPct);
  setText('dayPct',   dayPct + '%');

  /* Highlight schedule table row */
  document.querySelectorAll('#schedBody tr').forEach(function(row) {
    row.classList.remove('is-active-row');
    var ri   = parseInt(row.dataset.idx, 10);
    var rRawS = parseMins(SCHEDULE[ri].start);
    var rRawE = parseMins(SCHEDULE[ri].end);
    var rElap = minutesElapsed(now, rRawS, rRawE);
    var rDur  = slotDuration(rRawS, rRawE);
    var isPast = ri !== phase.idx && rElap >= rDur;
    row.classList.toggle('is-past-row', isPast);
  });

  var activeRow = document.querySelector('#schedBody tr[data-idx="' + phase.idx + '"]');
  if (activeRow) {
    activeRow.classList.add('is-active-row');
    activeRow.classList.remove('is-past-row');
    /* Add NOW badge if missing */
    var nameEl = document.getElementById('act-name-' + phase.idx);
    if (nameEl && !nameEl.querySelector('.st-now-badge')) {
      var nb = document.createElement('span');
      nb.className = 'st-now-badge';
      nb.textContent = 'NOW';
      nameEl.appendChild(nb);
    }
  }
  /* Remove stale NOW badges */
  document.querySelectorAll('.st-now-badge').forEach(function(b) {
    var row = b.closest('tr');
    if (row && parseInt(row.dataset.idx, 10) !== phase.idx) {
      row.removeChild ? b.remove() : (b.parentNode && b.parentNode.removeChild(b));
    }
  });
}

/* ── 11. NAP TIMER ──────────────────────────────────────── */
var timerState = {
  total:    1200,
  remaining:1200,
  running:  false,
  interval: null,
  name:     'NAP 01 — Prophylactic',
  circum:   528  /* 2 * PI * 84 = 527.8 */
};

function renderTimerUI() {
  var pct    = timerState.remaining / timerState.total;
  var offset = timerState.circum * (1 - pct);

  var disp  = document.getElementById('timerDisplay');
  var ring  = document.getElementById('timerRing');
  var state = document.getElementById('timerState');
  var name  = document.getElementById('timerName');

  if (disp)  disp.textContent = timerFmt(timerState.remaining);
  if (ring)  ring.setAttribute('stroke-dashoffset', offset);
  if (name)  name.textContent = timerState.name;
  if (state) {
    if (timerState.running)                                  state.textContent = 'RUNNING';
    else if (timerState.remaining === 0)                     state.textContent = 'COMPLETE';
    else if (timerState.remaining === timerState.total)      state.textContent = 'READY';
    else                                                     state.textContent = 'PAUSED';
  }
}

function initTimer() {
  /* Nap selector */
  document.querySelectorAll('.nsb').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.nsb').forEach(function(b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      var dur  = parseInt(btn.dataset.dur, 10);
      var name = btn.getAttribute('data-name') || 'Nap Protocol';
      if (timerState.running) {
        clearInterval(timerState.interval);
        timerState.running = false;
      }
      timerState.total     = dur;
      timerState.remaining = dur;
      timerState.name      = name;
      var msgEl = document.getElementById('timerMsg');
      if (msgEl) msgEl.textContent = name + ' selected. Press Start when ready.';
      var pauseBtn = document.getElementById('btnPause');
      var startBtn = document.getElementById('btnStart');
      if (pauseBtn) pauseBtn.disabled = true;
      if (startBtn) startBtn.disabled = false;
      renderTimerUI();
    });
  });

  /* Start */
  var btnStart = document.getElementById('btnStart');
  if (btnStart) {
    btnStart.addEventListener('click', function() {
      if (timerState.remaining === 0) timerState.remaining = timerState.total;
      timerState.running = true;
      btnStart.disabled = true;
      var pb = document.getElementById('btnPause');
      if (pb) pb.disabled = false;
      var msgEl = document.getElementById('timerMsg');
      if (msgEl) msgEl.textContent = 'Timer running. Lie down and close your eyes. An audible chime will sound on completion.';

      timerState.interval = setInterval(function() {
        if (timerState.remaining > 0) {
          timerState.remaining--;
          renderTimerUI();
        }
        if (timerState.remaining === 0) {
          clearInterval(timerState.interval);
          timerState.running = false;
          var pb2 = document.getElementById('btnPause');
          var sb2 = document.getElementById('btnStart');
          if (pb2) pb2.disabled = true;
          if (sb2) sb2.disabled = false;
          var msgEl2 = document.getElementById('timerMsg');
          if (msgEl2) msgEl2.textContent = 'Nap complete. Remain still for 3 minutes before rising. Hydrate.';
          playChime();
          renderTimerUI();
        }
      }, 1000);
    });
  }

  /* Pause */
  var btnPause = document.getElementById('btnPause');
  if (btnPause) {
    btnPause.addEventListener('click', function() {
      clearInterval(timerState.interval);
      timerState.running = false;
      btnPause.disabled = true;
      var sb = document.getElementById('btnStart');
      if (sb) sb.disabled = false;
      var msgEl = document.getElementById('timerMsg');
      if (msgEl) msgEl.textContent = 'Timer paused. Press Start to resume.';
      renderTimerUI();
    });
  }

  /* Reset */
  var btnReset = document.getElementById('btnReset');
  if (btnReset) {
    btnReset.addEventListener('click', function() {
      clearInterval(timerState.interval);
      timerState.running   = false;
      timerState.remaining = timerState.total;
      var pb = document.getElementById('btnPause');
      var sb = document.getElementById('btnStart');
      if (pb) pb.disabled = true;
      if (sb) sb.disabled = false;
      var msgEl = document.getElementById('timerMsg');
      if (msgEl) msgEl.textContent = 'Timer reset. Press Start when ready.';
      renderTimerUI();
    });
  }

  renderTimerUI();
}

function playChime() {
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[440, 0], [554, 0.35], [659, 0.7], [554, 1.1]].forEach(function(pair) {
      var freq  = pair[0], delay = pair[1];
      var osc   = ctx.createOscillator();
      var gain  = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + delay + 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.75);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.85);
    });
  } catch (err) { /* AudioContext unavailable — silent completion */ }
}

/* ── 12. ANALYTICS: ALLOCATION BARS ────────────────────── */
function buildAllocChart() {
  var container = document.getElementById('allocChart');
  if (!container) return;

  ALLOC_DATA.forEach(function(row) {
    var pct = (row.mins / 1440 * 100).toFixed(1);
    var div = document.createElement('div');
    div.className = 'alloc-row';

    var labelEl = document.createElement('div');
    labelEl.className = 'alloc-label';
    labelEl.textContent = row.cat;

    var track = document.createElement('div');
    track.className = 'alloc-track';
    var fill = document.createElement('div');
    fill.className = 'alloc-fill';
    fill.style.background = row.colour;
    fill.style.width = '0%';
    fill.dataset.pct = pct;
    track.appendChild(fill);

    var val = document.createElement('div');
    val.className = 'alloc-val';
    val.textContent = fmtDuration(row.mins);

    div.appendChild(labelEl);
    div.appendChild(track);
    div.appendChild(val);
    container.appendChild(div);
  });

  /* Animate bars on scroll into view */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.alloc-fill').forEach(function(f) {
            f.style.width = f.dataset.pct + '%';
          });
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    io.observe(container);
  } else {
    container.querySelectorAll('.alloc-fill').forEach(function(f) {
      f.style.width = f.dataset.pct + '%';
    });
  }
}

/* ── 13. ANALYTICS: SESSION BARS ────────────────────────── */
function buildSessionChart() {
  var container = document.getElementById('sessionChart');
  if (!container) return;

  var sessions = [
    { id:'A', block:'11:30 to 13:30', mins:120 },
    { id:'B', block:'14:00 to 16:15', mins:135 },
    { id:'C', block:'19:45 to 21:45', mins:120 },
    { id:'D', block:'22:15 to 00:15', mins:120 },
    { id:'E', block:'00:15 to 01:15', mins: 60 },
  ];
  var maxMins = 135;

  sessions.forEach(function(s) {
    var heightPct = Math.round((s.mins / maxMins) * 100);
    var col = document.createElement('div');
    col.className = 'sb-col';

    var dur = document.createElement('div');
    dur.className = 'sb-dur';
    dur.textContent = s.mins + 'm';

    var bar = document.createElement('div');
    bar.className = 'sb-bar';
    bar.style.height = '0%';
    bar.dataset.targetH = heightPct;

    var lbl = document.createElement('div');
    lbl.className = 'sb-lbl';
    lbl.textContent = 'SESSION ' + s.id;

    var blk = document.createElement('div');
    blk.className = 'sb-blk';
    blk.textContent = s.block;

    col.appendChild(dur);
    col.appendChild(bar);
    col.appendChild(lbl);
    col.appendChild(blk);
    container.appendChild(col);
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.sb-bar').forEach(function(b) {
            b.style.height = b.dataset.targetH + '%';
          });
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    io.observe(container);
  } else {
    container.querySelectorAll('.sb-bar').forEach(function(b) {
      b.style.height = b.dataset.targetH + '%';
    });
  }
}

/* ── 14. ANALYTICS: COGNITIVE CURVE ─────────────────────── */
function buildCognitiveCurve() {
  var svg = document.getElementById('cognitiveSvg');
  if (!svg) return;
  var NS = 'http://www.w3.org/2000/svg';

  var W = 900, H = 220;
  var pL = 36, pR = 20, pT = 28, pB = 32;
  var iW = W - pL - pR, iH = H - pT - pB;
  var SPAN = 1035; /* 09:00 to 02:15 = 17h 15m */

  function mkEl(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function(k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function mkTxt(tag, attrs, txt) {
    var e = mkEl(tag, attrs);
    e.textContent = txt;
    return e;
  }
  var sx = function(t) { return pL + (t / SPAN) * iW; };
  var sy = function(v) { return pT + iH - (v / 100) * iH; };

  /* Gradient */
  var defs = mkEl('defs', {});
  var grad = mkEl('linearGradient', { id:'cogGrad', x1:'0', y1:'0', x2:'0', y2:'1' });
  var s1   = mkEl('stop', { offset:'0%',   'stop-color':'#0057A8', 'stop-opacity':'0.2' });
  var s2   = mkEl('stop', { offset:'100%', 'stop-color':'#0057A8', 'stop-opacity':'0.02' });
  grad.appendChild(s1); grad.appendChild(s2);
  defs.appendChild(grad);
  svg.appendChild(defs);

  /* Grid lines */
  [25, 50, 75, 100].forEach(function(v) {
    var y = sy(v);
    svg.appendChild(mkEl('line', { x1:pL, y1:y, x2:W - pR, y2:y, stroke:'#EEF1F4', 'stroke-width':'1' }));
    svg.appendChild(mkTxt('text', {
      x: pL - 5, y: y + 4, 'text-anchor':'end',
      'font-family':'Roboto Mono, monospace', 'font-size':'8', fill:'#B0BAC5'
    }, v + '%'));
  });

  /* Data points [minutes from 09:00, intensity] */
  var pts = [
    [0,18],[40,26],[90,36],[120,28],[145,54],[185,74],[245,84],
    [285,80],[335,72],[375,20],[430,16],[490,22],[555,22],[615,70],
    [645,88],[690,84],[730,76],[765,66],[840,58],[855,28],[872,24],
    [905,74],[935,68],[965,62],[995,54],[1020,44],[1035,28]
  ];

  /* Area fill */
  var areaD = pts.map(function(p, i) {
    return (i === 0 ? 'M' : 'L') + sx(p[0]) + ',' + sy(p[1]);
  }).join(' ') + ' L' + sx(pts[pts.length-1][0]) + ',' + (pT + iH) + ' L' + sx(0) + ',' + (pT + iH) + ' Z';
  svg.appendChild(mkEl('path', { d: areaD, fill:'url(#cogGrad)' }));

  /* Line */
  var lineD = pts.map(function(p, i) {
    return (i === 0 ? 'M' : 'L') + sx(p[0]) + ',' + sy(p[1]);
  }).join(' ');
  svg.appendChild(mkEl('path', {
    d: lineD, fill:'none', stroke:'#0057A8',
    'stroke-width':'2.5', 'stroke-linejoin':'round', 'stroke-linecap':'round'
  }));

  /* Nap markers */
  [[120, 'Nap 01'], [375, 'Nap 02'], [615, 'Nap 03']].forEach(function(pair) {
    var t = pair[0], label = pair[1], x = sx(t);
    svg.appendChild(mkEl('line', {
      x1:x, y1:pT, x2:x, y2:pT + iH,
      stroke:'#C8102E', 'stroke-width':'1.5', 'stroke-dasharray':'5 3', opacity:'0.75'
    }));
    svg.appendChild(mkEl('circle', { cx:x, cy:pT + iH, r:'4', fill:'#C8102E' }));
    svg.appendChild(mkTxt('text', {
      x: x + 4, y: pT + 14,
      'font-family':'Roboto Mono, monospace', 'font-size':'8.5', fill:'#C8102E'
    }, label));
  });

  /* Meal markers */
  [[270, 'Lunch'], [765, 'Dinner']].forEach(function(pair) {
    var t = pair[0], label = pair[1], x = sx(t);
    svg.appendChild(mkEl('line', {
      x1:x, y1:pT, x2:x, y2:pT + iH,
      stroke:'#2E7D32', 'stroke-width':'1', 'stroke-dasharray':'4 4', opacity:'0.5'
    }));
    svg.appendChild(mkTxt('text', {
      x: x + 4, y: pT + 26,
      'font-family':'Roboto Mono, monospace', 'font-size':'8.5', fill:'#2E7D32'
    }, label));
  });
}

/* ── 15. ANALYTICS: NAP STAGE ARCHITECTURE ──────────────── */
function buildNapStages() {
  var svg = document.getElementById('napStageSvg');
  if (!svg) return;
  var NS = 'http://www.w3.org/2000/svg';

  var pX = 24, pY = 40, rowH = 40, gap = 30;
  var trackW = 780;

  function mkEl(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function(k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function mkTxt(tag, attrs, txt) {
    var e = mkEl(tag, attrs);
    e.textContent = txt;
    return e;
  }

  var naps = [
    {
      label:'NAP 01 — Prophylactic', window:'11:00 to 11:20', dur:20,
      stages:[{s:'N1',d:8,c:'#6B9FD4'},{s:'N2',d:12,c:'#0057A8'}]
    },
    {
      label:'NAP 02 — Power Nap', window:'16:15 to 17:15', dur:60,
      stages:[{s:'N1',d:8,c:'#6B9FD4'},{s:'N2',d:20,c:'#0057A8'},{s:'N3',d:22,c:'#003F7F'},{s:'N2',d:10,c:'#0057A8'}]
    },
    {
      label:'NAP 03 — Prime Nap', window:'19:15 to 19:35', dur:20,
      stages:[{s:'N1',d:7,c:'#6B9FD4'},{s:'N2',d:13,c:'#0057A8'}]
    }
  ];

  naps.forEach(function(nap, ni) {
    var y     = pY + ni * (rowH + gap);
    var scale = trackW / nap.dur;

    /* Row label */
    svg.appendChild(mkTxt('text', {
      x: pX, y: y - 9,
      'font-family':'Roboto Mono, monospace', 'font-size':'9.5',
      'font-weight':'500', fill:'#0057A8', 'letter-spacing':'0.5'
    }, nap.label + '  |  ' + nap.window + '  |  ' + nap.dur + ' min'));

    /* Background track */
    svg.appendChild(mkEl('rect', {
      x:pX, y:y, width:trackW, height:rowH,
      fill:'#F4F6F8', stroke:'#D8DDE3', 'stroke-width':'1', rx:'2'
    }));

    /* Stage segments */
    var cx = pX;
    nap.stages.forEach(function(st) {
      var sw = st.d * scale;
      svg.appendChild(mkEl('rect', {
        x: cx, y: y, width: Math.max(sw - 1, 1), height: rowH,
        fill: st.c, rx:'1', opacity:'0.88'
      }));
      if (sw > 18) {
        svg.appendChild(mkTxt('text', {
          x: cx + sw / 2, y: y + rowH / 2 + 4,
          'text-anchor':'middle',
          'font-family':'Roboto Mono, monospace',
          'font-size':'11', 'font-weight':'600', fill:'#FFFFFF'
        }, st.s));
      }
      cx += sw;
    });

    /* Duration label on right */
    svg.appendChild(mkTxt('text', {
      x: pX + trackW + 12, y: y + rowH / 2 + 4,
      'font-family':'Roboto Mono, monospace', 'font-size':'11', fill:'#546E7A'
    }, nap.dur + 'm'));
  });
}

/* ── 16. BOOT ───────────────────────────────────────────── */
function init() {
  updateClock();
  setInterval(updateClock, 1000);

  initNav();
  initCounters();
  initReveal();

  buildCycleDiagram();
  buildArchTable();
  buildStackedBar();
  buildScheduleTable();
  buildAllocChart();
  buildSessionChart();
  buildCognitiveCurve();
  buildNapStages();
  initTimer();

  updateLivePanel();
  /* Update live panel every second for the progress bar, every 30s for phase detection */
  setInterval(function() {
    var el = document.getElementById('phProgFill');
    if (el) updateLivePanel();
  }, 10000);
}

document.addEventListener('DOMContentLoaded', init);
