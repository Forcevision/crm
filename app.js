// ForceVision CRM: demo mode (fictional sample data, in memory) or team pilot mode (signed in, saved to Supabase).
(() => {
  const STAGES = ['New lead', 'Contacted', 'Site visit', 'Proposal sent', 'Negotiation', 'Won', 'Lost'];
  const OPEN = STAGES.slice(0, 5);
  const DAY = 86400000;
  // Stage reminders: a deal with no update for this many days in its stage emails its owner (weekdays, 8 AM). Keep in step with STAGE_DAYS in supabase/functions/notify.
  const STAGE_DAYS = { 'New lead': 2, 'Contacted': 4, 'Site visit': 3, 'Proposal sent': 3, 'Negotiation': 5 };
  let TEAM = ['Zoltan', 'Motasim', 'Maham'];
  let CO = 'ForceVision', companyId = null, myCompanies = [], members = []; // signed in: the company being viewed and its team
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = n => { const t = new Date(today.getFullYear(), today.getMonth(), today.getDate() + n); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; };
  let uid = 100;

  // ---------- Fictional sample data ----------
  let contacts = [
    { id: 1, company: 'Northgate Logistics (sample)', name: 'Dana Whitfield', title: 'Facilities Manager', email: 'dana@northgate.example', phone: '(555) 010-2001', notes: 'Prefers morning calls.' },
    { id: 2, company: 'Lakeview Steel Works (sample)', name: 'Marcus Oyelaran', title: 'Plant Director', email: 'marcus@lakeviewsteel.example', phone: '(555) 010-2002', notes: '' },
    { id: 3, company: 'Harbour Cold Storage (sample)', name: 'Priya Nandakumar', title: 'Operations Lead', email: 'priya@harbourcold.example', phone: '(555) 010-2003', notes: 'Two sites in planning.' },
    { id: 4, company: 'Maple Ridge Auto Parts (sample)', name: 'Tom Brecken', title: 'Owner', email: 'tom@mapleridge.example', phone: '(555) 010-2004', notes: '' },
    { id: 5, company: 'Summit Property Group (sample)', name: 'Elena Varga', title: 'Property Manager', email: 'elena@summitpg.example', phone: '(555) 010-2005', notes: 'Manages 4 plazas.' },
    { id: 6, company: 'Riverside Distribution (sample)', name: 'Kwame Asante', title: 'Security Supervisor', email: 'kwame@riversidedist.example', phone: '(555) 010-2006', notes: '' },
    { id: 7, company: 'Elmwood Fabrication (sample)', name: 'Sophie Laurent', title: 'GM', email: 'sophie@elmwoodfab.example', phone: '(555) 010-2007', notes: '' },
    { id: 8, company: 'Crescent Food Processing (sample)', name: 'Raj Mehta', title: 'Plant Manager', email: 'raj@crescentfood.example', phone: '(555) 010-2008', notes: '' },
  ];
  contacts.forEach(c => { c.log = c.notes ? [{ at: d(-14), text: c.notes }] : []; });
  let deals = [
    { id: 11, contactId: 1, title: 'Warehouse perimeter cameras', site: '100 Example Rd, Sample City', needs: '24 exterior cameras, loading-dock coverage, 30-day retention', value: 38000, stage: 'Proposal sent', nextAction: 'Follow up on proposal', followUp: d(-3), proposal: 'https://example.com/proposal-northgate', notes: [{ at: d(-10), text: 'Site visit done. Concern: dock theft at night.' }, { at: d(-6), text: 'Proposal emailed.' }] },
    { id: 12, contactId: 2, title: 'Plant-wide NVR upgrade', site: '200 Sample Ave, Sample City', needs: 'Replace 3 legacy DVRs, 48 cameras, central NVR', value: 62000, stage: 'Negotiation', nextAction: 'Send revised pricing option', followUp: d(0), proposal: 'https://example.com/proposal-lakeview', notes: [{ at: d(-4), text: 'Asked for a phased option.' }],
      draft: { subject: 'Phased option for your plant-wide NVR upgrade', text: `Hi Marcus,\n\nThanks again for the feedback on our proposal for the plant-wide NVR upgrade. You asked whether we could phase the work, and we can.\n\nHere is the approach we would suggest:\n\nPhase 1: Replace the three legacy DVRs with one central NVR and move your existing cameras onto it, so you get one system to view and manage.\nPhase 2: Add the new cameras in the areas you see as the highest priority.\nPhase 3: Complete the remaining coverage across the plant.\n\nThis keeps the first step focused and lets you spread the cost over time. I am putting together updated pricing for each phase and will send it to you shortly.\n\nWould you have 20 minutes later this week to walk through the phases together, so we can agree on a timeline that works for the plant?\n\nBest regards,\n[Your name]\nForceVision` } },
    { id: 13, contactId: 3, title: 'Cold-storage site #1', site: '300 Test Blvd, Sample City', needs: 'Low-temp rated cameras, 12 units', value: 21500, stage: 'Site visit', nextAction: 'Confirm site-visit time', followUp: d(1), proposal: '', notes: [] },
    { id: 14, contactId: 4, title: 'Yard and showroom coverage', site: '400 Demo St, Sample Town', needs: '8 cameras, remote phone viewing', value: 9800, stage: 'Contacted', nextAction: 'Call to book site visit', followUp: d(-1), proposal: '', notes: [{ at: d(-2), text: 'Left voicemail.' }] },
    { id: 15, contactId: 5, title: 'Plaza parking-lot cameras', site: '500 Example Pkwy, Sample City', needs: 'Plate-capture at 2 entrances, 16 cameras', value: 44000, stage: 'Proposal sent', nextAction: 'Check proposal received', followUp: d(0), proposal: 'https://example.com/proposal-summit', notes: [] },
    { id: 16, contactId: 6, title: 'AI monitoring add-on', site: '600 Sample Dr, Sample City', needs: 'After-hours alerts on existing cameras', value: 12000, stage: 'New lead', nextAction: 'First call', followUp: d(2), proposal: '', notes: [] },
    { id: 17, contactId: 7, title: 'Shop floor safety cameras', site: '700 Test Rd, Sample Town', needs: '10 interior cameras', value: 14500, stage: 'Won', nextAction: 'Schedule install', followUp: d(5), proposal: 'https://example.com/proposal-elmwood', notes: [{ at: d(-8), text: 'Signed.' }] },
    { id: 18, contactId: 8, title: 'Processing line monitoring', site: '800 Demo Ave, Sample City', needs: '20 cameras, wash-down rated', value: 33000, stage: 'Lost', nextAction: '—', followUp: '', proposal: '', notes: [{ at: d(-12), text: 'Went with incumbent vendor.' }] },
    { id: 19, contactId: 3, title: 'Cold-storage site #2', site: '310 Test Blvd, Sample City', needs: 'Mirror of site #1', value: 19000, stage: 'New lead', nextAction: 'Wait for site #1 outcome', followUp: d(9), proposal: '', notes: [] },
    { id: 20, contactId: 1, title: 'Office access-area cameras', site: '100 Example Rd, Sample City', needs: '4 indoor cameras at reception', value: 4200, stage: 'Contacted', nextAction: 'Send brochure', followUp: d(3), proposal: '', notes: [] },
  ];

  // Sample owners (prototype): who is responsible for each deal
  const OWNERS = { 11: 'Zoltan', 12: 'Zoltan', 15: 'Zoltan', 17: 'Zoltan', 13: 'Motasim', 14: 'Motasim', 20: 'Motasim', 16: 'Maham', 18: 'Maham', 19: 'Maham' };
  deals.forEach(x => x.owner = OWNERS[x.id] || TEAM[0]);
  deals.forEach(x => { if (x.stage === 'Won') x.wonAt = d(-6) + 'T12:00:00'; });
  const DEMO_AGE = { 11: 6, 12: 2, 13: 1, 14: 5, 15: 4, 16: 0, 19: 3, 20: 1 }; // sample: days since each deal last changed
  deals.forEach(x => { x.stageSince = x.updatedAt = new Date(Date.now() - (DEMO_AGE[x.id] ?? 1) * DAY).toISOString(); });
  const at = (n, h, m = 0) => { const t = new Date(today); t.setDate(t.getDate() + n); t.setHours(h, m, 0, 0); return t.toISOString(); };
  let acts = [
    { id: 1, dealId: 12, kind: 'meeting', title: 'Site visit: Lakeview Steel', startsAt: at(1, 10), endsAt: at(1, 11, 30), location: '', details: 'Walk the yard and loading docks with the plant manager.', assignees: ['Zoltan', 'Motasim'], inviteCustomer: true, customerEmail: '', remind: 60, logged: false, done: false, status: 'scheduled', createdBy: 'Zoltan', createdAt: at(-1, 9) },
    { id: 2, dealId: 11, kind: 'task', title: 'Send revised camera layout', startsAt: at(0, 15), endsAt: null, location: '', details: '', assignees: ['Zoltan'], inviteCustomer: false, customerEmail: '', remind: 60, logged: false, done: false, status: 'scheduled', createdBy: 'Zoltan', createdAt: at(-2, 9) },
    { id: 3, dealId: 13, kind: 'task', title: 'Call back about NVR storage', startsAt: at(-1, 11), endsAt: null, location: '', details: '', assignees: ['Motasim'], inviteCustomer: false, customerEmail: '', remind: 30, logged: false, done: false, status: 'scheduled', createdBy: 'Maham', createdAt: at(-3, 9) },
  ];
  acts[0].location = (deals.find(x => x.id === 12) || {}).site || '';
  // Invoices (sample): amounts only come from the deal value or what someone types.
  const INV_DEFAULTS = { businessName: 'ForceVision', address: '2390 Prospect St., Burlington, ON L7R 2A8', phone: '(289) 288-3954', hstNumber: '', paymentInstructions: '', daysToPay: 30, nextNumber: 1 };
  let invSettings = { ...INV_DEFAULTS, nextNumber: 2 };
  let invoices = [
    { id: 1, dealId: 17, contactId: 7, number: 'FV-0001', issueDate: d(-6), dueDate: d(24), status: 'Sent', items: [{ desc: 'Shop floor safety cameras', qty: 1, price: 14500 }], taxRate: 13, notes: '', sentAt: at(-6, 10), paidAt: null, createdAt: at(-6, 9), createdBy: 'Zoltan' },
  ];
  deals.find(x => x.id === 17).notes.push({ at: at(-6, 9), text: 'Invoice FV-0001 created, $16,385.00' }, { at: at(-6, 10), text: 'Invoice FV-0001 emailed to sophie@elmwoodfab.example' });

  // ---------- Helpers ----------
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => '$' + Math.round(n || 0).toLocaleString('en-CA');
  const money2 = n => (n < 0 ? '-$' : '$') + Math.abs(n || 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const contactOf = deal => contacts.find(c => c.id === deal.contactId) || {};
  const daysFrom = iso => iso ? Math.round((new Date(iso + 'T00:00:00') - today) / DAY) : null;
  const fmtDate = iso => iso ? new Date(iso + 'T00:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }) : '—';
  // Date and time for notes and changes. Older notes saved with a date only still show just the date.
  const fmtWhen = iso => { if (!iso) return '—'; if (iso.length <= 10) return fmtDate(iso); const t = new Date(iso); return t.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', ...(t.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}) }) + ', ' + t.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }); };
  const localDay = iso => { if (!iso || iso.length <= 10) return iso; const t = new Date(iso); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; };
  const stamp = () => new Date().toISOString();
  function duePill(deal) {
    if (!OPEN.includes(deal.stage) || !deal.followUp) return '';
    const n = daysFrom(deal.followUp);
    if (n < 0) return `<span class="pill red">${-n}d overdue</span>`;
    if (n === 0) return `<span class="pill amber">Today</span>`;
    return `<span class="pill">${fmtDate(deal.followUp)}</span>`;
  }
  function stagePill(stage) {
    const cls = stage === 'Won' ? 'green' : stage === 'Lost' ? 'red' : stage === 'Proposal sent' || stage === 'Negotiation' ? 'blue' : '';
    return `<span class="pill ${cls}">${esc(stage)}</span>`;
  }
  // Days in the current stage and days with no update; a stage change resets both.
  function stageAge(x) {
    if (x._st !== undefined && x._st !== x.stage) x.stageSince = stamp();
    x._st = x.stage;
    const since = new Date(x.stageSince || x.updatedAt || x.createdAt || Date.now()).getTime();
    const last = Math.max(since, new Date(x.updatedAt || 0).getTime());
    return { inStage: Math.max(0, Math.floor((Date.now() - since) / DAY)), idle: Math.max(0, Math.floor((Date.now() - last) / DAY)), limit: STAGE_DAYS[x.stage] };
  }
  const needsNudge = x => { if (!STAGE_DAYS[x.stage]) return false; const a = stageAge(x); return a.idle >= a.limit; };
  // ---------- Team pilot: sign-in and saving (Supabase) ----------
  const SB_URL = 'https://hpwfkgoduruigsikqtre.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwd2ZrZ29kdXJ1aWdzaWtxdHJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1NzQwNjcsImV4cCI6MjExMTE1MDA2N30._Is4TD8na5wFMqfnlF92nGA_pH45J313pPkXtcSGW-o'; // public anon key; data is protected by sign-in and row-level security
  const RESET_URL = 'https://forcevision.github.io/crm/'; // where the forgot-password email link opens
  let LIVE = false, sb = null, me = null, myEmail = '', teamNames = {};
  const mem = {}; // the preview blocks browser storage, so the sign-in lives in memory (sign in again after a reload); the team link keeps it
  const store = { getItem: k => mem[k] ?? null, setItem: (k, v) => { mem[k] = v; }, removeItem: k => { delete mem[k]; } };
  const dealFromDb = r => ({ id: r.id, contactId: r.contact_id, title: r.title, owner: r.owner, site: r.site || '', needs: r.needs || '', value: +r.value || 0, stage: r.stage, nextAction: r.next_action || '', followUp: r.follow_up || '', proposal: r.proposal || '', notes: r.notes || [], createdAt: r.created_at || '', draft: r.draft || undefined, trelloId: r.trello_id || undefined, archived: !!r.archived, wonAt: r.won_at || '', updatedBy: r.updated_by || '', updatedAt: r.updated_at || '', stageSince: r.stage_since || r.updated_at || '' });
  const dealToDb = x => ({ contact_id: x.contactId || null, title: x.title, owner: x.owner, site: x.site, needs: x.needs, value: x.value || 0, stage: x.stage, next_action: x.nextAction, follow_up: x.followUp || null, proposal: x.proposal, notes: x.notes, draft: x.draft || null, trello_id: x.trelloId || null, archived: !!x.archived, won_at: x.stage === 'Won' ? (x.wonAt = x.wonAt || new Date().toISOString()) : (x.wonAt = null), ...(companyId ? { company_id: companyId } : {}) });
  const contactToDb = c => ({ company: c.company, name: c.name, title: c.title, email: c.email, phone: c.phone, address: c.address || '', notes: c.notes || '', log: c.log || [], trello_id: c.trelloId || null, ...(companyId ? { company_id: companyId } : {}) });
  async function loadAll() {
    const [c, x] = await Promise.all([sb.from('contacts').select('*').eq('company_id', companyId).order('company'), sb.from('deals').select('*').eq('company_id', companyId).order('id')]);
    if (c.error || x.error) throw (c.error || x.error);
    contacts = c.data.map(r => ({ id: r.id, company: r.company, name: r.name || '', title: r.title || '', email: r.email || '', phone: r.phone || '', address: r.address || '', notes: r.notes || '', log: r.log || [], createdAt: r.created_at || '', updatedBy: r.updated_by || '', updatedAt: r.updated_at || '', trelloId: r.trello_id || undefined }));
    deals = x.data.map(dealFromDb);
    const a = await sb.from('activities').select('*').eq('company_id', companyId).order('starts_at');
    if (a.error) throw a.error;
    acts = a.data.map(actFromDb);
    const [iv, st] = await Promise.all([sb.from('invoices').select('*').eq('company_id', companyId).order('id'), sb.from('invoice_settings').select('*').eq('company_id', companyId).maybeSingle()]);
    if (iv.error || st.error) throw (iv.error || st.error);
    invoices = iv.data.map(invFromDb);
    invSettings = st.data ? settingsFromDb(st.data) : { ...INV_DEFAULTS };
  }
  function failed(err) { console.error(err); toast('Not saved. Check your connection and try again.'); loadAll().then(render).catch(() => {}); }
  function saveDeal(x) { if (!LIVE) { x.updatedAt = stamp(); return Promise.resolve(); } x.updatedBy = myEmail; x.updatedAt = new Date().toISOString(); return sb.from('deals').update(dealToDb(x)).eq('id', x.id).then(({ error }) => error && failed(error)); }
  function saveContact(c) { if (!LIVE) return; c.updatedBy = myEmail; c.updatedAt = stamp(); sb.from('contacts').update(contactToDb(c)).eq('id', c.id).then(({ error }) => error && failed(error)); }
  async function insertRows(table, rows) { const { data, error } = await sb.from(table).insert(rows).select('id'); if (error) throw error; return data.map(r => r.id); }

  let toastTimer;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => t.hidden = true, 2200); }

  const note = (x, text, at, list = 'notes') => x[list].push(me ? { at: at || stamp(), text, by: me } : { at: at || stamp(), text });
  const ago = iso => { const m = Math.round((Date.now() - new Date(iso)) / 60000); if (m < 1) return 'just now'; if (m < 60) return `${m} min ago`; const h = Math.round(m / 60); if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`; const n = Math.round(h / 24); return `${n} day${n === 1 ? '' : 's'} ago`; };
  const telHref = ph => 'tel:' + String(ph || '').replace(/[^\d+]/g, '');
  const mailHref = (to, subject, body) => `mailto:${encodeURIComponent(to || '').replace(/%40/g, '@')}?subject=${encodeURIComponent(subject || '')}&body=${encodeURIComponent(body || '')}`;
  const reachButtons = c => (c.phone ? (phoneOn ? `<button class="secondary" data-call data-num="${esc(c.phone)}">Call</button><a class="secondary btn-link" data-cell href="${esc(telHref(c.phone))}" title="Call from your own phone">Cell</a>` : `<a class="secondary btn-link" data-call href="${esc(telHref(c.phone))}">Call</a>`) : '') + (c.email ? `<button class="secondary" data-compose>Email</button>` : '');

  // ---------- Phone (Telnyx, from the ForceVision 289 number, in the browser) ----------
  // Only signed-in people the notify function allows get this; everyone else keeps the plain tel: link.
  // The SIP login comes from the notify function (stored in Supabase Vault), never from this file.
  let phoneOn = false, phone = null, phoneInfo = null, curCall = null, callCtx = null, callStart = 0, callTick = null, muted = false;
  const e164 = n => { const dg = String(n || '').replace(/[^\d]/g, ''); return dg.length === 10 ? '+1' + dg : dg.length === 11 && dg[0] === '1' ? '+' + dg : dg ? '+' + dg : ''; };
  const prettyNum = n => { const dg = String(n || '').replace(/[^\d]/g, '').replace(/^1(?=\d{10}$)/, ''); return dg.length === 10 ? `(${dg.slice(0, 3)}) ${dg.slice(3, 6)}-${dg.slice(6)}` : n; };
  const byPhone = n => { const k = e164(n); return k ? contacts.find(c => c.phone && e164(c.phone) === k) : null; };
  const mmss = ms => { const t = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
  const durText = ms => { const t = Math.max(0, Math.round(ms / 1000)); const m = Math.floor(t / 60), sec = t % 60; return m ? `${m} min ${sec} s` : `${sec} s`; };
  function loadScript(src) { return new Promise((ok, bad) => { const el = document.createElement('script'); el.src = src; el.onload = ok; el.onerror = () => bad(new Error('Could not load the phone')); document.head.appendChild(el); }); }
  async function startPhone() {
    try {
      const { data, error } = await sb.functions.invoke('notify', { body: { action: 'phone' } });
      if (error || !data || !data.login) return;
      // Some in-app browsers (for example inside other apps on iPhone) have no microphone access; keep the normal phone link there.
      if (!window.RTCPeerConnection || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      phoneInfo = data; phoneOn = true; render();
      const giveUp = () => { if (phoneInfo && !phoneInfo.ready && !callCtx) { phoneOn = false; render(); } };
      setTimeout(giveUp, 20000);
      if (!window.TelnyxWebRTC) await loadScript('https://cdn.jsdelivr.net/npm/@telnyx/webrtc@2.28.2/lib/bundle.js');
      phone = new window.TelnyxWebRTC.TelnyxRTC({ login: data.login, password: data.password });
      phone.remoteElement = 'callAudio';
      phone.on('telnyx.ready', () => { phoneInfo.ready = true; if (!phoneOn) { phoneOn = true; render(); } });
      phone.on('telnyx.error', err => { console.error('phone', err); giveUp(); });
      phone.on('telnyx.socket.close', () => { phoneInfo.ready = false; });
      phone.on('telnyx.notification', n => { if (n.type === 'callUpdate' && n.call) onCallUpdate(n.call); });
      phone.connect();
    } catch (err) { console.error('phone', err); }
  }
  function callBar(html) { let b = $('#callBar'); if (!b) { b = document.createElement('div'); b.id = 'callBar'; b.className = 'call-bar'; b.setAttribute('role', 'region'); b.setAttribute('aria-label', 'Phone call'); document.body.appendChild(b); } b.innerHTML = html; b.hidden = !html; return b; }
  function showCall(state) {
    const who = callCtx.name ? `${esc(callCtx.name)} · <span class="num">${esc(prettyNum(callCtx.number))}</span>` : `<span class="num">${esc(prettyNum(callCtx.number))}</span>`;
    const label = { new: 'Connecting…', trying: 'Connecting…', requesting: 'Connecting…', recovering: 'Reconnecting…', ringing: callCtx.dir === 'in' ? 'Incoming call' : 'Ringing…', early: 'Ringing…', active: 'Connected', held: 'On hold', hangup: 'Call ended', destroy: 'Call ended' }[state] || state;
    const incoming = callCtx.dir === 'in' && state === 'ringing';
    const live = !['hangup', 'destroy'].includes(state);
    const b = callBar(`<div class="call-main"><div class="call-who">${callCtx.dir === 'in' ? 'From ' : ''}${who}</div><div class="call-state"><span id="callStatus">${label}</span>${state === 'active' ? ` · <span id="callTime" class="num">${mmss(Date.now() - callStart)}</span>` : ''}</div><div class="call-from">${callCtx.dir === 'in' ? 'To' : 'From'} ForceVision <span class="num">${esc(prettyNum(phoneInfo ? phoneInfo.callerId : '+12898128904'))}</span></div></div>
      <div class="call-btns">${incoming ? '<button class="primary call-answer" id="callAnswer">Answer</button><button class="call-end" id="callEnd">Decline</button>' : live ? `<button class="secondary" id="callMute" aria-pressed="${muted}">${muted ? 'Unmute' : 'Mute'}</button><button class="secondary" id="callPadBtn" aria-expanded="false">Keypad</button><button class="call-end" id="callEnd">Hang up</button>` : '<button class="secondary" id="callClose">Close</button>'}</div>
      <div class="call-pad" id="callPad" hidden>${['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(k => `<button class="secondary" data-dtmf="${k}">${k}</button>`).join('')}</div>`);
    const end = $('#callEnd'); if (end) end.onclick = () => { if (curCall && curCall.hangup) curCall.hangup(); else finishCall(); };
    const ans = $('#callAnswer'); if (ans) ans.onclick = () => { try { curCall.answer(); } catch (err) { console.error(err); toast('Could not answer. Allow the microphone and try again.'); } };
    const mu = $('#callMute'); if (mu) mu.onclick = () => { muted = !muted; if (curCall && curCall.toggleAudioMute) curCall.toggleAudioMute(); showCall(state); };
    const pb = $('#callPadBtn'); if (pb) pb.onclick = () => { const pad = $('#callPad'); pad.hidden = !pad.hidden; pb.setAttribute('aria-expanded', String(!pad.hidden)); };
    b.querySelectorAll('[data-dtmf]').forEach(k => k.onclick = () => { if (curCall && curCall.dtmf) curCall.dtmf(k.dataset.dtmf); });
    const cl = $('#callClose'); if (cl) cl.onclick = () => callBar('');
  }
  function onCallUpdate(call) {
    if (!curCall || curCall.id !== call.id) {
      if (curCall && !['hangup', 'destroy'].includes(curCall.state)) { if (call.state === 'ringing') call.hangup(); return; } // already on a call: decline the second one
      curCall = call; muted = false;
      if (call.direction === 'inbound') { const num = call.options && (call.options.remoteCallerNumber || call.options.callerNumber); const c = byPhone(num); callCtx = { dir: 'in', number: num || 'Unknown', name: c ? `${c.name || c.company}${c.name && c.company ? ', ' + c.company : ''}` : '', contactId: c ? c.id : null, dealId: null }; }
    }
    if (call.state === 'active' && !callStart) { callStart = Date.now(); clearInterval(callTick); callTick = setInterval(() => { const t = $('#callTime'); if (t) t.textContent = mmss(Date.now() - callStart); }, 1000); }
    if (call.state === 'hangup' || call.state === 'destroy') { if (callCtx) callCtx.why = [call.sipCode, call.sipReason || call.cause].filter(Boolean).join(' '); return finishCall(); }
    showCall(call.state);
  }
  function finishCall() {
    if (!callCtx) return;
    clearInterval(callTick);
    const ctx = callCtx, talked = callStart ? Date.now() - callStart : 0;
    callCtx = null; curCall = null; callStart = 0; muted = false;
    callBar(`<div class="call-main"><div class="call-who">${ctx.name ? esc(ctx.name) : `<span class="num">${esc(prettyNum(ctx.number))}</span>`}</div><div class="call-state">${talked ? `Call ended · ${durText(talked)}` : ctx.dir === 'in' ? 'Missed call' : 'No answer'}</div></div><div class="call-btns"><button class="secondary" id="callClose">Close</button></div>`);
    $('#callClose').onclick = () => callBar('');
    const line = `${ctx.dir === 'in' ? 'Incoming call' : 'Call'}${ctx.name ? (ctx.dir === 'in' ? ' from ' : ' to ') + ctx.name : ''} ${ctx.dir === 'in' ? 'on' : 'at'} ${prettyNum(ctx.number)} · ${talked ? durText(talked) : ctx.dir === 'in' ? 'missed' : 'no answer'}`;
    const x = ctx.dealId ? deals.find(z => z.id === ctx.dealId) : null;
    const c = ctx.contactId ? contacts.find(k => k.id === ctx.contactId) : null;
    if (x) { note(x, line); saveDeal(x); }
    else if (c) { note(c, line, null, 'log'); saveContact(c); }
    render();
    // Reopen the record with the call note box ready, so the outcome is written down while it is fresh.
    if (x && talked) { openDeal(x.id); const box = $('#logCallBox'); if (box) { box.hidden = false; $('#callNote').focus(); } }
    else if (c && !$('#drawer').hidden) openContact(c.id);
    const refused = ctx.dir === 'out' && !talked && /^(4\d\d|5\d\d|6\d\d)\b/.test(ctx.why || '') && !/^(408|480|486|487|603)\b/.test(ctx.why || '');
    if (refused) toast(`The call did not go through (${ctx.why}). While the phone account is on trial it can only call your own cell.`);
    else toast(x || c ? 'Call saved to the notes' : 'Call ended');
  }
  async function dial(number, ctx) {
    if (callCtx) { toast('Finish the current call first'); return; }
    const to = e164(number);
    if (!to || to.length < 12) { toast('This phone number does not look complete'); return; }
    callCtx = { dir: 'out', number: to, name: ctx.name || '', dealId: ctx.dealId || null, contactId: ctx.contactId || null };
    if (!phone || !phoneInfo.ready) { callCtx = null; toast('The phone is still connecting. Try again in a few seconds, or use Cell.'); return; }
    try { const st = await navigator.mediaDevices.getUserMedia({ audio: true }); st.getTracks().forEach(t => t.stop()); }
    catch (err) { callCtx = null; toast('The browser did not allow the microphone. Allow it for this site (Safari or Chrome), or use Cell.'); return; }
    showCall('new');
    try { curCall = phone.newCall({ destinationNumber: to, callerNumber: phoneInfo.callerId, callerName: phoneInfo.callerName || 'ForceVision', audio: true, video: false }); }
    catch (err) { console.error(err); callCtx = null; callBar(''); toast('Could not start the call. Allow the microphone and try again.'); }
  }
  // Calls from the phone's own dialer (Call link without the CRM phone, or Cell): note the call right away.
  document.addEventListener('click', e => {
    const a = e.target.closest('#drawerBody a[data-call], #drawerBody a[data-cell]'); if (!a) return;
    const ctxEl = $('#drawerBody'); const dealId = +ctxEl.dataset.ctxDeal || null, contactId = +ctxEl.dataset.ctxContact || null;
    const x = dealId ? deals.find(z => z.id === dealId) : null;
    const c = contacts.find(k => k.id === (x ? x.contactId : contactId));
    const num = (a.getAttribute('href') || '').replace(/^tel:/, '');
    const line = `Call${c && c.name ? ` to ${c.name}` : ''} at ${prettyNum(num)} · from ${a.dataset.cell !== undefined ? 'cell' : 'phone'}`;
    if (x) { note(x, line); saveDeal(x); }
    else if (c) { note(c, line, null, 'log'); saveContact(c); setTimeout(() => { if (!$('#drawer').hidden && +$('#drawerBody').dataset.ctxContact === c.id) openContact(c.id); }, 300); }
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('button[data-call]'); if (!b) return;
    const ctxEl = $('#drawerBody'); const dealId = +(ctxEl && ctxEl.dataset.ctxDeal) || null, contactId = +(ctxEl && ctxEl.dataset.ctxContact) || null;
    const c = contacts.find(k => k.id === contactId) || {};
    dial(b.dataset.num, { name: c.name ? `${c.name}${c.company ? ', ' + c.company : ''}` : c.company || '', dealId, contactId });
  });

  let view = 'today', query = '', who = 'all', showArchived = false;
  const ownerChip = x => x.owner ? `<span class="owner" title="Assigned to ${esc(x.owner)}">${esc(x.owner)}</span>` : '';
  const matches = deal => {
    if (deal.archived) return false;
    return matchesAny(deal);
  };
  const matchesAny = deal => {
    if (who !== 'all' && deal.owner !== who) return false;
    if (!query) return true;
    const c = contactOf(deal);
    return [deal.title, deal.site, deal.needs, c.company, c.name].join(' ').toLowerCase().includes(query);
  };

  // ---------- Views ----------
  function renderToday() {
    const open = deals.filter(x => OPEN.includes(x.stage) && matches(x));
    const overdue = open.filter(x => x.followUp && daysFrom(x.followUp) < 0).sort((a, b) => a.followUp.localeCompare(b.followUp));
    const due = open.filter(x => x.followUp && daysFrom(x.followUp) === 0);
    const upcoming = open.filter(x => x.followUp && daysFrom(x.followUp) > 0 && daysFrom(x.followUp) <= 7).sort((a, b) => a.followUp.localeCompare(b.followUp));
    const proposals = open.filter(x => x.stage === 'Proposal sent' || x.stage === 'Negotiation');
    const pipelineValue = open.reduce((s, x) => s + x.value, 0);
    const won = deals.filter(x => x.stage === 'Won' && !x.archived).reduce((s, x) => s + x.value, 0);

    const taskRow = x => {
      const c = contactOf(x);
      return `<li class="row" data-deal="${x.id}">
        <button class="check" data-done="${x.id}" aria-label="Mark follow-up done" title="Mark done"></button>
        <div class="row-main"><div class="row-title">${esc(x.nextAction)}</div><div class="row-sub">${esc(c.company)} · ${esc(c.name)}${who === 'all' && x.owner ? ` · ${esc(x.owner)}` : ''}</div></div>
        <div class="row-meta">${duePill(x)}</div></li>`;
    };
    const group = (label, items) => items.length ? `<div class="section-label">${label} · ${items.length}</div>${items.map(taskRow).join('')}` : '';
    const soon = new Date(today.getTime() + 2 * DAY);
    const agenda = acts.filter(a => a.status !== 'cancelled' && !a.done && !a.logged && mineAct(a) && new Date(a.startsAt) < soon && !(deals.find(x => x.id === a.dealId) || {}).archived).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    const nudges = open.filter(needsNudge).map(x => [x, stageAge(x)]).sort((a, b) => (b[1].idle - b[1].limit) - (a[1].idle - a[1].limit));
    const tasks = group('Overdue', overdue) + group('Due today', due) + group('Next 7 days', upcoming);

    $('#view').innerHTML = `
      <div class="kpis">
        <div class="kpi ${overdue.length ? 'alert' : ''}"><div class="label">Overdue follow-ups</div><div class="value num">${overdue.length}</div></div>
        <div class="kpi"><div class="label">Due today</div><div class="value num">${due.length}</div></div>
        <div class="kpi"><div class="label">Open pipeline (CAD)</div><div class="value num">${money(pipelineValue)}</div></div>
        <div class="kpi"><div class="label">Won (CAD)</div><div class="value num">${money(won)}</div></div>
      </div>
      ${agenda.length ? `<div class="panel today-acts"><div class="panel-head"><h2>Tasks and meetings</h2><span class="count">${agenda.length}</span></div><ul class="list">${agenda.map(a => actRow(a, true)).join('')}</ul></div>` : ''}
      ${nudges.length ? `<div class="panel today-acts stage-nudges"><div class="panel-head"><h2>Stage reminders</h2><span class="count">${nudges.length}</span></div><ul class="list">${nudges.map(([x, a]) => { const c = contactOf(x); return `<li class="row" data-deal="${x.id}"><div class="row-main"><div class="row-title">${esc(c.company || x.title)}</div><div class="row-sub">${esc(x.title)} · no update in ${a.idle} day${a.idle === 1 ? '' : 's'}${who === 'all' && x.owner ? ` · ${esc(x.owner)}` : ''}</div></div><div class="row-meta">${stagePill(x.stage)}</div></li>`; }).join('')}</ul></div>` : ''}
      <div class="grid-2">
        <div class="panel"><div class="panel-head"><h2>Who needs attention</h2><span class="count">${overdue.length + due.length + upcoming.length} tasks</span></div>
          <ul class="list">${tasks || '<li class="empty">No follow-ups. You are caught up.</li>'}</ul></div>
        <div class="panel"><div class="panel-head"><h2>Open proposals</h2><span class="count">${proposals.length}</span></div>
          <ul class="list">${proposals.map(x => { const c = contactOf(x); return `<li class="row" data-deal="${x.id}"><div class="row-main"><div class="row-title">${esc(c.company)}</div><div class="row-sub">${esc(x.title)}</div></div><div class="row-meta"><div class="num"><b>${money(x.value)}</b></div>${stagePill(x.stage)}</div></li>`; }).join('') || '<li class="empty">No open proposals.</li>'}</ul></div>
      </div>`;
  }

  function renderPipeline() {
    const archivedList = deals.filter(x => x.archived && matchesAny(x));
    const card = x => { const c = contactOf(x); return `<div class="card" draggable="true" data-deal="${x.id}"><div class="card-title">${esc(c.company)}</div><div class="card-sub">${esc(x.title)}</div><div class="card-foot"><span class="card-value num">${money(x.value)}</span>${ownerChip(x)}${x.archived ? '' : duePill(x)}</div></div>`; };
    const archCol = showArchived ? `<div class="col col-archived"><div class="col-head"><h3>Archived <span>· ${archivedList.length}</span></h3></div>${archivedList.map(card).join('') || '<p class="import-note">Nothing archived.</p>'}</div>` : '';
    $('#view').innerHTML = `<div class="board-tools"><label class="arch-toggle"><input type="checkbox" id="showArch" ${showArchived ? 'checked' : ''}> Show archived (${archivedList.length})</label></div><div class="board">${STAGES.map(stage => {
      const items = deals.filter(x => x.stage === stage && matches(x));
      const total = items.reduce((s, x) => s + x.value, 0);
      return `<div class="col" data-stage="${stage}"><div class="col-head"><h3>${stage} <span>· ${items.length}</span></h3><span class="num">${money(total)}</span></div>
        ${items.map(card).join('')}
      </div>`;
    }).join('')}${archCol}</div>`;
    $('#showArch').onchange = e => { showArchived = e.target.checked; render(); };
    // drag and drop between stages (desktop); stage buttons in the deal panel work everywhere
    let dragId = null;
    document.querySelectorAll('.card').forEach(el => {
      el.addEventListener('dragstart', () => { dragId = +el.dataset.deal; el.classList.add('dragging'); });
      el.addEventListener('dragend', () => el.classList.remove('dragging'));
    });
    document.querySelectorAll('.col:not(.col-archived)').forEach(col => {
      col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('drop'); });
      col.addEventListener('dragleave', () => col.classList.remove('drop'));
      col.addEventListener('drop', e => { e.preventDefault(); col.classList.remove('drop'); const x = deals.find(z => z.id === dragId); if (x && x.stage !== col.dataset.stage) { x.stage = col.dataset.stage; saveDeal(x); toast(`Moved to ${x.stage}`); render(); } });
    });
  }

  function renderContacts() {
    const list = contacts.filter(c => !query || [c.company, c.name, c.email, c.title].join(' ').toLowerCase().includes(query));
    $('#view').innerHTML = `<div class="toolbar"><p>${list.length} contacts</p><div class="toolbar-actions"><button class="secondary" id="importTrello2">Import from Trello</button><button class="secondary" id="newContact">+ New contact</button></div></div>
      <div class="table-wrap"><table><thead><tr><th>Company</th><th>Contact</th><th class="hide-sm">Title</th><th class="hide-sm">Phone</th><th>Open deals</th></tr></thead>
      <tbody>${list.map(c => { const open = deals.filter(x => x.contactId === c.id && OPEN.includes(x.stage) && !x.archived); return `<tr data-contact="${c.id}"><td><b>${esc(c.company)}</b></td><td>${esc(c.name)}</td><td class="hide-sm">${esc(c.title)}</td><td class="hide-sm num">${esc(c.phone)}</td><td class="num">${open.length} · ${money(open.reduce((s, x) => s + x.value, 0))}</td></tr>`; }).join('') || '<tr><td colspan="5" class="empty">No matching contacts.</td></tr>'}</tbody></table></div>`;
    $('#newContact').onclick = () => openContact(null);
    $('#importTrello2').onclick = openImport;
  }


  // ---------- Sales Assistant (prototype: rule-based, no AI, never sends) ----------
  function score(x) {
    const n = x.followUp ? daysFrom(x.followUp) : 99;
    let pts = 0, why = [];
    if (n < 0) { pts += 50 + (-n) * 5; why.push(`follow-up ${-n} day${n === -1 ? '' : 's'} overdue`); }
    else if (n === 0) { pts += 40; why.push('follow-up due today'); }
    else if (n <= 2) { pts += 15; why.push(`follow-up in ${n} day${n === 1 ? '' : 's'}`); }
    if (x.stage === 'Negotiation') { pts += 25; why.push('in negotiation'); }
    if (x.stage === 'Proposal sent') {
      pts += 20;
      const sent = x.notes.filter(z => /proposal/i.test(z.text)).map(z => z.at).sort().pop();
      const age = sent ? -daysFrom(localDay(sent)) : null;
      why.push(age != null ? `proposal out ${age} days` : 'proposal waiting on reply');
    }
    pts += Math.min(x.value / 2000, 30);
    if (x.value >= 30000) why.push(`${money(x.value)} deal`);
    return { pts, why };
  }
  function suggestion(x) {
    return ({ 'New lead': `Call to introduce ${CO} and qualify the site`, 'Contacted': 'Book the site visit', 'Site visit': 'Confirm visit time and who will attend', 'Proposal sent': 'Check the proposal arrived and ask for questions', 'Negotiation': 'Answer the open point and propose a decision date' })[x.stage] || x.nextAction;
  }
  function draftFor(x) {
    const c = contactOf(x); const first = (c.name || '').split(' ')[0] || 'there';
    const lastNote = x.notes.length ? x.notes[x.notes.length - 1].text : '';
    const body = {
      'New lead': `Thanks for your interest in ${CO}. I'd like to learn a bit more about your site at ${x.site || 'your location'} and what you're looking to protect.\n\nWould you have 15 minutes this week for a quick call?`,
      'Contacted': `Following up on our conversation about ${x.title.toLowerCase()}. The best next step is a short site visit so we can see the layout and give you an accurate recommendation.\n\nWhat day works for you this week or next?`,
      'Site visit': `Just confirming our site visit at ${x.site || 'your site'}. Please let me know the best time and who should join us.`,
      'Proposal sent': `I wanted to make sure the proposal for ${x.title.toLowerCase()} reached you.${x.proposal ? `\n\nHere it is again: ${x.proposal}` : ''}\n\nHappy to walk through it or adjust anything. Do you have any questions so far?`,
      'Negotiation': `Thanks for the feedback on the proposal.${lastNote ? ` You mentioned: "${lastNote}"` : ''} I'm putting together an updated option and will have it to you shortly.\n\nWould a quick call help to finalize the details?`,
    }[x.stage] || `Following up on ${x.title.toLowerCase()}.`;
    if (x.draft) return { to: c.email, subject: x.draft.subject, text: x.draft.text, saved: true };
    return { to: c.email, subject: `${x.title} — ${CO}`, text: `Hi ${first},\n\n${body}\n\nBest regards,\n[Your name]\n${CO}` };
  }

  function renderAssistant() {
    const open = deals.filter(x => OPEN.includes(x.stage) && matches(x)).map(x => ({ x, ...score(x) })).sort((a, b) => b.pts - a.pts);
    const top = open.filter(o => o.pts >= 40).slice(0, 5);
    const stale = deals.filter(x => x.stage === 'Proposal sent' && matches(x));
    const atRisk = open.filter(o => o.x.followUp && daysFrom(o.x.followUp) < 0).reduce((s, o) => s + o.x.value, 0);
    $('#view').innerHTML = `
      <div class="assist-intro"><div class="assist-badge"><svg viewBox="0 0 24 24"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/></svg></div>
        <div><h2>Sales Assistant · daily briefing</h2><p>${top.length} deal${top.length === 1 ? '' : 's'} need you today. ${money(atRisk)} sits behind overdue follow-ups. Drafts are for your review. Nothing is sent automatically.</p></div></div>
      <div class="grid-2">
        <div class="panel"><div class="panel-head"><h2>Do these first</h2><span class="count">ranked by urgency and value</span></div>
          <ul class="brief">${top.map((o, i) => { const c = contactOf(o.x); return `<li><span class="prio">${i + 1}</span>
            <div class="row-main" data-deal="${o.x.id}"><div class="row-title">${esc(c.company)}</div><div class="row-sub">${esc(suggestion(o.x))}</div><div class="why">Why: ${esc(o.why.join(' · '))}</div></div>
            <div class="row-meta"><button class="secondary" data-draft="${o.x.id}">Draft follow-up</button></div></li>`; }).join('') || '<li class="empty">Nothing urgent today.</li>'}</ul></div>
        <div>
          <div class="panel"><div class="panel-head"><h2>Proposals waiting on a reply</h2><span class="count">${stale.length}</span></div>
            <ul class="list">${stale.map(x => { const c = contactOf(x); return `<li class="row" data-deal="${x.id}"><div class="row-main"><div class="row-title">${esc(c.company)}</div><div class="row-sub">${esc(score(x).why.filter(w => /proposal/.test(w)).join('') || 'Waiting on reply')}</div></div><div class="row-meta num"><b>${money(x.value)}</b></div></li>`; }).join('') || '<li class="empty">None waiting.</li>'}</ul></div>
          <div class="panel" style="margin-top:20px"><div class="panel-head"><h2>Sales Assistant rules</h2></div>
            <div style="padding:12px 16px"><ul class="rules"><li>Reads your pipeline and drafts. Never sends email.</li><li>No price changes, deletions, or commitments to customers.</li><li>You approve every message before it goes out.</li><li>Prototype: drafts come from templates. AI writing comes in a later phase.</li></ul></div></div>
        </div>
      </div>`;
  }

  function openDraft(id) {
    const x = deals.find(z => z.id === id); const c = contactOf(x); const dr = draftFor(x);
    openDrawer(`Draft · ${c.company}`, `
      <p class="draft-meta">${dr.saved ? 'Saved Sales Assistant draft for this deal.' : 'Template draft.'} For review. Edit it, then press Send from CRM (it goes from your own address and is saved on the deal). Or open it in your email app and log it here once you send it.</p>
      ${connectBox()}
      <div class="fields">
        <div class="field full"><label>To</label><div class="static">${esc(c.name)} &lt;${esc(dr.to)}&gt;</div></div>
        <div class="field full"><label for="dr-subject">Subject</label><input id="dr-subject" value="${esc(dr.subject)}"></div>
        <div class="field full"><label for="dr-body">Message</label><textarea id="dr-body" style="min-height:340px">${esc(dr.text)}</textarea></div>
      </div>
      <div class="actions"><button class="primary" id="sendDraft">Send from CRM</button><a class="secondary btn-link" id="mailDraft" href="${esc(mailHref(dr.to, dr.subject, dr.text))}">Open in email</a><button class="secondary" id="copyDraft">Copy draft</button><button class="secondary" id="logSent">I sent it — log it</button><button class="secondary" id="backDeal">Open deal</button></div>`);
    const syncMail = () => { $('#mailDraft').href = mailHref(dr.to, $('#dr-subject').value, $('#dr-body').value); };
    $('#dr-subject').oninput = syncMail; $('#dr-body').oninput = syncMail;
    $('#mailDraft').onclick = () => { syncMail(); toast('Opening your email app. Press Send there, then log it here.'); };
    $('#copyDraft').onclick = async () => {
      const t = `Subject: ${$('#dr-subject').value}\n\n${$('#dr-body').value}`;
      try { await navigator.clipboard.writeText(t); toast('Draft copied'); }
      catch { const el = $('#dr-body'); el.focus(); el.select(); toast('Selected. Press Ctrl/Cmd+C to copy'); }
    };
    $('#logSent').onclick = () => { note(x, `Follow-up email sent: "${$('#dr-subject').value}"`); x.followUp = d(3); x.nextAction = 'Check for reply'; delete x.draft; saveDeal(x); toast('Logged · reply check in 3 days'); closeDrawer(); render(); };
    $('#backDeal').onclick = () => openDeal(x.id);
    wireConnect(() => $('#sendDraft').click());
    $('#sendDraft').onclick = async e => {
      const n = await sendEmail(e.target, x, c, { to: dr.to, cc: '', subject: $('#dr-subject').value.trim(), text: $('#dr-body').value });
      if (!n) return;
      x.followUp = d(3); x.nextAction = 'Check for reply'; delete x.draft; saveDeal(x); closeDrawer(); render();
    };
  }

  function renderReports() {
    const live = deals.filter(x => !x.archived);
    const open = live.filter(x => OPEN.includes(x.stage));
    const won = live.filter(x => x.stage === 'Won');
    const ym = d(0).slice(0, 7);
    const wonMonth = won.filter(x => x.wonAt && x.wonAt.slice(0, 7) === ym);
    const sum = a => a.reduce((t, x) => t + (x.value || 0), 0);
    const overdue = x => x.followUp && daysFrom(x.followUp) < -3;
    const quiet = x => x.updatedAt && (Date.now() - new Date(x.updatedAt)) / DAY > 14;
    const stuck = open.filter(x => overdue(x) || quiet(x)).sort((a, b) => (a.followUp || '').localeCompare(b.followUp || ''));
    const people = [...new Set([...TEAM, ...live.map(x => x.owner).filter(Boolean)])];
    const max = Math.max(1, ...STAGES.map(st => live.filter(x => x.stage === st).length));
    const month = new Date(today).toLocaleString('en-CA', { month: 'long' });
    $('#view').innerHTML = `
      <div class="kpis">
        <div class="kpi"><div class="label">Won in ${month} (CAD)</div><div class="value num">${money(sum(wonMonth))}</div><div class="kpi-sub">${wonMonth.length} deal${wonMonth.length === 1 ? '' : 's'}</div></div>
        <div class="kpi"><div class="label">Won all time (CAD)</div><div class="value num">${money(sum(won))}</div><div class="kpi-sub">${won.length} deal${won.length === 1 ? '' : 's'}</div></div>
        <div class="kpi"><div class="label">Open pipeline (CAD)</div><div class="value num">${money(sum(open))}</div><div class="kpi-sub">${open.length} open deal${open.length === 1 ? '' : 's'}</div></div>
        <div class="kpi ${stuck.length ? 'alert' : ''}"><div class="label">Stuck deals</div><div class="value num">${stuck.length}</div><div class="kpi-sub">overdue 3+ days or quiet 14+ days</div></div>
      </div>
      <div class="grid-2">
        <div class="panel"><div class="panel-head"><h2>By person</h2><span class="count">open · won</span></div>
          <table class="rep"><thead><tr><th>Assigned to</th><th>Open</th><th>Open value</th><th>Won value</th><th>Overdue</th></tr></thead><tbody>
          ${people.map(n => { const o = open.filter(x => x.owner === n), w = won.filter(x => x.owner === n); return `<tr><td>${esc(n)}</td><td class="num">${o.length}</td><td class="num">${money(sum(o))}</td><td class="num">${money(sum(w))}</td><td class="num">${o.filter(x => x.followUp && daysFrom(x.followUp) < 0).length}</td></tr>`; }).join('')}
          </tbody></table></div>
        <div class="panel"><div class="panel-head"><h2>By stage</h2><span class="count">${live.length} deals</span></div>
          <ul class="list">${STAGES.map(st => { const a = live.filter(x => x.stage === st); return `<li class="rep-bar"><span class="rep-label">${esc(st)}</span><span class="rep-track"><span style="width:${Math.round(a.length / max * 100)}%"></span></span><span class="num rep-n">${a.length} · ${money(sum(a))}</span></li>`; }).join('')}</ul></div>
      </div>
      <div class="panel" style="margin-top:16px"><div class="panel-head"><h2>Stuck deals</h2><span class="count">${stuck.length}</span></div>
        <ul class="list">${stuck.map(x => { const c = contactOf(x); return `<li class="row" data-deal="${x.id}"><div class="row-main"><div class="row-title">${esc(c.company || x.title)}</div><div class="row-sub">${esc(x.title)} · ${esc(x.owner || '')}${quiet(x) ? ` · no update in ${Math.floor((Date.now() - new Date(x.updatedAt)) / DAY)} days` : ''}</div></div><div class="row-meta">${duePill(x)}</div></li>`; }).join('') || '<li class="empty">Nothing stuck. Every open deal has a recent update and no follow-up is more than 3 days late.</li>'}</ul></div>`;
  }

  function render() {
    document.querySelectorAll('.nav button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    $('#viewTitle').textContent = { today: 'Today', pipeline: 'Pipeline', contacts: 'Contacts', assistant: 'Sales Assistant', reports: 'Reports', calendar: 'Calendar', invoices: 'Invoices' }[view];
    ({ today: renderToday, pipeline: renderPipeline, contacts: renderContacts, assistant: renderAssistant, reports: renderReports, calendar: renderCalendar, invoices: renderInvoices })[view]();
  }

  const nameOf = email => teamNames[(email || '').toLowerCase()] || email;
  const stampLine = r => (r.createdAt || r.updatedBy) ? `<p class="draft-meta">${r.createdAt ? `Created ${fmtWhen(r.createdAt)}` : ''}${r.createdAt && r.updatedBy ? ' · ' : ''}${r.updatedBy ? `Last updated by ${esc(nameOf(r.updatedBy))}, ${fmtWhen(r.updatedAt)} (${ago(r.updatedAt)})` : ''}</p>` : '';
  const emailNote = n => `<details><summary>${esc(n.text)}</summary><div class="email-meta">From ${esc(n.from || '')} · To ${esc((n.to || []).join(', '))}${n.cc && n.cc.length ? ` · Cc ${esc(n.cc.join(', '))}` : ''}</div><div class="email-body">${esc(n.body || '')}</div></details>`;
  const noteList = list => `<ul class="notes">${list.map((n, i) => ({ ...n, i })).sort((a, b) => String(b.at).localeCompare(String(a.at)) || b.i - a.i).map(n => `<li${n.kind === 'email' ? ' class="note-email"' : ''}><div class="when">${fmtWhen(n.at)}${n.by ? ` · ${esc(n.by)}` : ''}</div>${n.kind === 'email' ? emailNote(n) : esc(n.text)}</li>`).join('') || '<li class="when">No notes yet.</li>'}</ul>`;
  // Every change to these fields is written to the activity notes with the time and who made it.
  function logChanges(x, v) {
    const money0 = n => money(+n || 0);
    if (v.stage !== x.stage) note(x, `Stage: ${x.stage} → ${v.stage}`);
    if (v.owner !== x.owner) note(x, `Assigned to ${v.owner}${x.owner ? ` (was ${x.owner})` : ''}`);
    if ((v.followUp || '') !== (x.followUp || '')) note(x, `Follow-up date: ${v.followUp ? fmtDate(v.followUp) : 'none'}${x.followUp ? ` (was ${fmtDate(x.followUp)})` : ''}`);
    if ((+v.value || 0) !== (+x.value || 0)) note(x, `Value: ${money0(v.value)} (was ${money0(x.value)})`);
    if ((v.nextAction || '') !== (x.nextAction || '')) note(x, `Next action: ${v.nextAction || 'none'}`);
  }
  // ---------- Drawer: deal ----------
  function openDrawer(title, html, ctx = {}) { $('#drawerTitle').textContent = title; const b = $('#drawerBody'); b.innerHTML = html; b.dataset.ctxDeal = ctx.deal || ''; b.dataset.ctxContact = ctx.contact || ''; $('#drawer').hidden = false; }
  function closeDrawer() { $('#drawer').hidden = true; }

  function openDeal(id) {
    const isNew = id == null;
    const x = isNew ? { id: null, owner: who !== 'all' ? who : TEAM[0], contactId: contacts[0] ? contacts[0].id : null, title: '', site: '', needs: '', value: 0, stage: 'New lead', nextAction: '', followUp: d(1), proposal: '', notes: [] } : deals.find(z => z.id === id);
    const c = contactOf(x);
    const idx = STAGES.indexOf(x.stage);
    openDrawer(isNew ? 'New deal' : c.company, `
      ${!isNew && x.archived ? '<p class="arch-note">This deal is archived. It is hidden from Today, Pipeline and the Sales Assistant.</p>' : ''}
      ${isNew ? '' : (() => { if (!STAGE_DAYS[x.stage] || x.archived) return ''; const a = stageAge(x); const late = a.idle >= a.limit; return `<p class="stage-age${late ? ' late' : ''}">In ${esc(x.stage)} for ${a.inStage} day${a.inStage === 1 ? '' : 's'} · ${late ? `no update in ${a.idle} day${a.idle === 1 ? '' : 's'}, ${esc(x.owner || 'the owner')} gets an email reminder` : `reminder after ${a.limit} days with no update`}</p>`; })()}
      ${isNew ? '' : `<div class="stage-bar">${STAGES.map((s, i) => `<button data-stage="${s}" class="${s === x.stage ? 'current' : i < idx && idx < 5 ? 'done' : ''} ${s === 'Won' ? 'won' : s === 'Lost' ? 'lost' : ''}">${s}</button>`).join('')}</div>`}
      ${isNew ? '' : stampLine(x)}
      <form id="dealForm" class="fields">
        <div class="field full"><label for="f-title">Deal name</label><input id="f-title" name="title" required value="${esc(x.title)}"></div>
        <div class="field full"><label for="f-contact">Customer</label><select id="f-contact" name="contactId">${contacts.map(k => `<option value="${k.id}" ${k.id === x.contactId ? 'selected' : ''}>${esc(k.company)} — ${esc(k.name)}</option>`).join('')}</select></div>
        <div class="field full"><label for="f-site">Site address</label><input id="f-site" name="site" value="${esc(x.site)}"></div>
        <div class="field full"><label for="f-needs">Security requirements</label><textarea id="f-needs" name="needs">${esc(x.needs)}</textarea></div>
        <div class="field"><label for="f-owner">Assigned to</label><select id="f-owner" name="owner">${TEAM.map(t => `<option ${t === x.owner ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        <div class="field"><label for="f-value">Estimated value (CAD)</label><input id="f-value" name="value" type="number" min="0" step="100" value="${x.value}"></div>
        <div class="field"><label for="f-stage">Stage</label><select id="f-stage" name="stage">${STAGES.map(s => `<option ${s === x.stage ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
        <div class="field"><label for="f-next">Next action</label><input id="f-next" name="nextAction" value="${esc(x.nextAction)}"></div>
        <div class="field"><label for="f-follow">Follow-up date</label><input id="f-follow" name="followUp" type="date" value="${esc(x.followUp)}"></div>
        <div class="field full"><label for="f-proposal">Proposal link</label><input id="f-proposal" name="proposal" type="url" placeholder="https://" value="${esc(x.proposal)}"></div>
      </form>
      <div class="actions"><button class="primary" id="saveDeal">${isNew ? 'Create deal' : 'Save changes'}</button>${isNew ? '' : '<button class="secondary" id="doneDeal">Follow-up done</button>' + (OPEN.includes(x.stage) ? `<button class="secondary" data-draft="${x.id}">Draft follow-up</button>` : '') + `<button class="secondary" id="archDeal">${x.archived ? 'Restore' : 'Archive'}</button>`}</div>
      ${isNew || x.stage !== 'Won' ? '' : invoiceSection(x, true)}
      ${isNew ? '' : `
        <h3>Contact</h3>
        <div class="static">${esc(c.name)} · ${esc(c.title)}<br><span class="num">${esc(c.phone)}</span> · ${esc(c.email)}</div>
        <div class="actions reach">${reachButtons(c)}<button class="secondary" id="logCallBtn">Log call</button></div>
        <div id="logCallBox" class="log-call" hidden>
          <div class="field full"><label for="callNote">How did the call go?</label><textarea id="callNote" placeholder="e.g. Spoke with Jeff, install booked for Friday"></textarea></div>
          <div class="field"><label for="callFollow">Next follow-up</label><input id="callFollow" type="date" value="${d(3)}"></div>
          <label class="inline-check"><input type="checkbox" id="callTask"> Also make it a task for ${esc(x.owner || 'the assigned person')} (9:00 AM, with an email reminder)</label>
          <div class="actions"><button class="primary" id="saveCall">Save call note</button></div>
        </div>
        ${composeBox(c)}
        <h3>Tasks and meetings</h3>
        <ul class="list act-list">${actsOf(x.id).map(a => actRow(a, false)).join('') || '<li class="empty">No tasks or meetings yet.</li>'}</ul>
        <div class="actions"><button class="secondary" id="addTask">+ Task</button><button class="secondary" id="addMeeting">+ Meeting</button><button class="secondary" id="logMeeting">Log past meeting</button></div>
        ${x.stage === 'Won' ? '' : invoiceSection(x, false)}
        <h3>Activity notes</h3>
        ${noteList(x.notes)}
        <div class="note-add"><input id="noteText" placeholder="Add a note" aria-label="Add a note"><button class="secondary" id="addNote">Add</button></div>`}
    `, isNew ? {} : { deal: x.id, contact: x.contactId });
    const read = () => { const f = new FormData($('#dealForm')); return { title: f.get('title').trim(), owner: f.get('owner'), contactId: +f.get('contactId') || null, site: f.get('site'), needs: f.get('needs'), value: +f.get('value') || 0, stage: f.get('stage'), nextAction: f.get('nextAction'), followUp: f.get('followUp'), proposal: f.get('proposal') }; };
    $('#saveDeal').onclick = async e => {
      const v = read();
      if (!v.title) { $('#f-title').focus(); toast('Add a deal name'); return; }
      if (isNew) {
        const nd = { notes: [], ...v, createdAt: stamp() }; note(nd, `Deal created, assigned to ${v.owner}`);
        if (LIVE) { e.target.disabled = true; try { [nd.id] = await insertRows('deals', [dealToDb(nd)]); } catch (err) { e.target.disabled = false; return failed(err); } } else nd.id = ++uid;
        deals.push(nd); toast('Deal created');
        if (LIVE && nd.owner !== me) notify({ action: 'assigned', deal_id: nd.id }).then(r => r && r.sent && toast(`Deal created · ${nd.owner} was emailed`));
      } else {
        const reassigned = v.owner !== x.owner;
        logChanges(x, v); Object.assign(x, v); toast('Saved');
        saveDeal(x).then(() => { if (LIVE && reassigned && x.owner !== me) notify({ action: 'assigned', deal_id: x.id }).then(r => r && r.sent && toast(`Saved · ${x.owner} was emailed`)); });
      }
      closeDrawer(); render();
    };
    if (!isNew) {
      document.querySelectorAll('.stage-bar button').forEach(b => b.onclick = () => { if (b.dataset.stage === x.stage) return; note(x, `Stage: ${x.stage} → ${b.dataset.stage}`); x.stage = b.dataset.stage; saveDeal(x); toast(`Moved to ${x.stage}`); render(); openDeal(x.id); });
      $('#doneDeal').onclick = () => completeFollowUp(x, true);
      const add = () => { const t = $('#noteText').value.trim(); if (!t) return; note(x, t); saveDeal(x); openDeal(x.id); };
      const showLog = () => { $('#logCallBox').hidden = false; $('#callNote').focus(); };
      $('#logCallBtn').onclick = showLog;
      const callLink = document.querySelector('#drawerBody a[data-call], #drawerBody a[data-cell]');
      if (callLink) callLink.addEventListener('click', () => setTimeout(showLog, 300));
      $('#saveCall').onclick = async () => { const t = $('#callNote').value.trim(); note(x, `Call${c.name ? ` with ${c.name}` : ''}${t ? `: ${t}` : ''}`); if ($('#callFollow').value && $('#callFollow').value !== x.followUp) { note(x, `Follow-up date: ${fmtDate($('#callFollow').value)}`); x.followUp = $('#callFollow').value; } saveDeal(x);
        if ($('#callTask').checked && $('#callFollow').value) {
          const tk = { id: null, dealId: x.id, kind: 'task', title: x.nextAction && x.nextAction !== 'Set next step' ? x.nextAction : `Follow up with ${c.name || c.company || 'customer'}`, startsAt: new Date(`${$('#callFollow').value}T09:00`).toISOString(), endsAt: null, location: '', details: t, assignees: [x.owner || TEAM[0]], inviteCustomer: false, customerEmail: '', remind: 0, logged: false, done: false, status: 'scheduled', createdBy: me || '', createdAt: stamp() };
          if (LIVE) { try { [tk.id] = await insertRows('activities', [{ ...actToDb(tk), created_by: me || '' }]); } catch (err) { return failed(err); } } else tk.id = ++uid;
          acts.push(tk); note(x, `Task: ${tk.title}, due ${fmtWhen(tk.startsAt)}, assigned to ${tk.assignees[0]}`); saveDeal(x); notify({ action: 'invite', id: tk.id });
        }
        toast('Call logged'); render(); openDeal(x.id); };
      $('#archDeal').onclick = () => { x.archived = !x.archived; note(x, x.archived ? 'Archived' : 'Restored from archive'); saveDeal(x); toast(x.archived ? 'Archived. Pipeline › Show archived to restore it.' : 'Restored'); closeDrawer(); render(); };
      $('#addNote').onclick = add;
      wireCompose(x, c, () => openDeal(x.id));
      $('#addTask').onclick = () => openActivity(x.id, 'task');
      $('#addMeeting').onclick = () => openActivity(x.id, 'meeting');
      $('#logMeeting').onclick = () => openActivity(x.id, 'meeting', null, true);
      $('#addInvoice').onclick = () => openInvoice(null, x.id);
      $('#noteText').onkeydown = e => { if (e.key === 'Enter') add(); };
    }
  }

  function completeFollowUp(x, fromDrawer) {
    note(x, `Done: ${x.nextAction}`);
    x.nextAction = 'Set next step';
    x.followUp = d(3);
    saveDeal(x);
    toast('Marked done · next check in 3 days');
    render();
    if (fromDrawer) openDeal(x.id);
  }

  // ---------- Tasks and meetings (activities) ----------
  // A task has a due time and a person; a meeting has a time, place and team attendees and sends calendar invites.
  // Emails (invites, reminders, assignment) are sent by the Supabase function "notify" from crm@forcevision.ca; the demo sends nothing.
  const REMIND = [[null, 'No reminder'], [0, 'At the start time'], [30, '30 minutes before'], [60, '1 hour before'], [1440, '1 day before']];
  const DURS = [[30, '30 min'], [60, '1 hour'], [90, '1.5 hours'], [120, '2 hours'], [180, '3 hours'], [240, 'Half day']];
  const actFromDb = r => ({ id: r.id, dealId: r.deal_id, kind: r.kind, title: r.title, startsAt: r.starts_at, endsAt: r.ends_at, location: r.location || '', details: r.details || '', assignees: r.assignees || [], inviteCustomer: !!r.invite_customer, customerEmail: r.customer_email || '', remind: r.remind_minutes, logged: !!r.logged, done: !!r.done, status: r.status, createdBy: r.created_by || '', createdAt: r.created_at, inviteSentAt: r.invite_sent_at });
  const actToDb = a => ({ deal_id: a.dealId, kind: a.kind, title: a.title, starts_at: a.startsAt, ends_at: a.endsAt, location: a.location, details: a.details, assignees: a.assignees, invite_customer: a.inviteCustomer, customer_email: a.customerEmail, remind_minutes: a.remind, logged: a.logged, done: a.done, status: a.status, ...(companyId ? { company_id: companyId } : {}) });
  async function notify(body) {
    if (!LIVE) return null;
    try { const { data, error } = await sb.functions.invoke('notify', { body }); if (error) throw error; return data; }
    catch (err) { console.error(err); toast('Saved, but the email did not go out. Try again later.'); return null; }
  }

  // ---------- Email from the CRM ----------
  // Sent by the notify function from the signed-in person's own forcevision.ca mailbox (a copy goes to their Sent folder),
  // then saved in the deal notes and the contact's notes so the whole team sees it. The demo sends nothing.
  let mailboxOk = null, mySig = '', mySigHtml = '';
  const sigText = () => mySig || `${me || ''}\nForceVision`;
  const sigHtml = () => mySigHtml || esc(sigText()).replace(/\n/g, '<br>');
  // Signatures pasted from Outlook or webmail keep their logo, colours and links; anything that could run code is removed.
  const SAFE_TAGS = new Set('A B BR DIV FONT HR I IMG LI OL P SPAN STRONG EM U UL TABLE TBODY THEAD TR TD TH CENTER SMALL SUB SUP H1 H2 H3 H4'.split(' '));
  const SAFE_ATTR = new Set(['href', 'src', 'alt', 'width', 'height', 'style', 'color', 'size', 'face', 'align', 'valign', 'border', 'cellpadding', 'cellspacing', 'bgcolor', 'title', 'target']);
  // A logo pasted from Outlook is often embedded in the email, not linked, and is lost on paste. Use the hosted ForceVision signature logo instead.
  const SIG_LOGO = 'https://forcevision.ca/signature/logo-email-e88828.png?v=1';
  function cleanHtml(html) {
    const root = new DOMParser().parseFromString(`<div>${String(html).replace(/<!--[\s\S]*?-->/g, '')}</div>`, 'text/html').body.firstChild;
    const walk = el => [...el.children].forEach(ch => {
      if (/^(SCRIPT|STYLE|META|LINK|TITLE|HEAD|IFRAME|OBJECT|EMBED|FORM|INPUT|BUTTON|SVG)$/i.test(ch.tagName)) { ch.remove(); return; }
      walk(ch);
      if (!SAFE_TAGS.has(ch.tagName)) { ch.replaceWith(...ch.childNodes); return; }
      [...ch.attributes].forEach(a => { const n = a.name.toLowerCase(), v = a.value.trim();
        if (!SAFE_ATTR.has(n) || ((n === 'href' || n === 'src') && !/^(https?:|mailto:|tel:)/i.test(v)) || (n === 'style' && /expression|url\(|javascript/i.test(v))) ch.removeAttribute(a.name); });
    });
    walk(root);
    root.querySelectorAll('img').forEach(i => { if (!/^https?:/i.test(i.getAttribute('src') || '')) { i.setAttribute('src', SIG_LOGO); if (!i.getAttribute('alt')) i.setAttribute('alt', 'ForceVision'); if (!/max-width|width/i.test(i.getAttribute('style') || '') && !i.getAttribute('width')) i.setAttribute('width', '160'); } });
    return root.innerHTML.trim();
  }
  const bodyHtml = t => `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.45">${esc(t).replace(/\n/g, '<br>')}</div>`;
  async function callFn(body) {
    const { data, error } = await sb.functions.invoke('notify', { body });
    if (error) { let m = error.message; try { m = (await error.context.json()).error || m; } catch { /* keep message */ } throw new Error(m); }
    return data;
  }
  const connectBox = () => `<div id="mailConnect" class="log-call" hidden>
      <p class="import-note">One-time setup: enter the password for <b>${esc(myEmail)}</b>, the same one you use for webmail. It is stored encrypted and only used to send your emails from the CRM.</p>
      <div class="field full"><label for="mb-pass">Mailbox password</label><input id="mb-pass" type="password" autocomplete="current-password"></div>
      <div class="actions"><button class="primary" id="mbConnect">Connect my mailbox</button></div>
    </div>`;
  const firstName = c => String(c.name || '').trim().split(/\s+/)[0];
  const composeBox = c => !c.email ? '' : `<div id="mailBox" class="log-call" hidden>
      ${connectBox()}
      <div id="mailForm" class="mail-form">
        <p class="draft-meta">${LIVE ? `Sends from ${esc(myEmail)}. It is saved in the notes so the team can see it.` : 'Demo: nothing is really sent. The email is only added to the notes.'}</p>
        <div class="field full"><label for="m-to">To</label><input id="m-to" value="${esc(c.email)}"></div>
        <div class="field full"><label for="m-cc">Cc (optional)</label><input id="m-cc" placeholder="Separate addresses with commas"></div>
        <div class="field full"><label for="m-subject">Subject</label><input id="m-subject"></div>
        <div class="field full"><label for="m-body">Message</label><textarea id="m-body" style="min-height:200px">${esc(`${firstName(c) ? `Hi ${firstName(c)},` : 'Hello,'}\n\n`)}</textarea></div>
        <div class="field full"><label class="inline-check"><input type="checkbox" id="m-usesig" checked> Add my signature</label><div class="sig-preview" id="sigPreview">${sigHtml()}</div></div>
        <div class="actions"><button class="primary" id="mSend">Send email</button><a class="secondary btn-link" id="mApp" href="#">Use my email app instead (not tracked)</a><button class="secondary" id="mSigBtn">My signature</button></div>
        <div id="sigBox" class="log-call" hidden>
          <div class="field full"><label id="sig-label">My signature</label><div id="sig-rich" class="sig-edit" contenteditable="true" role="textbox" aria-multiline="true" aria-labelledby="sig-label">${sigHtml()}</div></div>
          <p class="import-note">To keep your logo and colours, copy your signature from an email in Outlook or webmail and paste it here. It is added to the end of every email you send from the CRM. Only you can change yours.</p>
          <div class="actions"><button class="primary" id="sigSave">Save signature</button></div>
        </div>
      </div>
    </div>`;
  function wireConnect(after) {
    const btn = $('#mbConnect'); if (!btn) return;
    btn.onclick = async () => {
      const pw = $('#mb-pass').value; if (!pw) { $('#mb-pass').focus(); return; }
      btn.disabled = true; btn.textContent = 'Checking…';
      try { const r = await callFn({ action: 'mailbox', password: pw }); if (!r.connected) { toast(r.error || 'That password did not work'); return; }
        mailboxOk = true; $('#mb-pass').value = ''; $('#mailConnect').hidden = true; toast('Mailbox connected'); after && after(); }
      catch (err) { toast(err.message); }
      finally { btn.disabled = false; btn.textContent = 'Connect my mailbox'; }
    };
    $('#mb-pass').onkeydown = e => { if (e.key === 'Enter') btn.click(); };
  }
  // Sends one email and adds the saved note locally. Returns the note, or null if it was not sent.
  async function sendEmail(btn, x, c, m) {
    if (!m.to.trim()) { toast('Add who it goes to'); return null; }
    if (!m.subject) { toast('Add a subject'); return null; }
    let n;
    if (LIVE) {
      if (mailboxOk === false) { $('#mailConnect').hidden = false; $('#mb-pass').focus(); toast('Connect your mailbox first'); return null; }
      const label = btn.textContent; btn.disabled = true; btn.textContent = 'Sending…';
      try {
        const r = await callFn({ action: 'email', deal_id: x ? x.id : null, contact_id: c && c.id ? c.id : null, ...m });
        if (r.error === 'connect') { mailboxOk = false; $('#mailConnect').hidden = false; $('#mb-pass').focus(); toast(r.message); return null; }
        mailboxOk = true; n = r.note;
      } catch (err) { toast(`Not sent: ${err.message}`); return null; }
      finally { btn.disabled = false; btn.textContent = label; }
    } else {
      const to = m.to.split(/[,;\s]+/).filter(Boolean), cc = m.cc.split(/[,;\s]+/).filter(Boolean);
      n = { at: stamp(), kind: 'email', text: `Email sent to ${[...to, ...cc].join(', ')}: "${m.subject}"`, from: 'you (demo)', to, cc, subject: m.subject, body: m.text, ...(me ? { by: me } : {}) };
    }
    if (x) x.notes.push(n);
    if (c && c.id) { c.log = c.log || []; c.log.push(n); }
    toast(LIVE ? `Sent from ${myEmail} · saved in the notes` : 'Demo: added to the notes, not really sent');
    return n;
  }
  function wireCompose(x, c, after) {
    const box = $('#mailBox'); if (!box) return;
    const focus = () => ($('#mailConnect').hidden ? $('#m-subject') : $('#mb-pass')).focus();
    document.querySelectorAll('#drawerBody [data-compose]').forEach(b => b.onclick = async () => {
      box.hidden = false;
      if (LIVE && mailboxOk === null) { try { mailboxOk = !!(await callFn({ action: 'mailbox' })).connected; } catch { mailboxOk = null; } }
      $('#mailConnect').hidden = !(LIVE && mailboxOk === false);
      box.scrollIntoView({ block: 'nearest' }); focus();
    });
    wireConnect(() => $('#m-subject').focus());
    $('#sig-rich').addEventListener('paste', e => { const h = e.clipboardData && e.clipboardData.getData('text/html'); if (!h) return; e.preventDefault(); document.execCommand('insertHTML', false, cleanHtml(h)); });
    $('#mSigBtn').onclick = () => { $('#sigBox').hidden = !$('#sigBox').hidden; if (!$('#sigBox').hidden) $('#sig-rich').focus(); };
    $('#sigSave').onclick = async e => {
      const ed = $('#sig-rich'), html = cleanHtml(ed.innerHTML), sig = ed.innerText.replace(/\n{3,}/g, '\n\n').trim();
      if (LIVE) { e.target.disabled = true; const { error } = await sb.rpc('crm_set_signature', { sig, sig_html: sig ? html : '' }); e.target.disabled = false; if (error) { toast('Signature not saved. Try again.'); return; } }
      mySig = sig; mySigHtml = sig ? html : '';
      $('#sigPreview').innerHTML = sigHtml(); $('#sigBox').hidden = true;
      toast('Signature saved');
    };
    $('#mApp').onclick = e => { e.currentTarget.href = mailHref($('#m-to').value, $('#m-subject').value, $('#m-body').value); };
    $('#m-usesig').onchange = e => { $('#sigPreview').hidden = !e.target.checked; };
    $('#mSend').onclick = async e => {
      const body = $('#m-body').value.replace(/\s+$/, ''), sig = $('#m-usesig').checked;
      const n = await sendEmail(e.target, x, c, { to: $('#m-to').value, cc: $('#m-cc').value, subject: $('#m-subject').value.trim(), text: sig ? `${body}\n\n${sigText()}` : body, html: `${bodyHtml(body)}${sig ? `<br>${sigHtml()}` : ''}` });
      if (n) { render(); after(); }
    };
  }
  const isoLocal = iso => { const t = new Date(iso); return { date: localDay(iso), time: `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}` }; };
  const timeOnly = iso => new Date(iso).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });
  const actsOf = dealId => acts.filter(a => a.dealId === dealId && a.status !== 'cancelled').sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const mineAct = a => who === 'all' || a.assignees.includes(who);
  const actLate = a => a.kind === 'task' && !a.done && new Date(a.startsAt) < new Date();
  const actLabel = a => a.kind === 'task' ? 'Task' : a.logged ? 'Meeting (logged)' : 'Meeting';
  const actRow = (a, showDeal, timeOnlyPill) => {
    const deal = deals.find(x => x.id === a.dealId); const c = deal ? contactOf(deal) : {};
    const sub = [showDeal && deal ? (c.company || deal.title) : '', a.kind === 'meeting' && a.location ? a.location : '', a.assignees.join(', ')].filter(Boolean).join(' · ');
    return `<li class="row act-row${a.done ? ' is-done' : ''}" data-act="${a.id}">
      ${a.kind === 'task' ? `<button class="check${a.done ? ' checked' : ''}" data-actdone="${a.id}" aria-label="${a.done ? 'Mark task not done' : 'Mark task done'}" title="${a.done ? 'Done' : 'Mark done'}">${a.done ? '✓' : ''}</button>` : `<span class="act-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 5h16v15H4zM4 9h16M9 3v4M15 3v4"/></svg></span>`}
      <div class="row-main"><div class="row-title">${esc(a.title)}</div><div class="row-sub">${esc(actLabel(a))}${sub ? ' · ' + esc(sub) : ''}</div></div>
      <div class="row-meta"><span class="pill ${actLate(a) ? 'red' : a.kind === 'meeting' && !a.logged ? 'blue' : ''}">${esc(timeOnlyPill && !actLate(a) ? timeOnly(a.startsAt) : fmtWhen(a.startsAt))}</span></div></li>`;
  };

  function openActivity(dealId, kind, id, logged) {
    const deal = deals.find(x => x.id === dealId); const c = deal ? contactOf(deal) : {};
    const old = id ? acts.find(a => a.id === id) : null;
    const isNew = !old;
    const start = new Date(); start.setDate(start.getDate() + 1); start.setHours(10, 0, 0, 0);
    if (logged) { start.setTime(Date.now()); start.setMinutes(0, 0, 0); }
    const a = old ? { ...old, assignees: [...old.assignees] } : { id: null, dealId, kind, logged: !!logged, done: !!logged, status: 'scheduled', startsAt: start.toISOString(), endsAt: kind === 'meeting' ? new Date(start.getTime() + 3600000).toISOString() : null, title: kind === 'task' ? `Follow up with ${c.name || c.company || 'customer'}` : `Site visit: ${c.company || deal.title}`, location: deal.site || c.address || '', details: '', assignees: [...new Set([deal.owner, me].filter(n => n && TEAM.includes(n)))], inviteCustomer: false, customerEmail: c.email || '', remind: logged ? null : 60 };
    if (!a.assignees.length) a.assignees = [deal.owner || TEAM[0]];
    const { date, time } = isoLocal(a.startsAt);
    const dur = a.endsAt ? Math.round((new Date(a.endsAt) - new Date(a.startsAt)) / 60000) : 60;
    const meeting = a.kind === 'meeting', planned = !a.logged;
    const heading = isNew ? (meeting ? (planned ? 'Schedule meeting' : 'Log a past meeting') : 'New task') : `Edit ${actLabel(a).toLowerCase()}`;
    openDrawer(heading, `
      <p class="draft-meta">${esc(c.company || '')}${deal ? ' · ' + esc(deal.title) : ''}${old && old.createdBy ? ` · created by ${esc(old.createdBy)}, ${esc(fmtWhen(old.createdAt))}` : ''}</p>
      <form id="actForm" class="fields">
        <div class="field full"><label for="a-title">${meeting ? 'Meeting title' : 'Task'}</label><input id="a-title" required value="${esc(a.title)}"></div>
        <div class="field"><label for="a-date">${meeting ? 'Date' : 'Due date'}</label><input id="a-date" type="date" value="${esc(date)}"></div>
        <div class="field"><label for="a-time">${meeting ? 'Start time' : 'Due time'}</label><input id="a-time" type="time" step="900" value="${esc(time)}"></div>
        ${meeting ? `<div class="field"><label for="a-dur">Length</label><select id="a-dur">${DURS.map(([m, l]) => `<option value="${m}" ${m === dur ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <div class="field"><label for="a-loc">Where</label><input id="a-loc" value="${esc(a.location)}" placeholder="Site address, office or phone"></div>` : ''}
        <fieldset class="field full team-pick"><legend>${meeting ? 'Team attending' : 'Assigned to'}</legend>${TEAM.map(t => `<label><input type="checkbox" name="who" value="${esc(t)}" ${a.assignees.includes(t) ? 'checked' : ''}> ${esc(t)}</label>`).join('')}</fieldset>
        ${planned ? `<div class="field"><label for="a-remind">Email reminder</label><select id="a-remind">${REMIND.map(([m, l]) => `<option value="${m ?? ''}" ${m === a.remind ? 'selected' : ''}>${l}</option>`).join('')}</select></div>` : ''}
        ${meeting && planned ? `<div class="field full"><label class="inline-check"><input type="checkbox" id="a-cust" ${a.inviteCustomer ? 'checked' : ''} ${c.email ? '' : 'disabled'}> Send invite to customer${c.email ? ` (${esc(c.email)})` : ' (no email on this contact)'}</label></div>` : ''}
        <div class="field full"><label for="a-details">${meeting && planned ? 'Description (goes in the invite)' : 'Notes'}</label><textarea id="a-details">${esc(a.details)}</textarea></div>
      </form>
      <p class="import-note">${meeting && planned ? 'The team attending gets a calendar invite by email (works with Outlook, Google and iPhone calendars). The customer gets one only if you tick the box, and sees the title, time, place and description.' : planned ? 'The person assigned gets an email when you give them the task, and a reminder if you pick one.' : 'Logged meetings are saved to the lead. No emails are sent.'}${LIVE ? '' : ' Demo: no emails are sent.'}</p>
      <div class="actions"><button class="primary" id="saveAct">${isNew ? (meeting ? (planned ? 'Schedule and send invites' : 'Log meeting') : 'Create task') : (meeting && planned ? 'Save and send update' : 'Save')}</button>
        <button class="secondary" id="backAct">Back to lead</button>
        ${!isNew && a.kind === 'task' ? `<button class="secondary" id="doneAct">${a.done ? 'Mark not done' : 'Mark done'}</button>` : ''}
        ${!isNew && meeting && planned && a.status !== 'cancelled' ? '<button class="secondary danger" id="cancelAct">Cancel meeting</button>' : ''}</div>`);
    $('#backAct').onclick = () => deal ? openDeal(deal.id) : closeDrawer();
    $('#saveAct').onclick = async e => {
      const title = $('#a-title').value.trim();
      if (!title) { $('#a-title').focus(); return toast('Add a title'); }
      if (!$('#a-date').value || !$('#a-time').value) return toast('Pick a date and time');
      const people = [...document.querySelectorAll('[name=who]:checked')].map(i => i.value);
      if (!people.length) return toast(meeting ? 'Pick who is attending' : 'Pick who the task is for');
      const s = new Date(`${$('#a-date').value}T${$('#a-time').value}`);
      const v = { title, startsAt: s.toISOString(), assignees: people, details: $('#a-details').value.trim() };
      if (meeting) { v.endsAt = new Date(s.getTime() + +$('#a-dur').value * 60000).toISOString(); v.location = $('#a-loc').value.trim(); }
      if (planned) v.remind = $('#a-remind').value === '' ? null : +$('#a-remind').value;
      if (meeting && planned) { v.inviteCustomer = !!$('#a-cust').checked && !!c.email; v.customerEmail = c.email || ''; }
      const moved = old && v.startsAt !== old.startsAt;
      const peopleAdded = old && people.some(p => !old.assignees.includes(p));
      Object.assign(a, v);
      e.target.disabled = true;
      if (LIVE) {
        try {
          if (isNew) { const [nid] = await insertRows('activities', [{ ...actToDb(a), created_by: me || '' }]); a.id = nid; a.createdBy = me || ''; a.createdAt = stamp(); }
          else { const { error } = await sb.from('activities').update({ ...actToDb(a), ...(moved ? { reminded_at: null } : {}) }).eq('id', a.id); if (error) throw error; }
        } catch (err) { e.target.disabled = false; return failed(err); }
      } else if (isNew) { a.id = ++uid; a.createdBy = me || ''; a.createdAt = stamp(); }
      if (isNew) acts.push(a); else Object.assign(old, a);
      if (deal) {
        const whenTxt = fmtWhen(a.startsAt);
        note(deal, isNew ? (meeting ? (planned ? `Meeting scheduled: ${a.title}, ${whenTxt}${a.location ? ' at ' + a.location : ''} (team: ${people.join(', ')}${a.inviteCustomer ? ', customer invited' : ''})` : `Meeting logged: ${a.title}, ${whenTxt}${a.details ? ' · ' + a.details : ''}`) : `Task: ${a.title}, due ${whenTxt}, assigned to ${people.join(', ')}`)
          : `${meeting ? 'Meeting' : 'Task'} updated: ${a.title}, ${whenTxt}`);
        saveDeal(deal);
      }
      let msg = isNew ? (meeting ? (planned ? 'Meeting scheduled' : 'Meeting logged') : 'Task created') : 'Saved';
      if (planned && (isNew || meeting || peopleAdded)) { const r = await notify({ action: 'invite', id: a.id }); if (r && r.sent) msg += ` · ${r.sent} email${r.sent === 1 ? '' : 's'} sent`; }
      toast(msg); render(); deal ? openDeal(deal.id) : closeDrawer();
    };
    if ($('#doneAct')) $('#doneAct').onclick = () => toggleActDone(old, true);
    if ($('#cancelAct')) $('#cancelAct').onclick = async e => {
      e.target.disabled = true;
      old.status = 'cancelled';
      if (LIVE) { const { error } = await sb.from('activities').update({ status: 'cancelled' }).eq('id', old.id); if (error) { old.status = 'scheduled'; e.target.disabled = false; return failed(error); } }
      if (deal) { note(deal, `Meeting cancelled: ${old.title}, ${fmtWhen(old.startsAt)}`); saveDeal(deal); }
      const r = await notify({ action: 'cancel', id: old.id });
      toast(`Meeting cancelled${r && r.sent ? ` · ${r.sent} email${r.sent === 1 ? '' : 's'} sent` : ''}`); render(); deal ? openDeal(deal.id) : closeDrawer();
    };
  }
  function toggleActDone(a, reopen) {
    a.done = !a.done;
    if (LIVE) sb.from('activities').update({ done: a.done }).eq('id', a.id).then(({ error }) => error && failed(error));
    const deal = deals.find(x => x.id === a.dealId);
    if (deal) { note(deal, `${a.done ? 'Task done' : 'Task reopened'}: ${a.title}`); saveDeal(deal); }
    toast(a.done ? 'Task done' : 'Task reopened'); render();
    if (deal && (reopen || !$('#drawer').hidden)) openDeal(deal.id);
  }

  // ---------- Calendar ----------
  let calStart = null; // Monday of the week shown
  function renderCalendar() {
    if (!calStart) { calStart = new Date(today); calStart.setDate(calStart.getDate() - ((calStart.getDay() + 6) % 7)); }
    const end = new Date(calStart); end.setDate(end.getDate() + 7);
    const items = acts.filter(a => a.status !== 'cancelled' && mineAct(a) && new Date(a.startsAt) >= calStart && new Date(a.startsAt) < end && (deals.find(x => x.id === a.dealId) || {}).archived !== true);
    const follow = deals.filter(x => OPEN.includes(x.stage) && matches(x) && x.followUp);
    const late = acts.filter(a => a.status !== 'cancelled' && mineAct(a) && actLate(a) && new Date(a.startsAt) < calStart);
    const days = [...Array(7)].map((_, i) => { const t = new Date(calStart); t.setDate(t.getDate() + i); return t; });
    const ymd = t => `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    const label = `${calStart.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })} – ${new Date(end - DAY).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    const fuRow = x => { const c = contactOf(x); return `<li class="row" data-deal="${x.id}"><span class="act-icon fu" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 7v5l3 2"/><circle cx="12" cy="12" r="8"/></svg></span><div class="row-main"><div class="row-title">${esc(x.nextAction || 'Follow up')}</div><div class="row-sub">Follow-up · ${esc(c.company || x.title)}${x.owner ? ' · ' + esc(x.owner) : ''}</div></div><div class="row-meta">${duePill(x)}</div></li>`; };
    const body = days.map(t => {
      const k = ymd(t);
      const list = items.filter(a => localDay(a.startsAt) === k).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
      const fus = follow.filter(x => x.followUp === k);
      const isToday = k === ymd(today);
      return `<div class="section-label${isToday ? ' cal-today' : ''}">${t.toLocaleDateString('en-CA', { weekday: 'long', month: 'short', day: 'numeric' })}${isToday ? ' · Today' : ''}</div>${list.map(a => actRow(a, true, true)).join('')}${fus.map(fuRow).join('')}${!list.length && !fus.length ? '<li class="empty cal-empty">Nothing planned.</li>' : ''}`;
    }).join('');
    $('#view').innerHTML = `<div class="cal-tools"><button class="secondary" id="calPrev" aria-label="Previous week">‹</button><button class="secondary" id="calNow">This week</button><button class="secondary" id="calNext" aria-label="Next week">›</button><b class="cal-label">${label}</b></div>
      ${late.length ? `<div class="panel cal-late"><div class="panel-head"><h2>Overdue tasks</h2><span class="count">${late.length}</span></div><ul class="list">${late.map(a => actRow(a, true)).join('')}</ul></div>` : ''}
      <div class="panel"><ul class="list">${body}</ul></div>
      <p class="import-note">Meetings, tasks and follow-up dates${who === 'all' ? ' for the whole team' : ` for ${esc(who)}`}. Add a task or meeting from a lead (open it in Pipeline).</p>`;
    $('#calPrev').onclick = () => { calStart.setDate(calStart.getDate() - 7); render(); };
    $('#calNext').onclick = () => { calStart.setDate(calStart.getDate() + 7); render(); };
    $('#calNow').onclick = () => { calStart = null; render(); };
  }

  // ---------- Drawer: contact ----------
  function openContact(id) {
    const isNew = id == null;
    const c = isNew ? { company: '', name: '', title: '', email: '', phone: '', address: '', notes: '', log: [] } : contacts.find(k => k.id === id);
    c.log = c.log || [];
    const related = isNew ? [] : deals.filter(x => x.contactId === c.id);
    openDrawer(isNew ? 'New contact' : c.company, `
      ${isNew ? '' : stampLine(c)}
      <form id="contactForm" class="fields">
        <div class="field full"><label for="c-company">Company</label><input id="c-company" name="company" required value="${esc(c.company)}"></div>
        <div class="field"><label for="c-name">Decision-maker</label><input id="c-name" name="name" value="${esc(c.name)}"></div>
        <div class="field"><label for="c-title">Title</label><input id="c-title" name="title" value="${esc(c.title)}"></div>
        <div class="field"><label for="c-email">Email</label><input id="c-email" name="email" type="email" value="${esc(c.email)}"></div>
        <div class="field"><label for="c-phone">Phone</label><input id="c-phone" name="phone" value="${esc(c.phone)}"></div>
        <div class="field full"><label for="c-address">Address</label><input id="c-address" name="address" value="${esc(c.address)}"></div>
        ${isNew ? '<div class="field full"><label for="c-first">First note (optional)</label><textarea id="c-first" name="first"></textarea></div>' : ''}
      </form>
      <div class="actions"><button class="primary" id="saveContact">${isNew ? 'Create contact' : 'Save changes'}</button></div>
      ${isNew ? '' : `${reachButtons(c) ? `<div class="actions reach">${reachButtons(c)}</div>${composeBox(c)}` : ''}<h3>Notes</h3>${noteList(c.log)}<div class="note-add"><input id="cNoteText" placeholder="Add a note" aria-label="Add a note"><button class="secondary" id="cAddNote">Add</button></div><h3>Deals</h3><ul class="list">${related.map(x => `<li class="row" data-deal="${x.id}"><div class="row-main"><div class="row-title">${esc(x.title)}</div><div class="row-sub num">${money(x.value)}</div></div><div class="row-meta">${x.archived ? '<span class="pill">Archived</span>' : stagePill(x.stage)}</div></li>`).join('') || '<li class="empty">No deals yet.</li>'}</ul>`}
    `, isNew ? {} : { contact: c.id });
    $('#saveContact').onclick = async e => {
      const f = new FormData($('#contactForm'));
      const v = Object.fromEntries(['company', 'name', 'title', 'email', 'phone', 'address'].map(k => [k, String(f.get(k)).trim()]));
      if (!v.company) { $('#c-company').focus(); toast('Add a company name'); return; }
      if (isNew) {
        const nc = { ...v, notes: '', log: [], createdAt: stamp() }; note(nc, 'Contact created', null, 'log');
        const first = String(f.get('first') || '').trim(); if (first) note(nc, first, null, 'log');
        if (LIVE) { e.target.disabled = true; try { [nc.id] = await insertRows('contacts', [contactToDb(nc)]); } catch (err) { e.target.disabled = false; return failed(err); } } else nc.id = ++uid;
        contacts.push(nc); toast('Contact created');
      } else { Object.assign(c, v); saveContact(c); toast('Saved'); }
      closeDrawer(); render();
    };
    if (!isNew) {
      const addC = () => { const t = $('#cNoteText').value.trim(); if (!t) return; note(c, t, null, 'log'); saveContact(c); openContact(c.id); };
      if (c.email) wireCompose(null, c, () => openContact(c.id));
      $('#cAddNote').onclick = addC;
      $('#cNoteText').onkeydown = e => { if (e.key === 'Enter') addC(); };
    }
  }

  // ---------- Invoices ----------
  // Built into the CRM, no paid service. Numbers (FV-0001, ...) come from the database so two people never get the same one.
  // Amounts only come from the deal value or what someone types. Nothing is deleted: an invoice is voided instead.
  let invFilter = 'all';
  const round2 = n => Math.round((+n || 0) * 100) / 100;
  const invFromDb = r => ({ id: r.id, dealId: r.deal_id, contactId: r.contact_id, number: r.number, issueDate: r.issue_date || '', dueDate: r.due_date || '', status: r.status, items: r.items || [], taxRate: r.tax_rate == null ? 13 : +r.tax_rate, notes: r.notes || '', sentAt: r.sent_at, paidAt: r.paid_at, createdAt: r.created_at, createdBy: r.created_by || '', updatedBy: r.updated_by || '', updatedAt: r.updated_at || '' });
  const invToDb = v => ({ deal_id: v.dealId || null, contact_id: v.contactId || null, number: v.number, issue_date: v.issueDate || d(0), due_date: v.dueDate || null, status: v.status, items: v.items, tax_rate: v.taxRate, notes: v.notes, sent_at: v.sentAt || null, paid_at: v.paidAt || null, ...(companyId ? { company_id: companyId } : {}) });
  const settingsFromDb = r => ({ businessName: r.business_name, address: r.address, phone: r.phone, hstNumber: r.hst_number || '', paymentInstructions: r.payment_instructions || '', daysToPay: r.days_to_pay ?? 30, nextNumber: r.next_number || 1 });
  const settingsToDb = s => ({ business_name: s.businessName, address: s.address, phone: s.phone, hst_number: s.hstNumber, payment_instructions: s.paymentInstructions, days_to_pay: s.daysToPay });
  function invCalc(v) {
    const lines = v.items.map(i => round2((+i.qty || 0) * (+i.price || 0)));
    const sub = round2(lines.reduce((a, b) => a + b, 0)), tax = round2(sub * (+v.taxRate || 0) / 100);
    return { lines, sub, tax, total: round2(sub + tax) };
  }
  const invOverdue = v => v.status === 'Sent' && v.dueDate && daysFrom(v.dueDate) < 0;
  const invPill = v => invOverdue(v) ? `<span class="pill red">Overdue ${-daysFrom(v.dueDate)}d</span>` : `<span class="pill ${{ Sent: 'blue', Paid: 'green' }[v.status] || ''}">${esc(v.status)}</span>`;
  const invDeal = v => deals.find(x => x.id === v.dealId);
  const invContact = v => contacts.find(k => k.id === v.contactId) || (invDeal(v) ? contactOf(invDeal(v)) : {});
  const longDate = iso => iso ? new Date(localDay(iso) + 'T00:00:00').toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const invRow = v => `<li class="row" data-inv="${v.id}"><div class="row-main"><div class="row-title">${esc(v.number)}</div><div class="row-sub">Issued ${fmtDate(v.issueDate)}${v.dueDate ? ` · due ${fmtDate(v.dueDate)}` : ''}</div></div><div class="row-meta"><b class="num">${money2(invCalc(v).total)}</b> ${invPill(v)}</div></li>`;
  function invoiceSection(x, won) {
    const list = invoices.filter(v => v.dealId === x.id).sort((a, b) => b.id - a.id);
    return `<h3>Invoices</h3>
      ${won && !list.length ? '<p class="draft-meta">This deal is won. Invoice the customer from here.</p>' : ''}
      <ul class="list act-list">${list.map(invRow).join('') || '<li class="empty">No invoices yet.</li>'}</ul>
      <div class="actions"><button class="${won ? 'primary' : 'secondary'}" id="addInvoice">+ Invoice</button></div>`;
  }
  const br = s => esc(s).replace(/\n/g, '<br>');
  // One layout for the printed invoice and the emailed one (inline styles so email apps keep them).
  function invoiceDoc(v) {
    const s = invSettings, c = invContact(v), x = invDeal(v), t = invCalc(v);
    const cell = 'padding:8px 10px;border-bottom:1px solid #e2e6ea;', head = 'font-size:12px;color:#5d6b78;font-weight:700;';
    return `<div class="inv-doc" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.45;color:#16202a;max-width:720px">
      <table role="presentation" style="width:100%;border-collapse:collapse"><tr>
        <td style="vertical-align:top;padding:0"><div style="font-size:20px;font-weight:700">${esc(s.businessName)}</div><div style="color:#5d6b78">${br(s.address)}${s.phone ? `<br>${esc(s.phone)}` : ''}${s.hstNumber ? `<br>HST # ${esc(s.hstNumber)}` : ''}</div></td>
        <td style="vertical-align:top;text-align:right;padding:0"><div style="font-size:22px;font-weight:700;letter-spacing:.04em">${v.status === 'Void' ? 'VOID INVOICE' : 'INVOICE'}</div><div><b>${esc(v.number)}</b></div><div style="color:#5d6b78">Date: <span style="white-space:nowrap">${esc(longDate(v.issueDate))}</span>${v.dueDate ? `<br>Due: <span style="white-space:nowrap">${esc(longDate(v.dueDate))}</span>` : ''}</div></td>
      </tr></table>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:22px"><tr>
        <td style="vertical-align:top;padding:0"><div style="font-size:12px;font-weight:700;color:#5d6b78;text-transform:uppercase;letter-spacing:.05em">Bill to</div><div>${[c.company && `<b>${esc(c.company)}</b>`, esc(c.name), br(c.address), esc(c.email)].filter(Boolean).join('<br>')}</div></td>
        ${x && x.site ? `<td style="vertical-align:top;padding:0;text-align:right"><div style="font-size:12px;font-weight:700;color:#5d6b78;text-transform:uppercase;letter-spacing:.05em">Job site</div><div>${br(x.site)}</div></td>` : ''}
      </tr></table>
      <table style="width:100%;border-collapse:collapse;margin-top:22px">
        <thead><tr style="background:#f3f5f7"><th style="${cell}${head}text-align:left">Description</th><th style="${cell}${head}text-align:right">Qty</th><th style="${cell}${head}text-align:right">Unit price</th><th style="${cell}${head}text-align:right">Amount</th></tr></thead>
        <tbody>${v.items.map((i, k) => `<tr><td style="${cell}">${br(i.desc)}</td><td style="${cell}text-align:right">${esc(+i.qty || 0)}</td><td style="${cell}text-align:right;white-space:nowrap">${money2(+i.price || 0)}</td><td style="${cell}text-align:right;white-space:nowrap">${money2(t.lines[k])}</td></tr>`).join('')}</tbody>
      </table>
      <table role="presentation" style="width:auto;margin:12px 0 0 auto;border-collapse:collapse;min-width:260px">
        <tr><td style="padding:4px 10px">Subtotal</td><td style="padding:4px 10px;text-align:right;white-space:nowrap">${money2(t.sub)}</td></tr>
        <tr><td style="padding:4px 10px">HST (${esc(+v.taxRate || 0)}%)</td><td style="padding:4px 10px;text-align:right;white-space:nowrap">${money2(t.tax)}</td></tr>
        <tr><td style="padding:8px 10px;font-weight:700;border-top:2px solid #16202a">Total (CAD)</td><td style="padding:8px 10px;text-align:right;font-weight:700;border-top:2px solid #16202a;white-space:nowrap">${money2(t.total)}</td></tr>
        ${v.status === 'Paid' ? `<tr><td colspan="2" style="padding:6px 10px;text-align:right;color:#1d7a46;font-weight:700">Paid${v.paidAt ? ` on ${esc(longDate(v.paidAt))}` : ''}</td></tr>` : ''}
      </table>
      ${s.paymentInstructions && v.status !== 'Paid' && v.status !== 'Void' ? `<div style="margin-top:22px"><div style="font-size:12px;font-weight:700;color:#5d6b78;text-transform:uppercase;letter-spacing:.05em">How to pay</div><div>${br(s.paymentInstructions)}</div></div>` : ''}
      ${v.notes ? `<div style="margin-top:16px"><div style="font-size:12px;font-weight:700;color:#5d6b78;text-transform:uppercase;letter-spacing:.05em">Notes</div><div>${br(v.notes)}</div></div>` : ''}
      <p style="margin-top:28px;color:#5d6b78;font-size:13px">Thank you for your business.</p>
    </div>`;
  }
  function invoiceText(v) {
    const s = invSettings, c = invContact(v), t = invCalc(v);
    return [`${s.businessName}`, s.address, s.phone, s.hstNumber ? `HST # ${s.hstNumber}` : '', '',
      `INVOICE ${v.number}`, `Date: ${longDate(v.issueDate)}`, v.dueDate ? `Due: ${longDate(v.dueDate)}` : '', '',
      'Bill to:', c.company, c.name, c.address, '',
      ...v.items.map((i, k) => `${i.desc}: ${+i.qty || 0} x ${money2(+i.price || 0)} = ${money2(t.lines[k])}`), '',
      `Subtotal: ${money2(t.sub)}`, `HST (${+v.taxRate || 0}%): ${money2(t.tax)}`, `Total (CAD): ${money2(t.total)}`,
      s.paymentInstructions ? `\nHow to pay:\n${s.paymentInstructions}` : '', v.notes ? `\nNotes:\n${v.notes}` : ''].filter(l => l !== undefined && l !== null).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }
  // Printable view: a full-page invoice on screen with Print / Save as PDF; only the invoice prints (no popup window needed).
  function openPrint(v) {
    const el = $('#printArea');
    el.innerHTML = `<div class="print-tools"><button class="primary" id="printNow">Print / Save as PDF</button><button class="secondary" id="printClose">Close</button><span class="print-hint">In the print box, choose "Save as PDF" to keep a copy.</span></div><div class="print-page">${invoiceDoc(v)}</div>`;
    el.hidden = false; document.body.classList.add('printing');
    $('#printClose').onclick = closePrint;
    $('#printNow').onclick = () => { try { window.print(); } catch { toast('Use your browser menu to print'); } };
    setTimeout(() => { try { window.print(); } catch { /* the page stays open to print from the menu */ } }, 60);
  }
  function closePrint() { $('#printArea').hidden = true; $('#printArea').innerHTML = ''; document.body.classList.remove('printing'); }

  function openInvoice(id, dealId) {
    const rec = id ? invoices.find(v => v.id === id) : null;
    const deal = deals.find(x => x.id === (rec ? rec.dealId : dealId));
    if (!rec && !deal) return;
    const v = rec ? { ...rec, items: rec.items.map(i => ({ ...i })) } : { id: null, dealId: deal.id, contactId: deal.contactId, number: '', issueDate: d(0), dueDate: d(+invSettings.daysToPay || 0), status: 'Draft', items: [{ desc: deal.title, qty: 1, price: +deal.value || 0 }], taxRate: 13, notes: '', sentAt: null, paidAt: null };
    const c = invContact(v);
    const locked = v.status === 'Paid' || v.status === 'Void', dis = locked ? 'disabled' : '';
    const itemRow = i => `<div class="inv-item"><input class="it-desc" aria-label="Description" placeholder="Description" value="${esc(i.desc)}" ${dis}><input class="it-qty" aria-label="Quantity" placeholder="Qty" type="number" min="0" step="any" value="${esc(i.qty)}" ${dis}><input class="it-price" aria-label="Unit price" placeholder="Unit price" type="number" min="0" step="0.01" value="${esc(i.price)}" ${dis}><span class="it-total num"></span>${locked ? '<span></span>' : '<button type="button" class="icon it-del" aria-label="Remove line" title="Remove line">✕</button>'}</div>`;
    openDrawer(rec ? `Invoice ${rec.number}` : 'New invoice', `
      <p class="draft-meta">${deal ? esc(deal.title) + ' · ' : ''}${rec ? `${invPill(rec)}${rec.createdAt ? ` · created ${fmtWhen(rec.createdAt)}${rec.createdBy ? ` by ${esc(nameOf(rec.createdBy))}` : ''}` : ''}${rec.sentAt ? ` · sent ${fmtWhen(rec.sentAt)}` : ''}${rec.paidAt ? ` · paid ${fmtWhen(rec.paidAt)}` : ''}` : 'The invoice number is given when you save.'}</p>
      ${invSettings.hstNumber ? '' : '<p class="arch-note">No HST registration number in Invoice settings, so it is left off the invoice.</p>'}
      ${v.status === 'Void' ? '<p class="arch-note">This invoice is void. It is kept for the record.</p>' : ''}
      ${connectBox()}
      <h3>Bill to</h3>
      <div class="static">${[c.company && `<b>${esc(c.company)}</b>`, esc(c.name), br(c.address), esc(c.email)].filter(Boolean).join('<br>') || 'No customer on this deal.'}</div>
      ${c.email ? '' : '<p class="import-note">Add an email to this contact to email the invoice.</p>'}
      <form id="invForm" class="fields" style="margin-top:14px">
        <div class="field"><label for="i-issue">Invoice date</label><input id="i-issue" type="date" value="${esc(v.issueDate)}" ${dis}></div>
        <div class="field"><label for="i-due">Due date</label><input id="i-due" type="date" value="${esc(v.dueDate)}" ${dis}></div>
        <div class="field full"><label>Line items</label>
          <div class="inv-item inv-head" aria-hidden="true"><span>Description</span><span>Qty</span><span>Unit price</span><span>Amount</span><span></span></div>
          <div id="invItems">${v.items.map(itemRow).join('')}</div>
          ${locked ? '' : '<div><button type="button" class="secondary" id="addItem">+ Line</button></div>'}</div>
        <div class="field"><label for="i-tax">HST %</label><input id="i-tax" type="number" min="0" max="100" step="0.01" value="${esc(v.taxRate)}" ${dis}></div>
        <div class="field full"><div class="inv-totals num" id="invTotals"></div></div>
        <div class="field full"><label for="i-notes">Notes on the invoice (optional)</label><textarea id="i-notes" ${dis}>${esc(v.notes)}</textarea></div>
      </form>
      <div class="actions">
        ${locked ? '' : `<button class="primary" id="invSave">${v.status === 'Draft' ? 'Save draft' : 'Save changes'}</button>`}
        <button class="secondary" id="invPrint">Print / Save as PDF</button>
        ${v.status === 'Void' || !c.email ? '' : `<button class="secondary" id="invEmail">${v.status === 'Draft' ? 'Email invoice' : 'Email again'}</button>`}
        ${rec && (v.status === 'Draft' || v.status === 'Sent') ? '<button class="secondary" id="invPaid">Mark paid</button>' : ''}
        ${rec && v.status === 'Paid' ? '<button class="secondary" id="invUnpaid">Mark unpaid</button>' : ''}
        ${rec && v.status !== 'Void' && v.status !== 'Paid' ? '<button class="secondary danger" id="invVoid">Void</button>' : ''}
        ${deal ? '<button class="secondary" id="invDeal">Open deal</button>' : ''}
      </div>`);
    const readItems = () => [...document.querySelectorAll('#invItems .inv-item')].map(r => ({ desc: r.querySelector('.it-desc').value.trim(), qty: r.querySelector('.it-qty').value === '' ? 0 : +r.querySelector('.it-qty').value, price: r.querySelector('.it-price').value === '' ? 0 : round2(r.querySelector('.it-price').value) }));
    const read = () => { if (locked) return; v.items = readItems(); v.issueDate = $('#i-issue').value || d(0); v.dueDate = $('#i-due').value; v.taxRate = $('#i-tax').value === '' ? 0 : +$('#i-tax').value; v.notes = $('#i-notes').value.trim(); };
    const recalc = () => {
      const items = locked ? v.items : readItems(), t = invCalc({ items, taxRate: locked ? v.taxRate : +$('#i-tax').value || 0 });
      document.querySelectorAll('#invItems .it-total').forEach((el, k) => { el.textContent = money2(t.lines[k] || 0); });
      $('#invTotals').innerHTML = `<div><span>Subtotal</span><span>${money2(t.sub)}</span></div><div><span>HST (${esc(locked ? v.taxRate : +$('#i-tax').value || 0)}%)</span><span>${money2(t.tax)}</span></div><div class="inv-grand"><span>Total (CAD)</span><span>${money2(t.total)}</span></div>`;
    };
    recalc();
    const wireItems = () => document.querySelectorAll('#invItems .it-del').forEach(b => b.onclick = () => { if (document.querySelectorAll('#invItems .inv-item').length < 2) { toast('An invoice needs at least one line'); return; } b.closest('.inv-item').remove(); recalc(); });
    wireItems();
    if (!locked) {
      $('#invForm').oninput = recalc;
      $('#addItem').onclick = () => { $('#invItems').insertAdjacentHTML('beforeend', itemRow({ desc: '', qty: 1, price: '' })); wireItems(); recalc(); $('#invItems .inv-item:last-child .it-desc').focus(); };
    }
    const logDeal = text => { if (!deal) return; note(deal, text); saveDeal(deal); };
    const saveRec = async r => { if (!LIVE) return true; const { error } = await sb.from('invoices').update(invToDb(r)).eq('id', r.id); if (error) { failed(error); return false; } r.updatedBy = myEmail; r.updatedAt = stamp(); return true; };
    // Saves the form. A new invoice gets its number here. Returns the saved invoice, or null.
    let cur = rec;
    async function persist(btn) {
      if (locked) return cur;
      read();
      if (!v.items.length || v.items.some(i => !i.desc)) { toast('Each line needs a description'); return null; }
      if (v.items.some(i => i.qty < 0 || i.price < 0) || v.taxRate < 0) { toast('Amounts cannot be negative'); return null; }
      if (v.dueDate && v.dueDate < v.issueDate) { toast('The due date is before the invoice date'); return null; }
      if (!cur) {
        if (btn) btn.disabled = true;
        try {
          if (LIVE) {
            const { data, error } = await sb.rpc('crm_next_invoice_number', { company: companyId }); if (error) throw error;
            v.number = data; v.createdBy = myEmail;
            [v.id] = await insertRows('invoices', [invToDb(v)]);
          } else { v.number = `FV-${String(invSettings.nextNumber++).padStart(4, '0')}`; v.id = ++uid; v.createdBy = me || ''; }
        } catch (err) { if (btn) btn.disabled = false; failed(err); return null; }
        if (btn) btn.disabled = false;
        v.createdAt = stamp(); invoices.push(v); cur = v;
        logDeal(`Invoice ${v.number} created, ${money2(invCalc(v).total)}`);
        return cur;
      }
      Object.assign(cur, v, { id: cur.id, number: cur.number });
      return (await saveRec(cur)) ? cur : null;
    }
    const reopen = r => { render(); openInvoice(r.id); };
    if (!locked) $('#invSave').onclick = async e => { const r = await persist(e.target); if (r) { toast(`Invoice ${r.number} saved`); reopen(r); } };
    $('#invPrint').onclick = async e => { const r = await persist(e.target); if (!r) return; if (!rec) reopen(r); openPrint(r); };
    if ($('#invEmail')) {
      wireConnect(() => $('#invEmail').click());
      $('#invEmail').onclick = async e => {
        const r = await persist(e.target); if (!r) return;
        if (!rec) reopen(r); // keeps the number on screen if sending stops (for example to connect the mailbox)
        const t = invCalc(r), first = firstName(c);
        const intro = `${first ? `Hi ${first},` : 'Hello,'}\n\nPlease find invoice ${r.number} for ${money2(t.total)} below${r.dueDate && r.status !== 'Paid' ? `, due ${longDate(r.dueDate)}` : ''}.${r.status === 'Paid' ? ' It is paid in full. Thank you.' : ''}\n\nThank you for choosing ${invSettings.businessName}.`;
        const btn = $('#invEmail');
        const n = await sendEmail(btn, deal, c, { to: c.email, cc: '', subject: `Invoice ${r.number} from ${CO}`, text: `${intro}\n\n${invoiceText(r)}\n\n${sigText()}`, html: `${bodyHtml(intro)}<br>${invoiceDoc(r)}<br>${sigHtml()}` });
        if (!n) return;
        if (r.status === 'Draft') r.status = 'Sent';
        r.sentAt = stamp(); await saveRec(r);
        logDeal(`Invoice ${r.number} emailed to ${c.email}`);
        reopen(r);
      };
    }
    if ($('#invPaid')) $('#invPaid').onclick = async e => { const r = await persist(e.target); if (!r) return; r.status = 'Paid'; r.paidAt = stamp(); if (!(await saveRec(r))) return; logDeal(`Invoice ${r.number} marked paid, ${money2(invCalc(r).total)}`); toast(`Invoice ${r.number} marked paid`); reopen(r); };
    if ($('#invUnpaid')) $('#invUnpaid').onclick = async () => { const r = cur; r.status = r.sentAt ? 'Sent' : 'Draft'; r.paidAt = null; if (!(await saveRec(r))) return; logDeal(`Invoice ${r.number} marked unpaid`); toast('Marked unpaid'); reopen(r); };
    if ($('#invVoid')) $('#invVoid').onclick = async e => {
      if (!e.target.dataset.sure) { e.target.dataset.sure = '1'; e.target.textContent = 'Click again to void'; return; }
      const r = cur; r.status = 'Void'; if (!(await saveRec(r))) return; logDeal(`Invoice ${r.number} voided`); toast(`Invoice ${r.number} voided`); reopen(r);
    };
    if ($('#invDeal')) $('#invDeal').onclick = () => openDeal(deal.id);
  }

  function renderInvoices() {
    const mine = invoices.filter(v => { const x = invDeal(v); if (who !== 'all' && x && x.owner !== who) return false; if (!query) return true; const c = invContact(v); return [v.number, c.company, c.name, x && x.title].join(' ').toLowerCase().includes(query); });
    const sum = a => a.reduce((t, v) => t + invCalc(v).total, 0);
    const sent = mine.filter(v => v.status === 'Sent'), late = sent.filter(invOverdue), ym = d(0).slice(0, 7);
    const paidMonth = mine.filter(v => v.status === 'Paid' && v.paidAt && localDay(v.paidAt).slice(0, 7) === ym), drafts = mine.filter(v => v.status === 'Draft');
    const list = mine.filter(v => invFilter === 'all' || (invFilter === 'Overdue' ? invOverdue(v) : v.status === invFilter)).sort((a, b) => b.id - a.id);
    const month = new Date(today).toLocaleString('en-CA', { month: 'long' });
    const s = invSettings, n = k => `${k} invoice${k === 1 ? '' : 's'}`;
    $('#view').innerHTML = `
      <div class="kpis">
        <div class="kpi"><div class="label">Outstanding (CAD)</div><div class="value num">${money2(sum(sent))}</div><div class="kpi-sub">${n(sent.length)} sent, not paid</div></div>
        <div class="kpi ${late.length ? 'alert' : ''}"><div class="label">Overdue (CAD)</div><div class="value num">${money2(sum(late))}</div><div class="kpi-sub">${n(late.length)} past the due date</div></div>
        <div class="kpi"><div class="label">Paid in ${month} (CAD)</div><div class="value num">${money2(sum(paidMonth))}</div><div class="kpi-sub">${n(paidMonth.length)}</div></div>
        <div class="kpi"><div class="label">Drafts</div><div class="value num">${drafts.length}</div><div class="kpi-sub">not sent yet</div></div>
      </div>
      <div class="toolbar"><p>${n(list.length)} · open a deal and press + Invoice to add one</p><div class="toolbar-actions"><label class="who"><span>Show</span><select id="invFilter" aria-label="Show invoices">${['all', 'Draft', 'Sent', 'Overdue', 'Paid', 'Void'].map(f => `<option value="${f}" ${f === invFilter ? 'selected' : ''}>${f === 'all' ? 'All' : f}</option>`).join('')}</select></label></div></div>
      <div class="table-wrap"><table class="inv-table"><thead><tr><th>Invoice</th><th>Customer</th><th class="hide-sm">Deal</th><th class="hide-sm">Due</th><th>Total</th><th>Status</th></tr></thead>
      <tbody>${list.map(v => { const c = invContact(v), x = invDeal(v); return `<tr data-inv="${v.id}"><td><b>${esc(v.number)}</b></td><td class="inv-cust">${esc(c.company || '—')}</td><td class="hide-sm">${esc(x ? x.title : '—')}</td><td class="hide-sm num">${fmtDate(v.dueDate)}</td><td class="num">${money2(invCalc(v).total)}</td><td>${invPill(v)}</td></tr>`; }).join('') || `<tr><td colspan="6" class="empty">${invoices.length ? 'No invoices match.' : 'No invoices yet. Open a deal and press + Invoice.'}</td></tr>`}</tbody></table></div>
      <div class="panel" style="margin-top:16px"><div class="panel-head"><h2>Invoice settings</h2><span class="count">next number FV-${String(s.nextNumber).padStart(4, '0')}</span></div>
        <form id="invSettings" class="fields inv-settings">
          <div class="field"><label for="s-name">Business name</label><input id="s-name" value="${esc(s.businessName)}"></div>
          <div class="field"><label for="s-phone">Phone</label><input id="s-phone" value="${esc(s.phone)}"></div>
          <div class="field full"><label for="s-addr">Address</label><textarea id="s-addr">${esc(s.address)}</textarea></div>
          <div class="field"><label for="s-hst">HST registration number</label><input id="s-hst" value="${esc(s.hstNumber)}" placeholder="e.g. 123456789 RT0001"></div>
          <div class="field"><label for="s-days">Days to pay (due date)</label><input id="s-days" type="number" min="0" max="365" value="${esc(s.daysToPay)}"></div>
          <div class="field full"><label for="s-pay">Payment instructions (shown on the invoice)</label><textarea id="s-pay" placeholder="e.g. e-Transfer to … or cheque payable to …">${esc(s.paymentInstructions)}</textarea></div>
          <div class="field full"><div class="actions" style="margin-top:0"><button type="button" class="primary" id="saveInvSettings">Save settings</button></div></div>
        </form></div>`;
    $('#invFilter').onchange = e => { invFilter = e.target.value; render(); };
    $('#saveInvSettings').onclick = async e => {
      const days = Math.round(+$('#s-days').value);
      const v = { businessName: $('#s-name').value.trim(), phone: $('#s-phone').value.trim(), address: $('#s-addr').value.trim(), hstNumber: $('#s-hst').value.trim(), paymentInstructions: $('#s-pay').value.trim(), daysToPay: days };
      if (!v.businessName) { $('#s-name').focus(); toast('Add the business name'); return; }
      if (!(days >= 0 && days <= 365)) { $('#s-days').focus(); toast('Days to pay is 0 to 365'); return; }
      if (LIVE) {
        e.target.disabled = true;
        let { data, error } = await sb.from('invoice_settings').update(settingsToDb(v)).eq('company_id', companyId).select('company_id');
        if (!error && !data.length) ({ error } = await sb.from('invoice_settings').insert({ company_id: companyId, ...settingsToDb(v) }));
        e.target.disabled = false;
        if (error) return failed(error);
      }
      Object.assign(invSettings, v); toast('Invoice settings saved'); render();
    };
  }

  // ---------- CSV export ----------
  function csv(rows) { return rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n'); }
  function download(name, text) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    toast(`Exported ${name}`);
  }
  $('#exportOpps').onclick = () => download(`forcevision-deals${LIVE ? '' : '-sample'}.csv`, csv([['Deal', 'Assigned to', 'Company', 'Contact', 'Stage', 'Value CAD', 'Next action', 'Follow-up', 'Site', 'Requirements', 'Proposal'], ...deals.map(x => { const c = contactOf(x); return [x.title, x.owner, c.company, c.name, x.stage, x.value, x.nextAction, x.followUp, x.site, x.needs, x.proposal]; })]));
  $('#exportContacts').onclick = () => download(`forcevision-contacts${LIVE ? '' : '-sample'}.csv`, csv([['Company', 'Name', 'Title', 'Email', 'Phone', 'Address', 'Notes'], ...contacts.map(c => [c.company, c.name, c.title, c.email, c.phone, c.address, (c.log && c.log.length ? c.log.map(n => `${fmtWhen(n.at)}${n.by ? ` ${n.by}` : ''}: ${n.text}`).join(' | ') : c.notes)])]));

  // ---------- Trello import (prototype: board JSON export, in memory, preview before saving) ----------
  const guessStage = name => {
    const n = name.toLowerCase();
    if (/lost|dead|declin|no go|cancel/.test(n)) return 'Lost';
    if (/won|closed|sign|complete|done|install/.test(n)) return 'Won';
    if (/negot/.test(n)) return 'Negotiation';
    if (/propos|quote|estimate/.test(n)) return 'Proposal sent';
    if (/site|visit|meeting|survey|walk/.test(n)) return 'Site visit';
    if (/contact|follow|call|reach/.test(n)) return 'Contacted';
    return 'New lead';
  };
  function openImport() {
    openDrawer('Import from Trello', `
      <ol class="import-steps"><li>In Trello, open the board menu (…) → Print, export, and share → Export as JSON.</li><li>Save the page as a .json file, then choose it below.</li><li>Check the stage for each Trello list, then import. Nothing is added until you click Import.</li></ol>
      <div class="field full"><label for="trelloFile">Trello board file (.json)</label><input id="trelloFile" type="file" accept=".json,application/json"></div>
      <div id="importArea"></div>`);
    $('#trelloFile').onchange = e => {
      const file = e.target.files[0]; if (!file) return;
      const r = new FileReader();
      r.onload = () => { try { previewImport(JSON.parse(r.result)); } catch { $('#importArea').innerHTML = '<p class="import-error">That file is not a Trello JSON export. Export the board as JSON and try again.</p>'; } };
      r.readAsText(file);
    };
  }
  function previewImport(board) {
    if (!board || !Array.isArray(board.cards) || !Array.isArray(board.lists)) { $('#importArea').innerHTML = '<p class="import-error">That file is not a Trello JSON export. Export the board as JSON and try again.</p>'; return; }
    const lists = board.lists.filter(l => !l.closed);
    const cards = board.cards.filter(c => !c.closed && lists.some(l => l.id === c.idList));
    const comments = (board.actions || []).filter(a => a.type === 'commentCard' && a.data && a.data.card);
    const known = new Set(deals.map(x => x.trelloId).filter(Boolean));
    const members = (board.members || []).filter(m => (cards.some(c => (c.idMembers || []).includes(m.id))));
    const guessOwner = m => { const n = `${m.fullName || ''} ${m.username || ''}`.toLowerCase(); return n.includes('zol') ? 'Zoltan' : /mo?u?t+a?s+i?m|motas|mutas/.test(n) ? 'Motasim' : /maham|mahum/.test(n) ? 'Maham' : ''; };
    const fresh = cards.filter(c => !known.has(c.id));
    $('#importArea').innerHTML = `
      <h3>${esc(board.name || 'Trello board')}</h3>
      <p class="import-note">${fresh.length} card${fresh.length === 1 ? '' : 's'} to import${cards.length - fresh.length ? ` · ${cards.length - fresh.length} already imported, skipped` : ''}. Archived cards are skipped.</p>
      ${lists.map(l => { const n = fresh.filter(c => c.idList === l.id).length; return `<div class="map-row"><span><b>${esc(l.name)}</b> · ${n} card${n === 1 ? '' : 's'}</span><select data-list="${l.id}" aria-label="Stage for ${esc(l.name)}">${STAGES.map(s => `<option ${s === guessStage(l.name) ? 'selected' : ''}>${s}</option>`).join('')}</select></div>`; }).join('')}
      ${members.length ? `<h3>Trello members</h3><p class="import-note">Cards assigned to a member go to the matching owner.</p>${members.map(m => `<div class="map-row"><span><b>${esc(m.fullName || m.username)}</b></span><select data-member="${m.id}" aria-label="Owner for ${esc(m.fullName || m.username)}"><option value="">Use default owner</option>${TEAM.map(t => `<option ${t === guessOwner(m) ? 'selected' : ''}>${t}</option>`).join('')}</select></div>`).join('')}` : ''}
      <div class="fields" style="margin-top:12px">
        <div class="field"><label for="imp-owner">${members.length ? 'Default owner (cards with no matched member)' : 'Owner for imported deals'}</label><select id="imp-owner">${TEAM.map(t => `<option ${t === (who !== 'all' ? who : TEAM[0]) ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      </div>
      <p class="import-note">Each card becomes a deal and a contact (company = card name). Description, labels, checklists, attachment links and comments go into the deal notes. Values start at $0, so add them yourself. Cards with no due date get a follow-up for today so you can review them.</p>
      <div class="actions"><button class="primary" id="doImport" ${fresh.length ? '' : 'disabled'}>Import ${fresh.length} deal${fresh.length === 1 ? '' : 's'}</button></div>`;
    $('#doImport').onclick = async e => {
      const stageOf = {}; document.querySelectorAll('[data-list]').forEach(s => stageOf[s.dataset.list] = s.value);
      const owner = $('#imp-owner').value;
      const ownerOf = {}; document.querySelectorAll('[data-member]').forEach(s => { if (s.value) ownerOf[s.dataset.member] = s.value; });
      const checklists = board.checklists || [];
      const newContacts = [], newDeals = [];
      fresh.forEach(card => {
        const contact = { id: ++uid, trelloId: card.id, company: card.name, name: '', title: '', email: '', phone: '', notes: '', log: [{ at: stamp(), text: 'Imported from Trello' }] };
        newContacts.push(contact);
        const notes = [];
        const at = card.dateLastActivity || stamp();
        if (card.desc) notes.push({ at, text: `From Trello: ${card.desc}` });
        if (card.labels && card.labels.length) notes.push({ at, text: `Trello labels: ${card.labels.map(l => l.name || l.color).join(', ')}` });
        comments.filter(a => a.data.card.id === card.id).reverse().forEach(a => notes.push({ at: a.date || at, text: `Trello comment${a.memberCreator ? ` (${a.memberCreator.fullName})` : ''}: ${a.data.text}` }));
        checklists.filter(k => k.idCard === card.id).forEach(k => notes.push({ at, text: `Trello checklist "${k.name}": ${(k.checkItems || []).map(i => `${i.state === 'complete' ? '[done]' : '[ ]'} ${i.name}`).join('; ')}` }));
        const files = (card.attachments || []).filter(a => a.url);
        if (files.length) notes.push({ at, text: `Trello attachments: ${files.map(a => `${a.name || 'file'} (${a.url})`).join(', ')}` });
        notes.push({ at: stamp(), text: `Imported from Trello list "${(lists.find(l => l.id === card.idList) || {}).name}"` });
        const cardOwner = (card.idMembers || []).map(id => ownerOf[id]).find(Boolean) || owner;
        newDeals.push({ id: ++uid, trelloId: card.id, owner: cardOwner, contactId: contact.id, title: card.name, site: '', needs: '', value: 0, stage: stageOf[card.idList] || 'New lead', nextAction: card.due ? 'Follow up (Trello due date)' : 'Review imported lead and set next step', followUp: card.due ? card.due.slice(0, 10) : d(0), proposal: '', notes });
      });
      if (LIVE) {
        e.target.disabled = true; e.target.textContent = 'Importing…';
        try {
          const cids = await insertRows('contacts', newContacts.map(contactToDb));
          newContacts.forEach((c, i) => { newDeals[i].contactId = cids[i]; c.id = cids[i]; });
          const dids = await insertRows('deals', newDeals.map(dealToDb));
          newDeals.forEach((x, i) => x.id = dids[i]);
        } catch (err) { e.target.disabled = false; e.target.textContent = 'Import'; return failed(err); }
      }
      contacts.push(...newContacts); deals.push(...newDeals);
      toast(`Imported ${fresh.length} deal${fresh.length === 1 ? '' : 's'} from Trello`);
      closeDrawer(); view = 'pipeline'; render();
    };
  }

  // ---------- Events ----------
  document.querySelectorAll('.nav button').forEach(b => b.onclick = () => { view = b.dataset.view; render(); });
  $('#search').addEventListener('input', e => { query = e.target.value.trim().toLowerCase(); render(); });
  $('#newDeal').onclick = () => openDeal(null);
  $('#importTrello').onclick = openImport;
  const fillWho = () => { $('#who').innerHTML = `<option value="all">Everyone</option>${me && TEAM.includes(me) ? `<option value="${esc(me)}">My leads (${esc(me)})</option>` : ''}${TEAM.filter(t => t !== me).map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join('')}`; $('#who').value = who; };
  fillWho();
  $('#who').onchange = e => { who = e.target.value; render(); };
  document.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) return closeDrawer();
    const dr = e.target.closest('[data-draft]');
    if (dr) { e.stopPropagation(); return openDraft(+dr.dataset.draft); }
    const ad = e.target.closest('[data-actdone]');
    if (ad) { e.stopPropagation(); const a = acts.find(z => z.id === +ad.dataset.actdone); return a && toggleActDone(a); }
    const ar = e.target.closest('[data-act]');
    if (ar) { const a = acts.find(z => z.id === +ar.dataset.act); return a && openActivity(a.dealId, a.kind, a.id); }
    const iv = e.target.closest('[data-inv]');
    if (iv) return openInvoice(+iv.dataset.inv);
    const done = e.target.closest('[data-done]');
    if (done) { e.stopPropagation(); return completeFollowUp(deals.find(x => x.id === +done.dataset.done)); }
    const deal = e.target.closest('[data-deal]');
    if (deal && !e.target.closest('.drawer-panel') || deal && e.target.closest('.list')) return openDeal(+deal.dataset.deal);
    const contact = e.target.closest('[data-contact]');
    if (contact) return openContact(+contact.dataset.contact);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#printArea').hidden) return closePrint(); if (e.key === 'Escape' && !$('#drawer').hidden) closeDrawer(); });

  // ---------- Sign-in screen, account links, refresh ----------
  const gateMsg = (m, ok) => { const el = $('#gateMsg'); el.textContent = m; el.hidden = !m; el.className = ok ? 'gate-ok' : 'import-error'; };
  async function startLive(session) {
    const email = (session.user.email || '').toLowerCase();
    const [m, co] = await Promise.all([sb.from('members').select('company_id,email,name,is_owner,signature,signature_html'), sb.from('companies').select('id,name').order('id')]);
    const mine = !m.error && !co.error ? m.data.filter(r => r.email.toLowerCase() === email) : [];
    if (!mine.length) { await sb.auth.signOut(); $('#gate').hidden = false; gateMsg('This email is not on any company team list. Ask Zoltan to add you.'); return; }
    members = m.data; myEmail = email; mySig = mine[0].signature || ''; mySigHtml = mine[0].signature_html ? cleanHtml(mine[0].signature_html) : '';
    myCompanies = co.data.filter(c => mine.some(r => r.company_id === c.id));
    members.forEach(t => { teamNames[t.email.toLowerCase()] = t.name; });
    await setCompany(myCompanies[0].id);
    LIVE = true;
    $('.banner').classList.add('live');
    $('#bannerLinks').innerHTML = '<button class="banner-link" id="changePw">Change password</button><button class="banner-link" id="signOut">Sign out</button>';
    $('#changePw').onclick = openPassword;
    $('#signOut').onclick = async () => { await sb.auth.signOut(); location.reload(); };
    $('#co').innerHTML = myCompanies.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
    $('#coWrap').hidden = myCompanies.length < 2;
    $('#co').onchange = async e => { try { await setCompany(+e.target.value); } catch (err) { failed(err); } };
    $('#gate').hidden = true;
    render();
    startPhone();
  }
  async function setCompany(id) {
    const prev = companyId; companyId = id;
    try { await loadAll(); } catch (err) { companyId = prev; if (prev) $('#co').value = prev; throw err; }
    const team = members.filter(r => r.company_id === id);
    CO = myCompanies.find(c => c.id === id).name;
    me = team.find(r => r.email.toLowerCase() === myEmail).name;
    TEAM = team.filter(r => r.is_owner).map(r => r.name);
    who = 'all'; fillWho(); closeDrawer();
    $('#bannerText').textContent = `Team pilot · signed in as ${me}${myCompanies.length > 1 ? ` · ${CO}` : ''} · changes are saved for the team`;
    render();
  }
  function openPassword(title) {
    openDrawer(typeof title === 'string' ? title : 'Change password', `<form id="pwForm" class="fields">
      <div class="field full"><label for="pw1">New password (at least 8 characters)</label><input id="pw1" type="password" autocomplete="new-password" minlength="8"></div>
      <div class="field full"><label for="pw2">Type it again</label><input id="pw2" type="password" autocomplete="new-password"></div></form>
      <p id="pwMsg" class="import-error" hidden></p>
      <div class="actions"><button class="primary" id="savePw">Save new password</button></div>`);
    $('#savePw').onclick = async e => {
      const a = $('#pw1').value, b = $('#pw2').value, msg = $('#pwMsg');
      const show = m => { msg.textContent = m; msg.hidden = false; };
      if (a.length < 8) return show('Use at least 8 characters.');
      if (a !== b) return show('The two passwords do not match.');
      e.target.disabled = true;
      const { error } = await sb.auth.updateUser({ password: a });
      if (error) { e.target.disabled = false; return show(error.message); }
      closeDrawer(); toast('Password changed');
    };
  }
  $('#gateForm').onsubmit = async e => {
    e.preventDefault(); gateMsg('');
    if (!sb) return gateMsg('Sign-in is not available right now. Check your internet connection and reload.');
    const btn = $('#gateSignIn'); btn.disabled = true; btn.textContent = 'Signing in…';
    const { data, error } = await sb.auth.signInWithPassword({ email: $('#g-email').value.trim(), password: $('#g-pass').value.trim() });
    btn.disabled = false; btn.textContent = 'Sign in';
    if (error) return gateMsg(/invalid/i.test(error.message) ? 'Wrong email or password.' : error.message);
    try { await startLive(data.session); } catch (err) { console.error(err); gateMsg('Signed in, but the data did not load. Reload and try again.'); }
  };
  // Forgot password: Supabase emails a reset link that opens the team link, which then asks for a new password.
  $('#gateForgot').onclick = async () => {
    const email = $('#g-email').value.trim();
    if (!email) { gateMsg('Type your email above, then click Forgot password again.'); return $('#g-email').focus(); }
    if (!sb) return gateMsg('Sign-in is not available right now. Check your internet connection and reload.');
    const btn = $('#gateForgot'); btn.disabled = true;
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: RESET_URL });
    btn.disabled = false;
    if (error) return gateMsg(/rate|seconds/i.test(error.message) ? 'A reset email was just sent. Wait a minute and try again.' : error.message);
    gateMsg(`If ${email} is on the team, a reset link is on its way. Check your inbox and junk folder, open the link, then choose a new password. Nothing after 5 minutes? Ask Zoltan for a new one.`, true);
  };
  $('#gateDemo').onclick = () => { $('#gate').hidden = true; render(); };
  const refresh = () => { if (LIVE && $('#drawer').hidden && document.visibilityState === 'visible') loadAll().then(render).catch(() => {}); };
  document.addEventListener('visibilitychange', refresh);
  setInterval(refresh, 60000);

  (async () => {
    try {
      if (window.supabase) {
        // On the team link (GitHub Pages) the browser keeps the sign-in until Sign out; in the preview it lives in memory only.
        const keep = /\.github\.io$/.test(location.hostname);
        const recovery = /type=recovery/.test(location.hash);
        sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { ...(keep ? {} : { storage: store }), persistSession: true, autoRefreshToken: true, detectSessionInUrl: recovery } });
        const { data } = await sb.auth.getSession();
        if (recovery) history.replaceState(null, '', location.pathname + location.search);
        if (data.session) { await startLive(data.session); if (recovery) openPassword('Choose a new password'); return; }
        if (recovery) gateMsg('That reset link has expired or was already used. Click Forgot password to get a new one.');
      }
    } catch (err) { console.error(err); }
    $('#gate').hidden = false;
  })();
})();
