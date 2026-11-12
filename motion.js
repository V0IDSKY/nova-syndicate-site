/* Safe, local-only interaction layer. Terminal commands are simulated and never reach the host OS. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const make = (tag, attrs = {}, text = '') => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (text) node.textContent = text;
    return node;
  };
  const installStyles = () => {
    if (!document.querySelector('link[data-nova-motion]')) {
      const link = make('link', { rel: 'stylesheet', href: 'motion.css', 'data-nova-motion': 'true' });
      document.head.append(link);
    }
  };
  const installLoader = () => {
    if (sessionStorage.getItem('nova-archive-ready') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const overlay = make('div', { class: 'loading-screen', role: 'status', 'aria-label': 'NØVA archive ready' });
    const card = make('div', { class: 'loading-card' });
    card.append(make('div', { class: 'loading-brand' }, 'NØVA SYNDICATE'));
    ['INITIALIZING ARCHIVE…', 'LOADING RESEARCH INDEX…', 'SYSTEM READY.'].forEach(line => card.append(make('div', { class: 'loading-line' }, line)));
    const track = make('div', { class: 'loading-track' }); track.append(make('span')); card.append(track); overlay.append(card); document.body.append(overlay);
    setTimeout(() => { overlay.classList.add('is-done'); sessionStorage.setItem('nova-archive-ready', '1'); setTimeout(() => overlay.remove(), 500); }, 850);
  };
  const mountTools = () => {
    const target = $('#learning');
    if (!target || $('#nova-network')) return;
    const section = document.createElement('div');
    section.innerHTML = `
      <section id="nova-network" aria-labelledby="network-title"><div class="tool-heading"><h3 id="network-title">Research network · synthetic topology</h3><span>LAB NETWORK / 192.0.2.0/24</span></div><div class="network-frame"><svg class="network-svg" viewBox="0 0 760 250" role="img" aria-label="Fictional network topology: client, firewall, service, and log collector">
        <path class="edge" d="M130 126H280M380 126H530M330 98V57H600M330 154V203H600"/><path class="edge-flow" d="M130 126H280M380 126H530M330 98V57H600M330 154V203H600"/>
        <g tabindex="0" role="button" aria-label="Lab client, fictional endpoint" data-info="Lab client — fictional endpoint, no real device is observed."><rect class="node" x="30" y="94" width="100" height="64" rx="2"/><text class="node-title" x="51" y="122">CLIENT</text><text x="51" y="141">192.0.2.10</text></g>
        <g tabindex="0" role="button" aria-label="Policy firewall, simulated boundary" data-info="Firewall — conceptual trust boundary between the lab client and service zone."><rect class="node" x="280" y="94" width="100" height="64" rx="2"/><text class="node-title" x="299" y="122">POLICY</text><text x="297" y="141">BOUNDARY</text></g>
        <g tabindex="0" role="button" aria-label="Research service, simulated host" data-info="Research service — synthetic host used only to illustrate an application tier."><rect class="node" x="530" y="94" width="112" height="64" rx="2"/><text class="node-title" x="547" y="122">SERVICE</text><text x="547" y="141">192.0.2.40</text></g>
        <g tabindex="0" role="button" aria-label="Log collector, simulated service" data-info="Log collector — receives fictional event records for this learning illustration."><rect class="node" x="550" y="25" width="112" height="48" rx="2"/><text class="node-title" x="566" y="54">LOG SINK</text></g>
        <g tabindex="0" role="button" aria-label="Backup vault, simulated service" data-info="Backup vault — an isolated destination in the example architecture; no data is sent here."><rect class="node" x="550" y="179" width="112" height="48" rx="2"/><text class="node-title" x="565" y="208">VAULT</text></g>
      </svg><div class="network-status"><span id="network-info" aria-live="polite">Select a node for an explanation. All topology values are fictional.</span><span>SIMULATED / NO LIVE SCANNING</span></div></div></section>
      <section id="nova-terminal" aria-labelledby="terminal-title"><div class="tool-heading"><h3 id="terminal-title">Archive terminal</h3><span>SIMULATED COMMAND SET · LOCAL ONLY</span></div><div class="terminal-frame"><div class="terminal-bar"><span class="terminal-dot"></span><span class="terminal-dot"></span><span class="terminal-dot"></span><span style="margin-left:7px">nova://archive/reader</span></div><div class="terminal-output" id="terminal-output" role="log" aria-live="polite"></div><form class="terminal-form" id="terminal-form"><span class="terminal-prompt">reader@nova:~$</span><input class="terminal-input" id="terminal-input" aria-label="Simulated terminal command" autocomplete="off" spellcheck="false" maxlength="60"><button class="mini-button" type="submit">Run</button></form><p class="terminal-help">Available: help · about · status · archive · research · clear. No shell or device access.</p></div></section>
      <section id="nova-logs" aria-labelledby="logs-title"><div class="tool-heading"><h3 id="logs-title">Incident log exercise</h3><span>FICTIONAL TRAINING DATA · 6 EVENTS</span></div><div class="log-tools"><input id="log-search" type="search" placeholder="Filter sample events…" aria-label="Filter simulated logs"><select id="log-level" aria-label="Filter events by severity"><option value="all">All severities</option><option>INFO</option><option>WARNING</option><option>ERROR</option></select></div><div class="log-frame"><div class="log-list" id="log-list"></div></div></section>`;
    target.append(section);
    section.querySelectorAll('.network-svg g').forEach(node => {
      const show = () => { $('#network-info', section).textContent = node.dataset.info; };
      node.addEventListener('mouseenter', show); node.addEventListener('focus', show); node.addEventListener('click', show);
      node.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); show(); } });
    });
    setupTerminal(section); setupLogs(section);
  };
  const setupTerminal = root => {
    const output = $('#terminal-output', root), form = $('#terminal-form', root), input = $('#terminal-input', root);
    const history = []; let cursor = 0;
    const commands = {
      help: () => 'Safe simulated commands:\n  about     archive purpose\n  status    fictional archive status\n  archive   list research domains\n  research  display selected reading\n  clear     clear this panel',
      about: () => 'NØVA SYNDICATE — independent cybersecurity knowledge archive.\nThis terminal is a local educational simulation, not an operating-system shell.',
      status: () => 'ARCHIVE: READY\nDATA SOURCE: STATIC TRAINING CONTENT\nNETWORK ACCESS: NONE\nHOST INSPECTION: NONE',
      archive: () => 'DOMAINS\n01  Network engineering\n02  Web application security\n03  Cryptography\n04  Operating system security\n05  Digital forensics\n06  Malware analysis\n07  Privacy and architecture',
      research: () => 'Open the archive index above to explore references, reading levels, and defensive notes.'
    };
    const print = (text, kind = '') => { const line = make('div', kind ? { class: kind } : {}, text); output.append(line); output.scrollTop = output.scrollHeight; };
    print('NØVA ARCHIVE TERMINAL / simulated interface', 'system'); print('Type help to inspect the available educational commands.');
    form.addEventListener('submit', event => {
      event.preventDefault(); const command = input.value.trim().toLowerCase(); if (!command) return;
      history.push(command); cursor = history.length; print(`reader@nova:~$ ${command}`, 'system'); input.value = '';
      if (command === 'clear') { output.replaceChildren(); return; }
      print(Object.hasOwn(commands, command) ? commands[command]() : 'Unknown simulated command. Type help.');
    });
    input.addEventListener('keydown', event => {
      if (event.key === 'ArrowUp') { event.preventDefault(); if (cursor > 0) input.value = history[--cursor]; }
      if (event.key === 'ArrowDown') { event.preventDefault(); if (cursor < history.length - 1) input.value = history[++cursor]; else { cursor = history.length; input.value = ''; } }
    });
  };
  const setupLogs = root => {
    const records = [
      ['2026-11-12 09:14:03','INFO','IDENTITY','Synthetic analyst session opened in training tenant.'],
      ['2026-11-12 09:16:41','WARNING','POLICY','Example service requested a permission outside its documented role.'],
      ['2026-11-12 09:17:12','INFO','NETWORK','Lab boundary recorded an expected client-to-service flow.'],
      ['2026-11-12 09:19:55','ERROR','INTEGRITY','Training file digest differs from the provided reference value.'],
      ['2026-11-12 09:22:18','WARNING','BACKUP','Fictional recovery test has not been marked verified.'],
      ['2026-11-12 09:24:09','INFO','RESPONSE','Exercise owner attached a note and preserved the sample timeline.']
    ];
    const list = $('#log-list', root), search = $('#log-search', root), level = $('#log-level', root);
    const render = () => {
      const query = search.value.trim().toLowerCase();
      const visible = records.filter(record => (level.value === 'all' || record[1] === level.value) && record.join(' ').toLowerCase().includes(query));
      list.replaceChildren();
      visible.forEach(([time,severity,category,message]) => {
        const details = make('details', { class: 'log-entry' }), summary = make('summary');
        summary.append(make('span',{class:'log-time'},time),make('span',{class:'log-level','data-level':severity},severity),make('span',{},category),make('span',{},message));
        details.append(summary,make('div',{class:'log-detail'},`Training record only. Category: ${category}. Interpret this event alongside scope, expected behavior, and neighboring evidence.`));list.append(details);
      });
      if (!visible.length) list.append(make('p',{class:'empty-state'},'No sample events match this filter.'));
    };
    search.addEventListener('input',render); level.addEventListener('change',render); render();
  };
  const activateReveals = () => {
    document.body.classList.add('js-motion');
    document.querySelectorAll('main section, .feature-card, .article-card').forEach((node,index) => { node.dataset.reveal=''; node.dataset.revealDelay=String(index%4); });
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { document.querySelectorAll('[data-reveal]').forEach(node=>node.classList.add('is-visible')); return; }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);} }), {threshold:.08,rootMargin:'0px 0px -24px 0px'});
    document.querySelectorAll('[data-reveal]').forEach(node=>observer.observe(node));
  };
  const activeSection = () => {
    if (!('IntersectionObserver' in window)) return;
    const links=[...document.querySelectorAll('.nav a[href^="#"]')];
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){links.forEach(link=>{if(link.getAttribute('href')===`#${entry.target.id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}}),{rootMargin:'-25% 0px -65% 0px'});
    links.forEach(link=>{const target=$(link.getAttribute('href'));if(target)observer.observe(target);});
  };
  installStyles();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',()=>{installLoader();mountTools();activateReveals();activeSection();});
  else { installLoader(); mountTools(); activateReveals(); activeSection(); }
})();
