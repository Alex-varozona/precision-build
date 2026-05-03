/* ============================================================
   PRECISION BUILD v4.0 — script.js
   Institutional Interface Logic
   ============================================================ */

'use strict';

/* ── SCHEDULE DATA ──────────────────────────────────────── */
const SCHEDULE = [
  { start:'09:00', end:'09:20', name:'Wake & Morning Activation',        type:'routine',  badge:'ROUTINE',    dur:'20m',   durMin:20,  desc:'500ml water before standing. Seated upright 5 minutes. No phone. Dress fully before entering workspace.' },
  { start:'09:20', end:'10:30', name:'Day Planning & Session Review',    type:'planning', badge:'PLANNING',   dur:'70m',   durMin:70,  desc:'Review prior session close note. Set precise completion targets for Sessions A and B. Eliminate all ambiguity before the nap.' },
  { start:'10:30', end:'11:00', name:'Pre-Nap Wind-Down',                type:'prep',     badge:'PREP',       dur:'30m',   durMin:30,  desc:'Reduce screen exposure. Lower arousal state. Light movement. No high-stimulation content. Prepare nap environment.' },
  { start:'11:00', end:'11:20', name:'Nap 01 — Prophylactic (20 min)',   type:'nap',      badge:'NAP',        dur:'20m',   durMin:20,  desc:'Pre-fatigue nap. Stage 1–2 sleep only. Pre-loads alertness by 15–20% vs. skipping. Alarm set. First task written before sleeping.' },
  { start:'11:20', end:'11:30', name:'Nap Recovery & Session Launch',    type:'routine',  badge:'ROUTINE',    dur:'10m',   durMin:10,  desc:'Remain still 3 minutes. Hydrate. Enter workspace with first task already documented.' },
  { start:'11:30', end:'13:30', name:'Session A — Deep Work',            type:'deepwork', badge:'DEEP WORK',  dur:'2h',    durMin:120, desc:'Late-morning executive peak. Highest prefrontal cortex availability. Single-task only. No communication tools. No interruptions.' },
  { start:'13:30', end:'14:00', name:'Lunch',                            type:'meal',     badge:'MEAL',       dur:'30m',   durMin:30,  desc:'Complete workspace departure. Eat sitting, no screens. Step outside if possible. Mandatory psychological break from work context.' },
  { start:'14:00', end:'16:15', name:'Session B — Deep Work',            type:'deepwork', badge:'DEEP WORK',  dur:'2h 15m',durMin:135, desc:'Builds directly on Session A while project context is still warm in working memory. Context-loading overhead near zero.' },
  { start:'16:15', end:'17:15', name:'Nap 02 — Power Nap (60 min)',      type:'nap',      badge:'NAP',        dur:'60m',   durMin:60,  desc:'Primary recovery instrument. Completes one full NREM cycle: N1→N2→early N3. Consolidates Block I output. Resets working memory buffer.' },
  { start:'17:15', end:'19:15', name:'Buffer — Personal Time',           type:'buffer',   badge:'BUFFER',     dur:'2h',    durMin:120, desc:'Zero work. Physical movement, personal administration, non-work activity. Mandatory cognitive separation before evening block.' },
  { start:'19:15', end:'19:35', name:'Nap 03 — Prime Nap (20 min)',      type:'nap',      badge:'NAP',        dur:'20m',   durMin:20,  desc:'Ignition nap. Sharpens reaction time, WM retrieval, sustained attention. Do not exceed 20 minutes — stage 3 causes inertia.' },
  { start:'19:35', end:'19:45', name:'Evening Session Launch',           type:'routine',  badge:'ROUTINE',    dur:'10m',   durMin:10,  desc:'Hydrate. Review Block II session target. One clear deliverable written before starting.' },
  { start:'19:45', end:'21:45', name:'Session C — Deep Work',            type:'deepwork', badge:'DEEP WORK',  dur:'2h',    durMin:120, desc:'First evening sprint. Often the highest-quality creative output of the day. No dinner at this stage. Maximum focus window.' },
  { start:'21:45', end:'22:15', name:'Dinner (Fixed Anchor)',            type:'dinner',   badge:'DINNER',     dur:'30m',   durMin:30,  desc:'Non-negotiable fixed anchor. Bisects the evening block. Metabolic refuelling between Session C sprint and Sessions D+E.' },
  { start:'22:15', end:'00:15', name:'Session D — Deep Work',            type:'deepwork', badge:'DEEP WORK',  dur:'2h',    durMin:120, desc:'Two-hour post-dinner sprint. Refuelled metabolic state. Second-wind phenomenon frequently observed in this session.' },
  { start:'00:15', end:'01:15', name:'Session E — Deep Work',            type:'deepwork', badge:'DEEP WORK',  dur:'1h',    durMin:60,  desc:'Final focused sprint. Close all open threads. Write explicit session close note at 01:15 — not a summary, a precise re-entry point.' },
  { start:'01:15', end:'01:20', name:'Session Close & Documentation',    type:'winddown', badge:'WINDDOWN',   dur:'5m',    durMin:5,   desc:'Write next-action record. Precise re-entry point only. Releases task from active cognitive processing loops and protects sleep onset.' },
  { start:'01:20', end:'02:15', name:'Wind-Down Protocol',               type:'winddown', badge:'WINDDOWN',   dur:'55m',   durMin:55,  desc:'Physical release → journaling → sensory quieting. Zero phone, work, gaming, or bright overhead lighting after 01:15 AM.' },
  { start:'02:15', end:'09:00', name:'Core Sleep',                       type:'sleep',    badge:'SLEEP',      dur:'6h 45m',durMin:405, desc:'6 hours 45 minutes. Full sleep cycle completion required. Alarm at 09:00. Non-negotiable sleep boundary.' },
];

/* Category palette — institutional colours */
const CAT_COLOUR = {
  deepwork: '#0057A8',
  nap:      '#6B3FA0',
  sleep:    '#1A3A6B',
  buffer:   '#BF360C',
  meal:     '#2E7D32',
  dinner:   '#2E7D32',
  routine:  '#546E7A',
  planning: '#546E7A',
  prep:     '#546E7A',
  winddown: '#C8102E',
};

const CAT_LABEL = {
  deepwork:'Deep Work', nap:'Nap Protocol', sleep:'Core Sleep',
  buffer:'Buffer', meal:'Meal', dinner:'Dinner',
  routine:'Routine', planning:'Planning', prep:'Preparation',
  winddown:'Wind-Down',
};

/* ── TIME UTILITIES ─────────────────────────────────────── */
function parseMins(str) {
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
}
function nowMins() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
function fmtMins(m) {
  if (m < 0) m = 0;
  const h = Math.floor(m / 60), mm = m % 60;
  if (h === 0) return `${mm}m`;
  return mm === 0 ? `${h}h` : `${h}h ${mm}m`;
}
function timerFmt(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}
function getSlotMins(item) {
  let s = parseMins(item.start), e = parseMins(item.end);
  if (e <= s) e += 1440;
  return { s, e, dur: e - s };
}

/* ── CLOCK ──────────────────────────────────────────────── */
function updateClock() {
  const d   = new Date();
  const pad = n => String(n).padStart(2,'0');
  const t   = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const ds  = `${days[d.getDay()]}, ${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;

  const clk = document.getElementById('utilClock');
  const dt  = document.getElementById('utilDate');
  const fc  = document.getElementById('footerClock');
  if (clk) clk.textContent = t;
  if (dt)  dt.textContent  = ds;
  if (fc)  fc.textContent  = t;
}

/* ── NAV: SCROLL PROGRESS + ACTIVE LINKS ───────────────── */
function initNav() {
  const nav  = document.getElementById('primaryNav');
  const bar  = document.getElementById('navScrollBar');
  const ham  = document.getElementById('hamburger');
  const mob  = document.getElementById('mobileDrawer');

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.body.scrollHeight - window.innerHeight;
    const pct      = total > 0 ? (scrolled / total) * 100 : 0;
    if (bar) bar.style.width = pct + '%';
    if (nav) nav.classList.toggle('scrolled', scrolled > 20);
  }, { passive: true });

  if (ham && mob) {
    ham.addEventListener('click', () => {
      const open = mob.classList.toggle('open');
      mob.style.display = open ? 'flex' : 'none';
    });
    mob.querySelectorAll('.md-link').forEach(link => {
      link.addEventListener('click', () => {
        mob.classList.remove('open');
        mob.style.display = 'none';
      });
    });
  }

  // Highlight active nav link based on scroll position
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('a.nl');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`a.nl[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.35, rootMargin: '-80px 0px 0px 0px' });
  sections.forEach(s => io.observe(s));
}

/* ── COUNTER ANIMATION ──────────────────────────────────── */
function animateCounters() {
  document.querySelectorAll('[data-target]').forEach(el => {
    const target = +el.dataset.target;
    let current  = 0;
    const step   = Math.max(1, target / 45);
    const id = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.round(current);
      if (current >= target) clearInterval(id);
    }, 28);
  });
}

/* ── SCROLL REVEAL ──────────────────────────────────────── */
function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('in-view'), i * 60);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ── CYCLE SVG DIAGRAM ──────────────────────────────────── */
function buildCycleDiagram() {
  const svg = document.getElementById('cycleSvg');
  if (!svg) return;
  const cx = 210, cy = 210, R = 168, r2 = 110, r3 = 62;

  function toAngle(timeStr) {
    return (parseMins(timeStr) / 1440) * 360 - 90;
  }
  function polar(a, r) {
    const rad = a * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  function arcPath(sa, ea, outerR, innerR) {
    const gap  = 0.8;
    const s1   = polar(sa + gap, outerR), e1 = polar(ea - gap, outerR);
    const s2   = polar(ea - gap, innerR), e2 = polar(sa + gap, innerR);
    const large = (ea - sa) > 180 ? 1 : 0;
    return `M${s1.x},${s1.y} A${outerR},${outerR} 0 ${large} 1 ${e1.x},${e1.y}
            L${s2.x},${s2.y} A${innerR},${innerR} 0 ${large} 0 ${e2.x},${e2.y} Z`;
  }
  function el(tag, attrs) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k,v]) => e.setAttribute(k, v));
    return e;
  }

  // Background ring
  svg.appendChild(el('circle', { cx, cy, r: R, fill:'none', stroke:'#EEF1F4', 'stroke-width':'52' }));

  // Hour tick marks
  for (let h = 0; h < 24; h++) {
    const a = (h / 24) * 360 - 90;
    const major = h % 6 === 0;
    const p1 = polar(a, R + 3), p2 = polar(a, R + (major ? 18 : 10));
    svg.appendChild(el('line', {
      x1:p1.x, y1:p1.y, x2:p2.x, y2:p2.y,
      stroke: major ? '#B0BAC5' : '#D8DDE3',
      'stroke-width': major ? 1.5 : 0.8
    }));
    if (major) {
      const tp = polar(a, R + 28);
      const t  = el('text', {
        x:tp.x, y:tp.y, 'text-anchor':'middle', 'dominant-baseline':'middle',
        'font-family':'Roboto Mono,monospace', 'font-size':'9',
        fill:'#B0BAC5', 'letter-spacing':'0'
      });
      t.textContent = String(h).padStart(2,'0') + 'h';
      svg.appendChild(t);
    }
  }

  // Schedule arcs
  SCHEDULE.forEach(item => {
    let sa = toAngle(item.start), ea = toAngle(item.end);
    if (ea <= sa) ea += 360;
    const col  = CAT_COLOUR[item.type] || '#546E7A';
    const path = el('path', { d: arcPath(sa, ea, R, r2), fill: col, opacity:'0.75' });
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${item.name} (${item.start}–${item.end})`;
    path.appendChild(title);
    svg.appendChild(path);
  });

  // Inner white circle
  svg.appendChild(el('circle', { cx, cy, r:r3, fill:'#FFFFFF', stroke:'#EEF1F4', 'stroke-width':'1' }));

  // Centre text
  const lines = [
    { text:'PRECISION', y: cy - 12, size:'9', weight:'700', fill:'#0A1628', spacing:'2' },
    { text:'BUILD',     y: cy + 4,  size:'9', weight:'700', fill:'#0A1628', spacing:'2' },
    { text:'v4.0',      y: cy + 18, size:'8', weight:'400', fill:'#B0BAC5', spacing:'1' },
  ];
  lines.forEach(l => {
    const t = el('text', {
      x:cx, y:l.y, 'text-anchor':'middle',
      'font-family':'Source Sans 3,sans-serif', 'font-size':l.size,
      'font-weight':l.weight, fill:l.fill, 'letter-spacing':l.spacing
    });
    t.textContent = l.text;
    svg.appendChild(t);
  });

  // Live clock hand
  function updateHand() {
    document.getElementById('diagHand')?.remove();
    document.getElementById('diagDot')?.remove();
    const a   = (nowMins() / 1440) * 360 - 90;
    const p1  = polar(a, r3 - 6), p2 = polar(a, R + 8);
    const hand = el('line', {
      id:'diagHand', x1:p1.x, y1:p1.y, x2:p2.x, y2:p2.y,
      stroke:'#C8102E', 'stroke-width':'2', 'stroke-linecap':'round',
      filter:'url(#redBlur)'
    });
    svg.appendChild(hand);
    const dot = el('circle', { id:'diagDot', cx, cy, r:'4', fill:'#C8102E', filter:'url(#redBlur)' });
    svg.appendChild(dot);
  }

  // SVG defs / filter
  const defs = el('defs', {});
  defs.innerHTML = `<filter id="redBlur" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="2" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
  svg.insertBefore(defs, svg.firstChild);

  updateHand();
  setInterval(updateHand, 60000);

  // Legend
  const legendData = [
    {type:'deepwork',label:'Deep Work'},
    {type:'nap',    label:'Nap Protocol'},
    {type:'sleep',  label:'Core Sleep'},
    {type:'buffer', label:'Buffer'},
    {type:'meal',   label:'Meals'},
    {type:'winddown',label:'Wind-Down'},
  ];
  const lg = document.getElementById('cycleLegend');
  if (lg) {
    legendData.forEach(ld => {
      const item = document.createElement('div');
      item.className = 'cl-item-row';
      item.innerHTML = `<div class="cl-swatch" style="background:${CAT_COLOUR[ld.type]}"></div>${ld.label}`;
      lg.appendChild(item);
    });
  }
}

/* ── ARCHITECTURE TABLE ─────────────────────────────────── */
const ALLOC_DATA = [
  { cat:'Deep Work',       slots:'11:30–01:15 (5 sessions)', mins:540, colour:'#0057A8' },
  { cat:'Core Sleep',      slots:'02:15–09:00',              mins:405, colour:'#1A3A6B' },
  { cat:'Buffer / Personal',slots:'16:15–19:15',             mins:120, colour:'#BF360C' },
  { cat:'Wind-Down/Plan',  slots:'01:15–02:15 + planning',   mins:130, colour:'#C8102E' },
  { cat:'Nap Protocols',   slots:'Three nap events',         mins:100, colour:'#6B3FA0' },
  { cat:'Meals',           slots:'13:30 lunch + 21:45 dinner',mins:60, colour:'#2E7D32' },
  { cat:'Routine / Prep',  slots:'09:00–09:20 + pre-nap',    mins:85,  colour:'#546E7A' },
];

function buildArchTable() {
  const tb = document.querySelector('#archTable tbody');
  if (!tb) return;
  ALLOC_DATA.forEach(row => {
    const tr = document.createElement('tr');
    const pct = (row.mins / 1440 * 100).toFixed(1);
    tr.innerHTML = `
      <td>
        <span class="at-swatch" style="background:${row.colour}"></span>
        ${row.cat}
      </td>
      <td>${row.slots}</td>
      <td>${fmtMins(row.mins)}</td>
      <td>${pct}%</td>
    `;
    tb.appendChild(tr);
  });
  const totalTr = document.createElement('tr');
  totalTr.className = 'at-total';
  totalTr.innerHTML = `<td colspan="2">Total Verified</td><td>24h 00m</td><td>100%</td>`;
  tb.appendChild(totalTr);
}

function buildStackedBar() {
  const bar = document.getElementById('stackedBar');
  const leg = document.getElementById('stackedLegend');
  if (!bar || !leg) return;
  ALLOC_DATA.forEach(row => {
    const pct  = (row.mins / 1440) * 100;
    const seg  = document.createElement('div');
    seg.className = 'sb-seg';
    seg.style.cssText = `width:${pct}%;background:${row.colour}`;
    seg.title = `${row.cat}: ${fmtMins(row.mins)} (${pct.toFixed(1)}%)`;
    bar.appendChild(seg);
    const li = document.createElement('div');
    li.className = 'sbl-item';
    li.innerHTML = `<span class="sbl-dot" style="background:${row.colour}"></span>${row.cat}: ${fmtMins(row.mins)}`;
    leg.appendChild(li);
  });
}

/* ── SCHEDULE TABLE ─────────────────────────────────────── */
function buildScheduleTable() {
  const tbody = document.getElementById('schedBody');
  if (!tbody) return;

  SCHEDULE.forEach((item, idx) => {
    const tr = document.createElement('tr');
    tr.dataset.idx  = idx;
    tr.dataset.type = item.type;
    const badgeCls = `badge-${item.type}`;
    tr.innerHTML = `
      <td>
        <div class="st-time">${item.start}</div>
        <div class="st-time-end">→ ${item.end}</div>
      </td>
      <td class="st-dur">${item.dur}</td>
      <td><span class="st-badge ${badgeCls}">${item.badge}</span></td>
      <td>
        <div class="st-act-name" id="act-name-${idx}">${item.name}</div>
      </td>
      <td class="st-act-desc">${item.desc}</td>
    `;
    tbody.appendChild(tr);
  });

  // Filters
  document.querySelectorAll('.fb').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fb').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f   = btn.dataset.filter;
      let count = 0;
      document.querySelectorAll('#schedBody tr').forEach(row => {
        const t = row.dataset.type;
        const show = f === 'all'
          || (f === 'deepwork' && t === 'deepwork')
          || (f === 'nap'      && t === 'nap')
          || (f === 'meal'     && (t === 'meal' || t === 'dinner'))
          || (f === 'buffer'   && t === 'buffer')
          || (f === 'routine'  && ['routine','planning','prep'].includes(t))
          || (f === 'winddown' && t === 'winddown');
        row.classList.toggle('is-hidden', !show);
        if (show) count++;
      });
      const sc = document.getElementById('schedCount');
      if (sc) sc.textContent = count;
    });
  });
}

/* ── PHASE DETECTION ────────────────────────────────────── */
function detectPhase() {
  const now = nowMins();
  for (let i = 0; i < SCHEDULE.length; i++) {
    const { s, e } = getSlotMins(SCHEDULE[i]);
    const inSlot = e < s ? (now >= s || now < e) : (now >= s && now < e);
    if (inSlot) {
      return {
        cur:  { item: SCHEDULE[i], s, e, idx: i },
        next: SCHEDULE[(i + 1) % SCHEDULE.length],
      };
    }
  }
  return { cur: { item: SCHEDULE[0], s: parseMins(SCHEDULE[0].start), e: parseMins(SCHEDULE[0].end), idx: 0 }, next: SCHEDULE[1] };
}

function updateLivePanel() {
  const { cur, next } = detectPhase();
  const { item, s, e, idx } = cur;
  const now = nowMins();
  let dur = e - s; if (dur < 0) dur += 1440;
  let elapsed = now - s;  if (elapsed < 0) elapsed += 1440;
  elapsed = Math.max(0, Math.min(elapsed, dur));
  const pct = Math.min(100, Math.round((elapsed / dur) * 100));

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('livePhName', item.name);
  set('livePhCat',  (CAT_LABEL[item.type] || item.type).toUpperCase());
  const fill = document.getElementById('phProgFill');
  if (fill) fill.style.width = pct + '%';
  set('phStart',     item.start);
  set('phPct',       pct + '%');
  set('phEnd',       item.end);
  set('lmElapsed',   fmtMins(elapsed));
  set('lmRemaining', fmtMins(dur - elapsed));
  set('lmNext',      next ? next.name : '—');

  let ns = next ? parseMins(next.start) : parseMins(SCHEDULE[0].start);
  let toNext = ns - now; if (toNext < 0) toNext += 1440;
  set('lmStartsIn', fmtMins(toNext));

  // Daily progress: 09:00 (540) → 02:15 next day (1575 wrapped)
  const dayStart = 540, dayEnd = 1575;
  let nowWrapped = now < 540 ? now + 1440 : now;
  const dayPct = Math.min(100, Math.max(0, Math.round(((nowWrapped - dayStart) / (dayEnd - dayStart)) * 100)));
  const dayFill = document.getElementById('dayFill');
  const dayPctEl = document.getElementById('dayPct');
  if (dayFill)  dayFill.style.width = dayPct + '%';
  if (dayPctEl) dayPctEl.textContent = dayPct + '%';

  // Highlight active row in schedule table
  document.querySelectorAll('#schedBody tr').forEach(row => {
    row.classList.remove('is-active-row');
    const ri = +row.dataset.idx;
    const { e: re } = getSlotMins(SCHEDULE[ri]);
    const passedBy = now - re; 
    const clearlyPast = (passedBy > 0 && passedBy < 800);
    row.classList.toggle('is-past-row', ri !== idx && clearlyPast);
  });
  const activeRow = document.querySelector(`#schedBody tr[data-idx="${idx}"]`);
  if (activeRow) {
    activeRow.classList.add('is-active-row');
    activeRow.classList.remove('is-past-row');
    const nameEl = document.getElementById(`act-name-${idx}`);
    if (nameEl && !nameEl.querySelector('.st-now-badge')) {
      const badge = document.createElement('span');
      badge.className = 'st-now-badge';
      badge.textContent = 'NOW';
      nameEl.appendChild(badge);
    }
    // Remove NOW badge from non-active rows
    document.querySelectorAll('.st-now-badge').forEach(b => {
      const row = b.closest('tr');
      if (row && +row.dataset.idx !== idx) b.remove();
    });
  }
}

/* ── NAP TIMER ──────────────────────────────────────────── */
let timerState = {
  total:    1200,
  remaining:1200,
  running:  false,
  interval: null,
  name:     'NAP 01 — Prophylactic',
  circum:   528,
};

function updateTimerUI() {
  const { remaining, total, circum, name } = timerState;
  const pct    = remaining / total;
  const offset = circum * (1 - pct);

  const disp  = document.getElementById('timerDisplay');
  const ring  = document.getElementById('timerRing');
  const state = document.getElementById('timerState');
  const nm    = document.getElementById('timerName');

  if (disp)  disp.textContent  = timerFmt(remaining);
  if (ring)  ring.setAttribute('stroke-dashoffset', offset);
  if (nm)    nm.textContent    = name;
  if (state) {
    state.textContent = timerState.running
      ? (remaining === 0 ? 'COMPLETE' : 'RUNNING')
      : (remaining === total ? 'READY' : 'PAUSED');
  }
}

function initTimer() {
  document.querySelectorAll('.nsb').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nsb').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const dur  = +btn.dataset.dur;
      const name = btn.dataset.name;
      if (timerState.running) {
        clearInterval(timerState.interval);
        timerState.running = false;
      }
      timerState.total     = dur;
      timerState.remaining = dur;
      timerState.name      = name;
      document.getElementById('btnPause').disabled = true;
      document.getElementById('btnStart').disabled = false;
      document.getElementById('timerMsg').textContent = `${name} selected. Press Start when ready.`;
      updateTimerUI();
    });
  });

  document.getElementById('btnStart').addEventListener('click', () => {
    if (timerState.remaining === 0) timerState.remaining = timerState.total;
    timerState.running = true;
    document.getElementById('btnStart').disabled = true;
    document.getElementById('btnPause').disabled = false;
    document.getElementById('timerMsg').textContent = 'Timer running. Lie down. Close your eyes. Alarm will sound on completion.';
    timerState.interval = setInterval(() => {
      if (timerState.remaining > 0) {
        timerState.remaining--;
        updateTimerUI();
      }
      if (timerState.remaining === 0) {
        clearInterval(timerState.interval);
        timerState.running = false;
        document.getElementById('btnPause').disabled = true;
        document.getElementById('btnStart').disabled = false;
        document.getElementById('timerMsg').textContent = '✓ Nap complete. Remain still for 3 minutes before rising. Hydrate.';
        playChime();
      }
    }, 1000);
  });

  document.getElementById('btnPause').addEventListener('click', () => {
    clearInterval(timerState.interval);
    timerState.running = false;
    document.getElementById('btnPause').disabled  = true;
    document.getElementById('btnStart').disabled  = false;
    document.getElementById('timerMsg').textContent = 'Timer paused. Press Start to resume.';
    updateTimerUI();
  });

  document.getElementById('btnReset').addEventListener('click', () => {
    clearInterval(timerState.interval);
    timerState.running   = false;
    timerState.remaining = timerState.total;
    document.getElementById('btnPause').disabled = true;
    document.getElementById('btnStart').disabled = false;
    document.getElementById('timerMsg').textContent = 'Timer reset. Select a nap protocol and press Start.';
    updateTimerUI();
  });

  updateTimerUI();
}

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[440, 0], [554, 0.35], [659, 0.7], [554, 1.1]].forEach(([freq, delay]) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + delay + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.7);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.8);
    });
  } catch(e) { /* AudioContext not available */ }
}

/* ── ANALYTICS: TIME ALLOCATION BARS ───────────────────── */
function buildAllocChart() {
  const container = document.getElementById('allocChart');
  if (!container) return;

  ALLOC_DATA.forEach(row => {
    const pct = (row.mins / 1440 * 100).toFixed(1);
    const div = document.createElement('div');
    div.className = 'alloc-row';
    div.innerHTML = `
      <div class="alloc-label">${row.cat}</div>
      <div class="alloc-track"><div class="alloc-fill" data-pct="${pct}" style="background:${row.colour}"></div></div>
      <div class="alloc-val">${fmtMins(row.mins)}</div>
    `;
    container.appendChild(div);
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.alloc-fill').forEach(f => { f.style.width = f.dataset.pct + '%'; });
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  io.observe(container);
}

/* ── ANALYTICS: SESSION BARS ────────────────────────────── */
function buildSessionChart() {
  const container = document.getElementById('sessionChart');
  if (!container) return;

  const sessions = [
    { id:'A', block:'11:30–13:30', mins:120 },
    { id:'B', block:'14:00–16:15', mins:135 },
    { id:'C', block:'19:45–21:45', mins:120 },
    { id:'D', block:'22:15–00:15', mins:120 },
    { id:'E', block:'00:15–01:15', mins: 60 },
  ];
  const max = Math.max(...sessions.map(s => s.mins));

  sessions.forEach(s => {
    const pct = (s.mins / max) * 100;
    const col = document.createElement('div');
    col.className = 'sb-col';
    col.innerHTML = `
      <div class="sb-dur">${s.mins}m</div>
      <div class="sb-bar" data-h="${pct}" style="height:0"></div>
      <div class="sb-lbl">SESSION ${s.id}</div>
      <div class="sb-blk">${s.block}</div>
    `;
    container.appendChild(col);
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.sb-bar').forEach(b => { b.style.height = b.dataset.h + '%'; });
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  io.observe(container);
}

/* ── ANALYTICS: COGNITIVE CURVE ─────────────────────────── */
function buildCognitiveCurve() {
  const svg = document.getElementById('cognitiveSvg');
  if (!svg) return;

  const W = 900, H = 220;
  const pL = 30, pR = 20, pT = 24, pB = 36;
  const iW = W - pL - pR, iH = H - pT - pB;
  const totalMins = 1035; // 09:00 to 02:15

  // Data points [minutes from 09:00, intensity 0–100]
  const pts = [
    [0,18],[40,28],[90,38],[120,30],[140,52],[180,72],[240,82],
    [280,78],[330,70],[375,22],[420,18],[480,25],[555,24],[615,72],
    [640,88],[680,84],[720,76],[765,68],[840,60],[855,30],[870,26],
    [900,72],[930,68],[960,60],[990,55],[1020,46],[1035,30],
  ];

  // Nap events [minutes, label]
  const naps  = [[120,'Nap 01'],[375,'Nap 02'],[615,'Nap 03']];
  const meals = [[270,'Lunch'],[765,'Dinner']];

  const sx = t => pL + (t / totalMins) * iW;
  const sy = v => pT + iH - (v / 100) * iH;

  function mkEl(tag, attrs, text) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k,v]) => e.setAttribute(k, v));
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // Defs / gradients
  const defs = mkEl('defs', {});
  defs.innerHTML = `
    <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#0057A8" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#0057A8" stop-opacity="0.02"/>
    </linearGradient>`;
  svg.appendChild(defs);

  // Grid lines (horizontal)
  [25,50,75,100].forEach(v => {
    const y = sy(v);
    svg.appendChild(mkEl('line', { x1:pL, y1:y, x2:W-pR, y2:y, stroke:'#EEF1F4', 'stroke-width':'1' }));
    svg.appendChild(mkEl('text', {
      x:pL-4, y:y+4, 'text-anchor':'end', 'font-family':'Roboto Mono,monospace',
      'font-size':'8', fill:'#B0BAC5'
    }, v + '%'));
  });

  // Area fill
  const area = mkEl('path', {
    d: pts.map((p,i) => `${i===0?'M':'L'}${sx(p[0])},${sy(p[1])}`).join(' ')
       + ` L${sx(pts[pts.length-1][0])},${pT+iH} L${sx(0)},${pT+iH} Z`,
    fill: 'url(#curveGrad)'
  });
  svg.appendChild(area);

  // Main line
  svg.appendChild(mkEl('path', {
    d: pts.map((p,i) => `${i===0?'M':'L'}${sx(p[0])},${sy(p[1])}`).join(' '),
    fill:'none', stroke:'#0057A8', 'stroke-width':'2.5', 'stroke-linejoin':'round'
  }));

  // Nap markers
  naps.forEach(([t, label]) => {
    const x = sx(t);
    svg.appendChild(mkEl('line', { x1:x, y1:pT, x2:x, y2:pT+iH, stroke:'#C8102E', 'stroke-width':'1.5', 'stroke-dasharray':'5 3', opacity:'0.7' }));
    svg.appendChild(mkEl('circle', { cx:x, cy:sy(0), r:'4', fill:'#C8102E', opacity:'0.8' }));
    svg.appendChild(mkEl('text', { x:x+4, y:pT+14, 'font-family':'Roboto Mono,monospace', 'font-size':'8', fill:'#C8102E', 'letter-spacing':'0.5' }, label));
  });

  // Meal markers
  meals.forEach(([t, label]) => {
    const x = sx(t);
    svg.appendChild(mkEl('line', { x1:x, y1:pT, x2:x, y2:pT+iH, stroke:'#2E7D32', 'stroke-width':'1', 'stroke-dasharray':'4 4', opacity:'0.5' }));
    svg.appendChild(mkEl('text', { x:x+4, y:pT+26, 'font-family':'Roboto Mono,monospace', 'font-size':'8', fill:'#2E7D32', 'letter-spacing':'0.5' }, label));
  });
}

/* ── ANALYTICS: NAP STAGE ARCHITECTURE ─────────────────── */
function buildNapStages() {
  const svg = document.getElementById('napStageSvg');
  if (!svg) return;

  const W = 900, H = 230;
  const naps = [
    { label:'NAP 01 — Prophylactic', window:'11:00–11:20', dur:20, stages:[{stage:'N1',dur:8,col:'#6B9FD4'},{stage:'N2',dur:12,col:'#0057A8'}] },
    { label:'NAP 02 — Power Nap',    window:'16:15–17:15', dur:60, stages:[{stage:'N1',dur:8,col:'#6B9FD4'},{stage:'N2',dur:20,col:'#0057A8'},{stage:'N3',dur:22,col:'#003F7F'},{stage:'N2',dur:10,col:'#0057A8'}] },
    { label:'NAP 03 — Prime Nap',    window:'19:15–19:35', dur:20, stages:[{stage:'N1',dur:7,col:'#6B9FD4'},{stage:'N2',dur:13,col:'#0057A8'}] },
  ];

  const pX = 24, pY = 34, rowH = 38, gap = 26;
  const trackW = W - pX * 2 - 60;

  function mkEl(tag, attrs, text) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k,v]) => e.setAttribute(k, v));
    if (text !== undefined) e.textContent = text;
    return e;
  }

  naps.forEach((nap, ni) => {
    const y     = pY + ni * (rowH + gap);
    const scale = trackW / nap.dur;

    // Label
    svg.appendChild(mkEl('text', {
      x:pX, y:y-8, 'font-family':'Roboto Mono,monospace', 'font-size':'9.5',
      'font-weight':'500', fill:'#0057A8', 'letter-spacing':'1'
    }, `${nap.label}  ·  ${nap.window}  ·  ${nap.dur} min`));

    // Track background
    svg.appendChild(mkEl('rect', { x:pX, y:y, width:trackW, height:rowH, fill:'#F4F6F8', stroke:'#D8DDE3', 'stroke-width':'1', rx:'2' }));

    // Stage segments
    let cx = pX;
    nap.stages.forEach(st => {
      const sw = st.dur * scale;
      svg.appendChild(mkEl('rect', { x:cx, y:y, width:sw-1, height:rowH, fill:st.col, rx:'1', opacity:'0.9' }));
      if (sw > 20) {
        svg.appendChild(mkEl('text', {
          x:cx + sw/2, y:y + rowH/2 + 4, 'text-anchor':'middle',
          'font-family':'Roboto Mono,monospace', 'font-size':'10', fill:'#FFFFFF', 'font-weight':'600'
        }, st.stage));
      }
      cx += sw;
    });

    // Duration label
    svg.appendChild(mkEl('text', {
      x:pX + trackW + 10, y:y + rowH/2 + 4,
      'font-family':'Roboto Mono,monospace', 'font-size':'10', fill:'#546E7A'
    }, nap.dur + 'm'));
  });
}

/* ── INITIALISE ALL ─────────────────────────────────────── */
function init() {
  updateClock();
  setInterval(updateClock, 1000);

  initNav();
  animateCounters();
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
  setInterval(updateLivePanel, 30000);
}

document.addEventListener('DOMContentLoaded', init);
