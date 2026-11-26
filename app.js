// ForceVision CRM: demo mode (fictional sample data, in memory) or team pilot mode (signed in, saved to Supabase).
(() => {
  const STAGES = ['New lead', 'Contacted', 'Site visit', 'Proposal sent', 'Negotiation', 'Won', 'Lost'];
  const OPEN = STAGES.slice(0, 5);
  const DAY = 86400000;
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
  const at = (n, h, m = 0) => { const t = new Date(today); t.setDate(t.getDate() + n); t.setHours(h, m, 0, 0); return t.toISOString(); };
  let acts = [
    { id: 1, dealId: 12, kind: 'meeting', title: 'Site visit: Lakeview Steel', startsAt: at(1, 10), endsAt: at(1, 11, 30), location: '', details: 'Walk the yard and loading docks with the plant manager.', assignees: ['Zoltan', 'Motasim'], inviteCustomer: true, customerEmail: '', remind: 60, logged: false, done: false, status: 'scheduled', createdBy: 'Zoltan', createdAt: at(-1, 9) },
    { id: 2, dealId: 11, kind: 'task', title: 'Send revised camera layout', startsAt: at(0, 15), endsAt: null, location: '', details: '', assignees: ['Zoltan'], inviteCustomer: false, customerEmail: '', remind: 60, logged: false, done: false, status: 'scheduled', createdBy: 'Zoltan', createdAt: at(-2, 9) },
    { id: 3, dealId: 13, kind: 'task', title: 'Call back about NVR storage', startsAt: at(-1, 11), endsAt: null, location: '', details: '', assignees: ['Motasim'], inviteCustomer: false, customerEmail: '', remind: 30, logged: false, done: false, status: 'scheduled', createdBy: 'Maham', createdAt: at(-3, 9) },
  ];
  acts[0].location = (deals.find(x => x.id === 12) || {}).site || '';

  // ---------- Helpers ----------
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => '$' + Math.round(n || 0).toLocaleString('en-CA');
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
  // ---------- Team pilot: sign-in and saving (Supabase) ----------
  const SB_URL = 'https://hpwfkgoduruigsikqtre.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwd2ZrZ29kdXJ1aWdzaWtxdHJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1NzQwNjcsImV4cCI6MjExMTE1MDA2N30._Is4TD8na5wFMqfnlF92nGA_pH45J313pPkXtcSGW-o'; // public anon key; data is protected by sign-in and row-level security
  const RESET_URL = 'https://forcevision.github.io/crm/'; // where the forgot-password email link opens
  let LIVE = false, sb = null, me = null, myEmail = '', teamNames = {};
  const mem = {}; // the preview blocks browser storage, so the sign-in lives in memory (sign in again after a reload); the team link keeps it
  const store = { getItem: k => mem[k] ?? null, setItem: (k, v) => { mem[k] = v; }, removeItem: k => { delete mem[k]; } };
  const dealFromDb = r => ({ id: r.id, contactId: r.contact_id, title: r.title, owner: r.owner, site: r.site || '', needs: r.needs || '', value: +r.value || 0, stage: r.stage, nextAction: r.next_action || '', followUp: r.follow_up || '', proposal: r.proposal || '', notes: r.notes || [], createdAt: r.created_at || '', draft: r.draft || undefined, trelloId: r.trello_id || undefined, archived: !!r.archived, wonAt: r.won_at || '', updatedBy: r.updated_by || '', updatedAt: r.updated_at || '' });
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
  }
  function failed(err) { console.error(err); toast('Not saved. Check your connection and try again.'); loadAll().then(render).catch(() => {}); }
  function saveDeal(x) { if (!LIVE) return Promise.resolve(); x.updatedBy = myEmail; x.updatedAt = new Date().toISOString(); return sb.from('deals').update(dealToDb(x)).eq('id', x.id).then(({ error }) => error && failed(error)); }
  function saveContact(c) { if (!LIVE) return; c.updatedBy = myEmail; c.updatedAt = stamp(); sb.from('contacts').update(contactToDb(c)).eq('id', c.id).then(({ error }) => error && failed(error)); }
  async function insertRows(table, rows) { const { data, error } = await sb.from(table).insert(rows).select('id'); if (error) throw error; return data.map(r => r.id); }

  let toastTimer;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => t.hidden = true, 2200); }

  const note = (x, text, at, list = 'notes') => x[list].push(me ? { at: at || stamp(), text, by: me } : { at: at || stamp(), text });
  const ago = iso => { const m = Math.round((Date.now() - new Date(iso)) / 60000); if (m < 1) return 'just now'; if (m < 60) return `${m} min ago`; const h = Math.round(m / 60); if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`; const n = Math.round(h / 24); return `${n} day${n === 1 ? '' : 's'} ago`; };
  const telHref = ph => 'tel:' + String(ph || '').replace(/[^\d+]/g, '');
  const mailHref = (to, subject, body) => `mailto:${encodeURIComponent(to || '').replace(/%40/g, '@')}?subject=${encodeURIComponent(subject || '')}&body=${encodeURIComponent(body || '')}`;
  const reachButtons = c => (c.phone ? `<a class="secondary btn-link" data-call href="${esc(telHref(c.phone))}">Call</a>` : '') + (c.email ? `<button class="secondary" data-compose>Email</button>` : '');

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
    const tasks = group('Overdue', overdue) + group('Due today', due) + group('Next 7 days', upcoming);

    $('#view').innerHTML = `
      <div class="kpis">
        <div class="kpi ${overdue.length ? 'alert' : ''}"><div class="label">Overdue follow-ups</div><div class="value num">${overdue.length}</div></div>
        <div class="kpi"><div class="label">Due today</div><div class="value num">${due.length}</div></div>
        <div class="kpi"><div class="label">Open pipeline (CAD)</div><div class="value num">${money(pipelineValue)}</div></div>
        <div class="kpi"><div class="label">Won (CAD)</div><div class="value num">${money(won)}</div></div>
      </div>
      ${agenda.length ? `<div class="panel today-acts"><div class="panel-head"><h2>Tasks and meetings</h2><span class="count">${agenda.length}</span></div><ul class="list">${agenda.map(a => actRow(a, true)).join('')}</ul></div>` : ''}
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
    $('#viewTitle').textContent = { today: 'Today', pipeline: 'Pipeline', contacts: 'Contacts', assistant: 'Sales Assistant', reports: 'Reports', calendar: 'Calendar' }[view];
    ({ today: renderToday, pipeline: renderPipeline, contacts: renderContacts, assistant: renderAssistant, reports: renderReports, calendar: renderCalendar })[view]();
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
  function openDrawer(title, html) { $('#drawerTitle').textContent = title; $('#drawerBody').innerHTML = html; $('#drawer').hidden = false; }
  function closeDrawer() { $('#drawer').hidden = true; }

  function openDeal(id) {
    const isNew = id == null;
    const x = isNew ? { id: null, owner: who !== 'all' ? who : TEAM[0], contactId: contacts[0] ? contacts[0].id : null, title: '', site: '', needs: '', value: 0, stage: 'New lead', nextAction: '', followUp: d(1), proposal: '', notes: [] } : deals.find(z => z.id === id);
    const c = contactOf(x);
    const idx = STAGES.indexOf(x.stage);
    openDrawer(isNew ? 'New deal' : c.company, `
      ${!isNew && x.archived ? '<p class="arch-note">This deal is archived. It is hidden from Today, Pipeline and the Sales Assistant.</p>' : ''}
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
        <h3>Activity notes</h3>
        ${noteList(x.notes)}
        <div class="note-add"><input id="noteText" placeholder="Add a note" aria-label="Add a note"><button class="secondary" id="addNote">Add</button></div>`}
    `);
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
      const callLink = document.querySelector('#drawerBody [data-call]');
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
  let mailboxOk = null, mySig = '';
  const sigText = () => mySig || `${me || ''}\nForceVision Inc.`;
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
        <div class="field full"><label for="m-body">Message</label><textarea id="m-body" style="min-height:200px">${esc(`${firstName(c) ? `Hi ${firstName(c)},` : 'Hello,'}\n\n\n\n${sigText()}`)}</textarea></div>
        <div class="actions"><button class="primary" id="mSend">Send email</button><a class="secondary btn-link" id="mApp" href="#">Use my email app instead (not tracked)</a><button class="secondary" id="mSigBtn">My signature</button></div>
        <div id="sigBox" class="log-call" hidden>
          <div class="field full"><label for="sig-text">My signature</label><textarea id="sig-text" style="min-height:120px" placeholder="Name&#10;Title&#10;Phone&#10;forcevision.ca">${esc(sigText())}</textarea></div>
          <p class="import-note">Added to the end of every email you send from the CRM. Only you can change yours.</p>
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
    $('#mSigBtn').onclick = () => { $('#sigBox').hidden = !$('#sigBox').hidden; if (!$('#sigBox').hidden) $('#sig-text').focus(); };
    $('#sigSave').onclick = async e => {
      const old = sigText(), sig = $('#sig-text').value.replace(/\s+$/, '');
      if (LIVE) { e.target.disabled = true; const { error } = await sb.rpc('crm_set_signature', { sig }); e.target.disabled = false; if (error) { toast('Signature not saved. Try again.'); return; } }
      mySig = sig; const b = $('#m-body').value.replace(/\s+$/, '');
      if (b.endsWith(old)) $('#m-body').value = b.slice(0, b.length - old.length) + sigText();
      else if (!b.endsWith(sigText())) $('#m-body').value = `${b}\n\n${sigText()}`;
      $('#sigBox').hidden = true; toast('Signature saved');
    };
    $('#mApp').onclick = e => { e.currentTarget.href = mailHref($('#m-to').value, $('#m-subject').value, $('#m-body').value); };
    $('#mSend').onclick = async e => {
      const n = await sendEmail(e.target, x, c, { to: $('#m-to').value, cc: $('#m-cc').value, subject: $('#m-subject').value.trim(), text: $('#m-body').value });
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
    `);
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
    const done = e.target.closest('[data-done]');
    if (done) { e.stopPropagation(); return completeFollowUp(deals.find(x => x.id === +done.dataset.done)); }
    const deal = e.target.closest('[data-deal]');
    if (deal && !e.target.closest('.drawer-panel') || deal && e.target.closest('.list')) return openDeal(+deal.dataset.deal);
    const contact = e.target.closest('[data-contact]');
    if (contact) return openContact(+contact.dataset.contact);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#drawer').hidden) closeDrawer(); });

  // ---------- Sign-in screen, account links, refresh ----------
  const gateMsg = (m, ok) => { const el = $('#gateMsg'); el.textContent = m; el.hidden = !m; el.className = ok ? 'gate-ok' : 'import-error'; };
  async function startLive(session) {
    const email = (session.user.email || '').toLowerCase();
    const [m, co] = await Promise.all([sb.from('members').select('company_id,email,name,is_owner,signature'), sb.from('companies').select('id,name').order('id')]);
    const mine = !m.error && !co.error ? m.data.filter(r => r.email.toLowerCase() === email) : [];
    if (!mine.length) { await sb.auth.signOut(); $('#gate').hidden = false; gateMsg('This email is not on any company team list. Ask Zoltan to add you.'); return; }
    members = m.data; myEmail = email; mySig = mine[0].signature || '';
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
