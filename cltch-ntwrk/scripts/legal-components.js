(function () {
  var localLaws = null;

  function fetchLocalLawData() {
    if (localLaws) {
      return Promise.resolve(localLaws);
    }
    return fetch('data/local-laws.json').then(function (res) {
      if (!res.ok) throw new Error('local laws data unavailable');
      return res.json();
    }).then(function (data) {
      localLaws = Array.isArray(data) ? data : [];
      return localLaws;
    }).catch(function () {
      localLaws = [];
      return localLaws;
    });
  }

  function createElement(tag, options) {
    var el = document.createElement(tag);
    if (options) {
      Object.keys(options).forEach(function (key) {
        if (key === 'className') {
          el.className = options[key];
        } else if (key === 'text') {
          el.textContent = options[key];
        } else if (key === 'html') {
          el.innerHTML = options[key];
        } else {
          el.setAttribute(key, options[key]);
        }
      });
    }
    return el;
  }

  function renderComplianceSnapshot(targetId) {
    var target = document.getElementById(targetId);
    if (!target) return;
    var cards = [
      { title: 'Accessibility', body: 'Keyboard-first UI, alt text, captions, and ADA/Section 508 tests every release.' },
      { title: 'Privacy Rights', body: '30- and 45-day request SLAs for CCPA/CPRA, Colorado CPA, and statewide regimes.' },
      { title: 'Copyright / DMCA', body: '17 U.S.C. § 512 compliant notices, counter-notices, and repeat-infringer tracking.' },
      { title: 'Local Ordinances', body: 'City/county/borough/parish-specific obligations are mapped via our local-law layer.' }
    ];
    target.innerHTML = '';
    var grid = createElement('div', { className: 'compliance-grid' });
    cards.forEach(function (card) {
      var panel = createElement('div', { className: 'compliance-card' });
      panel.appendChild(createElement('h3', { text: card.title }));
      panel.appendChild(createElement('p', { text: card.body }));
      grid.appendChild(panel);
    });
    target.appendChild(grid);
    fetchLocalLawData().then(function (laws) {
      if (!laws.length) return;
      var list = createElement('ul', { className: 'local-law-list' });
      laws.slice(0, 3).forEach(function (law) {
        var text = law.jurisdiction + ' (' + law.type + ') – ' + law.notes.join(' · ');
        list.appendChild(createElement('li', { text: text }));
      });
      var footer = createElement('div', { className: 'local-law-footer' });
      footer.textContent = 'Learn more about local obligations where you transact.';
      target.appendChild(list);
      target.appendChild(footer);
    });
  }

  function renderFAQ(targetId) {
    var target = document.getElementById(targetId);
    if (!target) return;
    var groups = [
      {
        label: 'Getting Started',
        items: [
          { q: 'How do I create an account?', a: 'Sign up, verify your email, provide ID/selfie details (18+ only), and pick Host or Performer roles—or both—for venues and talent.' },
          { q: 'Which documents are required?', a: 'We ask for government-issued ID and selfie matching; sensitive identifiers like SSNs/ITINs never leave the verification vendor, only an approval flag.' }
        ]
      },
      {
        label: 'Pricing & Fees',
        items: [
          { q: 'What does CLTCH charge?', a: 'Hosts pay a 2% processing fee per completed booking. Verified Performer is optional at $20/month. There are no hidden subscriptions, just the disclosed processing and service fees.' },
          { q: 'When do payouts occur?', a: 'Once bookings close you receive funds via the payout method selected in your profile (Apple Pay, Google Pay, etc.) and fees are settled at the same time.' }
        ]
      },
      {
        label: 'Legal & Compliance',
        items: [
          { q: 'Which laws cover my bookings?', a: 'We follow ADA/Section 508, COPPA, CCPA/CPRA (+ Colorado, Virginia, Connecticut privacy laws), FTC marketing rules, DMCA, Title VII standards, and any relevant city/county/borough/parish ordinances for your venue.' },
          { q: 'How do I manage privacy rights?', a: 'Email privacy@cltch.ntwrk or use the contact form. We usually acknowledge within 10 business days and resolve requests within 45, unless a lawful extension is needed.' },
          { q: 'Why can’t minors sign up?', a: 'Accounts are limited to users 18+ so we comply with COPPA, FLSA child labor rules, and local child employment ordinances; underage accounts are closed unless parental consent/permits are provided.' }
        ]
      },
      {
        label: 'Hosts & Performers',
        items: [
          { q: 'How does Gig Radar match opportunities?', a: 'We weight role, genres, availability, location, and intent filters to deliver high-match gigs; saved gigs and insights help you decide quickly.' },
          { q: 'How do I report compliance issues?', a: 'Use support.html or email legal@cltch.ntwrk to flag child labor, safety, or suspicious payment concerns—compliance gets those within 24 hours.' }
        ]
      }
    ];
    target.innerHTML = '';
    groups.forEach(function (group) {
      var wrapper = createElement('div', { className: 'faq-group' });
      wrapper.appendChild(createElement('div', { className: 'section-label', text: group.label }));
      group.items.forEach(function (item) {
        var faqItem = createElement('div', { className: 'faq-item' });
        var question = createElement('div', { className: 'faq-q' });
        var arrow = createElement('span', { className: 'faq-chevron', html: '&#8964;' });
        question.appendChild(createElement('span', { text: item.q }));
        question.appendChild(arrow);
        question.addEventListener('click', function () {
          faqItem.classList.toggle('open');
        });
        faqItem.appendChild(question);
        var answer = createElement('div', { className: 'faq-a' });
        answer.textContent = item.a;
        faqItem.appendChild(answer);
        wrapper.appendChild(faqItem);
      });
      target.appendChild(wrapper);
    });
  }

  function showAccessibilityBanner(targetId) {
    var target = document.getElementById(targetId);
    if (!target) return;
    var banner = createElement('div', { className: 'accessibility-banner' });
    banner.innerHTML = '<strong>Accessibility & Compliance</strong>: keyboard-first navigation, captions, and clear escalation routes are verified on every update. <a href="accessibility.html">Learn more</a>.';
    target.appendChild(banner);
  }

  function initPolicyLayout() {
    var main = document.querySelector('main.container');
    if (!main) return;
    main.classList.add('legal-layout');
    var sections = main.querySelectorAll('h2');
    var table = createElement('div', { className: 'legal-table-grid', role: 'table' });
    sections.forEach(function (heading) {
      var wrapper = heading.closest('section');
      if (wrapper) {
        table.appendChild(wrapper);
        return;
      }
      var section = createElement('section', { className: 'legal-section', role: 'row' });
      var titleCell = createElement('div', { className: 'legal-section-title', role: 'rowheader' });
      var bodyCell = createElement('div', { className: 'legal-section-body', role: 'cell' });
      var sibling = heading.nextElementSibling;
      heading.parentNode.insertBefore(section, heading);
      titleCell.appendChild(heading);
      section.appendChild(titleCell);
      section.appendChild(bodyCell);
      while (sibling && sibling.tagName !== 'H2') {
        var next = sibling.nextElementSibling;
        bodyCell.appendChild(sibling);
        sibling = next;
      }
      table.appendChild(section);
    });
    if (table.children.length) {
      main.appendChild(table);
    }
  }

  window.LegalComponents = {
    renderComplianceSnapshot: renderComplianceSnapshot,
    renderFAQ: renderFAQ,
    showAccessibilityBanner: showAccessibilityBanner,
    initPolicyLayout: initPolicyLayout,
    fetchLocalLawData: fetchLocalLawData
  };
})();
