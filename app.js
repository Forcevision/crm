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

  // ---------- Helpers ----------
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => '$' + Math.round(n || 0).toLocaleString('en-CA');
  const contactOf = deal => contacts.find(c => c.id === deal.contactId) || {};
  const daysFrom = iso => iso ? Math.round((new Date(iso + 'T00:00:00') - today) / DAY) : null;
  const fmtDate = iso => iso ? new Date(iso + 'T00:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }) : '—';
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
  let LIVE = false, sb = null, me = null, myEmail = '', teamNames = {};
  const mem = {}; // the preview blocks browser storage, so the sign-in lives in memory (sign in again after a reload)
  const store = { getItem: k => mem[k] ?? null, setItem: (k, v) => { mem[k] = v; }, removeItem: k => { delete mem[k]; } };
  const dealFromDb = r => ({ id: r.id, contactId: r.contact_id, title: r.title, owner: r.owner, site: r.site || '', needs: r.needs || '', value: +r.value || 0, stage: r.stage, nextAction: r.next_action || '', followUp: r.follow_up || '', proposal: r.proposal || '', notes: r.notes || [], draft: r.draft || undefined, trelloId: r.trello_id || undefined, archived: !!r.archived, updatedBy: r.updated_by || '', updatedAt: r.updated_at || '' });
  const dealToDb = x => ({ contact_id: x.contactId || null, title: x.title, owner: x.owner, site: x.site, needs: x.needs, value: x.value || 0, stage: x.stage, next_action: x.nextAction, follow_up: x.followUp || null, proposal: x.proposal, notes: x.notes, draft: x.draft || null, trello_id: x.trelloId || null, archived: !!x.archived, ...(companyId ? { company_id: companyId } : {}) });
  const contactToDb = c => ({ company: c.company, name: c.name, title: c.title, email: c.email, phone: c.phone, address: c.address || '', notes: c.notes, trello_id: c.trelloId || null, ...(companyId ? { company_id: companyId } : {}) });
  async function loadAll() {
    const [c, x] = await Promise.all([sb.from('contacts').select('*').eq('company_id', companyId).order('company'), sb.from('deals').select('*').eq('company_id', companyId).order('id')]);
    if (c.error || x.error) throw (c.error || x.error);
    contacts = c.data.map(r => ({ id: r.id, company: r.company, name: r.name || '', title: r.title || '', email: r.email || '', phone: r.phone || '', address: r.address || '', notes: r.notes || '', trelloId: r.trello_id || undefined }));
    deals = x.data.map(dealFromDb);
  }
  function failed(err) { console.error(err); toast('Not saved. Check your connection and try again.'); loadAll().then(render).catch(() => {}); }
  function saveDeal(x) { if (!LIVE) return; x.updatedBy = myEmail; x.updatedAt = new Date().toISOString(); sb.from('deals').update(dealToDb(x)).eq('id', x.id).then(({ error }) => error && failed(error)); }
  function saveContact(c) { if (!LIVE) return; sb.from('contacts').update(contactToDb(c)).eq('id', c.id).then(({ error }) => error && failed(error)); }
  async function insertRows(table, rows) { const { data, error } = await sb.from(table).insert(rows).select('id'); if (error) throw error; return data.map(r => r.id); }

  let toastTimer;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => t.hidden = true, 2200); }

  const note = (x, text, at) => x.notes.push(me ? { at: at || d(0), text, by: me } : { at: at || d(0), text });
  const ago = iso => { const m = Math.round((Date.now() - new Date(iso)) / 60000); if (m < 1) return 'just now'; if (m < 60) return `${m} min ago`; const h = Math.round(m / 60); if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`; const n = Math.round(h / 24); return `${n} day${n === 1 ? '' : 's'} ago`; };
  const telHref = ph => 'tel:' + String(ph || '').replace(/[^\d+]/g, '');
  const mailHref = (to, subject, body) => `mailto:${encodeURIComponent(to || '').replace(/%40/g, '@')}?subject=${encodeURIComponent(subject || '')}&body=${encodeURIComponent(body || '')}`;
  const reachButtons = c => (c.phone ? `<a class="secondary btn-link" data-call href="${esc(telHref(c.phone))}">Call</a>` : '') + (c.email ? `<a class="secondary btn-link" href="${esc(mailHref(c.email))}">Email</a>` : '');

  let view = 'today', query = '', who = 'all', showArchived = false;
  const ownerChip = x => x.owner ? `<span class="owner" title="Owner: ${esc(x.owner)}">${esc(x.owner)}</span>` : '';
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
    const tasks = group('Overdue', overdue) + group('Due today', due) + group('Next 7 days', upcoming);

    $('#view').innerHTML = `
      <div class="kpis">
        <div class="kpi ${overdue.length ? 'alert' : ''}"><div class="label">Overdue follow-ups</div><div class="value num">${overdue.length}</div></div>
        <div class="kpi"><div class="label">Due today</div><div class="value num">${due.length}</div></div>
        <div class="kpi"><div class="label">Open pipeline (CAD)</div><div class="value num">${money(pipelineValue)}</div></div>
        <div class="kpi"><div class="label">Won (CAD)</div><div class="value num">${money(won)}</div></div>
      </div>
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
      const age = sent ? -daysFrom(sent) : null;
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
      <p class="draft-meta">${dr.saved ? 'Saved Sales Assistant draft for this deal.' : 'Template draft.'} For review. Edit it, copy it into your email, then log it here once you send it yourself.</p>
      <div class="fields">
        <div class="field full"><label>To</label><div class="static">${esc(c.name)} &lt;${esc(dr.to)}&gt;</div></div>
        <div class="field full"><label for="dr-subject">Subject</label><input id="dr-subject" value="${esc(dr.subject)}"></div>
        <div class="field full"><label for="dr-body">Message</label><textarea id="dr-body" style="min-height:340px">${esc(dr.text)}</textarea></div>
      </div>
      <div class="actions"><a class="primary btn-link" id="mailDraft" href="${esc(mailHref(dr.to, dr.subject, dr.text))}">Open in email</a><button class="secondary" id="copyDraft">Copy draft</button><button class="secondary" id="logSent">I sent it — log it</button><button class="secondary" id="backDeal">Open deal</button></div>`);
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
  }

  function render() {
    document.querySelectorAll('.nav button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    $('#viewTitle').textContent = { today: 'Today', pipeline: 'Pipeline', contacts: 'Contacts', assistant: 'Sales Assistant' }[view];
    ({ today: renderToday, pipeline: renderPipeline, contacts: renderContacts, assistant: renderAssistant })[view]();
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
      ${!isNew && x.updatedBy ? `<p class="draft-meta">Last updated by ${esc(teamNames[x.updatedBy.toLowerCase()] || x.updatedBy)} · ${ago(x.updatedAt)}</p>` : ''}
      <form id="dealForm" class="fields">
        <div class="field full"><label for="f-title">Deal name</label><input id="f-title" name="title" required value="${esc(x.title)}"></div>
        <div class="field full"><label for="f-contact">Customer</label><select id="f-contact" name="contactId">${contacts.map(k => `<option value="${k.id}" ${k.id === x.contactId ? 'selected' : ''}>${esc(k.company)} — ${esc(k.name)}</option>`).join('')}</select></div>
        <div class="field full"><label for="f-site">Site address</label><input id="f-site" name="site" value="${esc(x.site)}"></div>
        <div class="field full"><label for="f-needs">Security requirements</label><textarea id="f-needs" name="needs">${esc(x.needs)}</textarea></div>
        <div class="field"><label for="f-owner">Owner</label><select id="f-owner" name="owner">${TEAM.map(t => `<option ${t === x.owner ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
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
          <div class="actions"><button class="primary" id="saveCall">Save call note</button></div>
        </div>
        <h3>Activity notes</h3>
        <ul class="notes">${x.notes.slice().reverse().map(n => `<li><div class="when">${fmtDate(n.at)}${n.by ? ` · ${esc(n.by)}` : ''}</div>${esc(n.text)}</li>`).join('') || '<li class="when">No notes yet.</li>'}</ul>
        <div class="note-add"><input id="noteText" placeholder="Add a note" aria-label="Add a note"><button class="secondary" id="addNote">Add</button></div>`}
    `);
    const read = () => { const f = new FormData($('#dealForm')); return { title: f.get('title').trim(), owner: f.get('owner'), contactId: +f.get('contactId') || null, site: f.get('site'), needs: f.get('needs'), value: +f.get('value') || 0, stage: f.get('stage'), nextAction: f.get('nextAction'), followUp: f.get('followUp'), proposal: f.get('proposal') }; };
    $('#saveDeal').onclick = async e => {
      const v = read();
      if (!v.title) { $('#f-title').focus(); toast('Add a deal name'); return; }
      if (isNew) {
        const nd = { notes: [], ...v };
        if (LIVE) { e.target.disabled = true; try { [nd.id] = await insertRows('deals', [dealToDb(nd)]); } catch (err) { e.target.disabled = false; return failed(err); } } else nd.id = ++uid;
        deals.push(nd); toast('Deal created');
      } else { Object.assign(x, v); saveDeal(x); toast('Saved'); }
      closeDrawer(); render();
    };
    if (!isNew) {
      document.querySelectorAll('.stage-bar button').forEach(b => b.onclick = () => { x.stage = b.dataset.stage; saveDeal(x); toast(`Moved to ${x.stage}`); render(); openDeal(x.id); });
      $('#doneDeal').onclick = () => completeFollowUp(x, true);
      const add = () => { const t = $('#noteText').value.trim(); if (!t) return; note(x, t); saveDeal(x); openDeal(x.id); };
      const showLog = () => { $('#logCallBox').hidden = false; $('#callNote').focus(); };
      $('#logCallBtn').onclick = showLog;
      const callLink = document.querySelector('#drawerBody [data-call]');
      if (callLink) callLink.addEventListener('click', () => setTimeout(showLog, 300));
      $('#saveCall').onclick = () => { const t = $('#callNote').value.trim(); note(x, `Call${c.name ? ` with ${c.name}` : ''}${t ? `: ${t}` : ''}`); if ($('#callFollow').value) x.followUp = $('#callFollow').value; saveDeal(x); toast('Call logged'); render(); openDeal(x.id); };
      $('#archDeal').onclick = () => { x.archived = !x.archived; note(x, x.archived ? 'Archived' : 'Restored from archive'); saveDeal(x); toast(x.archived ? 'Archived. Pipeline › Show archived to restore it.' : 'Restored'); closeDrawer(); render(); };
      $('#addNote').onclick = add;
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

  // ---------- Drawer: contact ----------
  function openContact(id) {
    const isNew = id == null;
    const c = isNew ? { company: '', name: '', title: '', email: '', phone: '', address: '', notes: '' } : contacts.find(k => k.id === id);
    const related = isNew ? [] : deals.filter(x => x.contactId === c.id);
    openDrawer(isNew ? 'New contact' : c.company, `
      <form id="contactForm" class="fields">
        <div class="field full"><label for="c-company">Company</label><input id="c-company" name="company" required value="${esc(c.company)}"></div>
        <div class="field"><label for="c-name">Decision-maker</label><input id="c-name" name="name" value="${esc(c.name)}"></div>
        <div class="field"><label for="c-title">Title</label><input id="c-title" name="title" value="${esc(c.title)}"></div>
        <div class="field"><label for="c-email">Email</label><input id="c-email" name="email" type="email" value="${esc(c.email)}"></div>
        <div class="field"><label for="c-phone">Phone</label><input id="c-phone" name="phone" value="${esc(c.phone)}"></div>
        <div class="field full"><label for="c-address">Address</label><input id="c-address" name="address" value="${esc(c.address)}"></div>
        <div class="field full"><label for="c-notes">Notes</label><textarea id="c-notes" name="notes">${esc(c.notes)}</textarea></div>
      </form>
      <div class="actions"><button class="primary" id="saveContact">${isNew ? 'Create contact' : 'Save changes'}</button></div>
      ${isNew ? '' : `${reachButtons(c) ? `<div class="actions reach">${reachButtons(c)}</div>` : ''}<h3>Deals</h3><ul class="list">${related.map(x => `<li class="row" data-deal="${x.id}"><div class="row-main"><div class="row-title">${esc(x.title)}</div><div class="row-sub num">${money(x.value)}</div></div><div class="row-meta">${x.archived ? '<span class="pill">Archived</span>' : stagePill(x.stage)}</div></li>`).join('') || '<li class="empty">No deals yet.</li>'}</ul>`}
    `);
    $('#saveContact').onclick = async e => {
      const f = new FormData($('#contactForm'));
      const v = Object.fromEntries(['company', 'name', 'title', 'email', 'phone', 'address', 'notes'].map(k => [k, String(f.get(k)).trim()]));
      if (!v.company) { $('#c-company').focus(); toast('Add a company name'); return; }
      if (isNew) {
        const nc = { ...v };
        if (LIVE) { e.target.disabled = true; try { [nc.id] = await insertRows('contacts', [contactToDb(nc)]); } catch (err) { e.target.disabled = false; return failed(err); } } else nc.id = ++uid;
        contacts.push(nc); toast('Contact created');
      } else { Object.assign(c, v); saveContact(c); toast('Saved'); }
      closeDrawer(); render();
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
  $('#exportOpps').onclick = () => download(`forcevision-deals${LIVE ? '' : '-sample'}.csv`, csv([['Deal', 'Owner', 'Company', 'Contact', 'Stage', 'Value CAD', 'Next action', 'Follow-up', 'Site', 'Requirements', 'Proposal'], ...deals.map(x => { const c = contactOf(x); return [x.title, x.owner, c.company, c.name, x.stage, x.value, x.nextAction, x.followUp, x.site, x.needs, x.proposal]; })]));
  $('#exportContacts').onclick = () => download(`forcevision-contacts${LIVE ? '' : '-sample'}.csv`, csv([['Company', 'Name', 'Title', 'Email', 'Phone', 'Address', 'Notes'], ...contacts.map(c => [c.company, c.name, c.title, c.email, c.phone, c.address, c.notes])]));

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
        const contact = { id: ++uid, trelloId: card.id, company: card.name, name: '', title: '', email: '', phone: '', notes: 'Imported from Trello' };
        newContacts.push(contact);
        const notes = [];
        const at = (card.dateLastActivity || '').slice(0, 10) || d(0);
        if (card.desc) notes.push({ at, text: `From Trello: ${card.desc}` });
        if (card.labels && card.labels.length) notes.push({ at, text: `Trello labels: ${card.labels.map(l => l.name || l.color).join(', ')}` });
        comments.filter(a => a.data.card.id === card.id).reverse().forEach(a => notes.push({ at: (a.date || '').slice(0, 10) || at, text: `Trello comment${a.memberCreator ? ` (${a.memberCreator.fullName})` : ''}: ${a.data.text}` }));
        checklists.filter(k => k.idCard === card.id).forEach(k => notes.push({ at, text: `Trello checklist "${k.name}": ${(k.checkItems || []).map(i => `${i.state === 'complete' ? '[done]' : '[ ]'} ${i.name}`).join('; ')}` }));
        const files = (card.attachments || []).filter(a => a.url);
        if (files.length) notes.push({ at, text: `Trello attachments: ${files.map(a => `${a.name || 'file'} (${a.url})`).join(', ')}` });
        notes.push({ at: d(0), text: `Imported from Trello list "${(lists.find(l => l.id === card.idList) || {}).name}"` });
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
  const fillWho = () => { $('#who').innerHTML = `<option value="all">Everyone</option>${TEAM.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join('')}`; $('#who').value = who; };
  fillWho();
  $('#who').onchange = e => { who = e.target.value; render(); };
  document.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) return closeDrawer();
    const dr = e.target.closest('[data-draft]');
    if (dr) { e.stopPropagation(); return openDraft(+dr.dataset.draft); }
    const done = e.target.closest('[data-done]');
    if (done) { e.stopPropagation(); return completeFollowUp(deals.find(x => x.id === +done.dataset.done)); }
    const deal = e.target.closest('[data-deal]');
    if (deal && !e.target.closest('.drawer-panel') || deal && e.target.closest('.list')) return openDeal(+deal.dataset.deal);
    const contact = e.target.closest('[data-contact]');
    if (contact) return openContact(+contact.dataset.contact);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#drawer').hidden) closeDrawer(); });

  // ---------- Sign-in screen, account links, refresh ----------
  const gateMsg = m => { const el = $('#gateMsg'); el.textContent = m; el.hidden = !m; };
  async function startLive(session) {
    const email = (session.user.email || '').toLowerCase();
    const [m, co] = await Promise.all([sb.from('members').select('company_id,email,name,is_owner'), sb.from('companies').select('id,name').order('id')]);
    const mine = !m.error && !co.error ? m.data.filter(r => r.email.toLowerCase() === email) : [];
    if (!mine.length) { await sb.auth.signOut(); $('#gate').hidden = false; gateMsg('This email is not on any company team list. Ask Zoltan to add you.'); return; }
    members = m.data; myEmail = email;
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
  function openPassword() {
    openDrawer('Change password', `<form id="pwForm" class="fields">
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
  $('#gateDemo').onclick = () => { $('#gate').hidden = true; render(); };
  const refresh = () => { if (LIVE && $('#drawer').hidden && document.visibilityState === 'visible') loadAll().then(render).catch(() => {}); };
  document.addEventListener('visibilitychange', refresh);
  setInterval(refresh, 60000);

  (async () => {
    try {
      if (window.supabase) {
        sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { storage: store, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
        const { data } = await sb.auth.getSession();
        if (data.session) return await startLive(data.session);
      }
    } catch (err) { console.error(err); }
    $('#gate').hidden = false;
  })();
})();
