(function () {
  var STORAGE_PREFIX = "cltch_platform_component:";

  function readState(key, fallback) {
    try {
      var raw = window.localStorage.getItem(STORAGE_PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeState(key, value) {
    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (error) {}
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function renderChecklist(container, key, items) {
    var state = readState(key, {});
    container.innerHTML = "";
    var list = el("div", "cltch-component-list");
    items.forEach(function (item) {
      var row = el("label", "cltch-check-row");
      var input = document.createElement("input");
      input.type = "checkbox";
      input.checked = !!state[item.id];
      input.addEventListener("change", function () {
        state[item.id] = input.checked;
        writeState(key, state);
        row.classList.toggle("complete", input.checked);
      });
      row.classList.toggle("complete", input.checked);
      var copy = el("span", "");
      copy.innerHTML = "<strong>" + item.title + "</strong><small>" + item.copy + "</small>";
      row.appendChild(input);
      row.appendChild(copy);
      list.appendChild(row);
    });
    container.appendChild(list);
  }

  function initBookingAgreement(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    renderChecklist(container, "booking_agreement", [
      { id: "scope", title: "Scope locked", copy: "Event time, role, rate, and setup expectations are confirmed." },
      { id: "terms", title: "Terms accepted", copy: "Cancellation, late arrival, and payment timing are visible to both sides." },
      { id: "contacts", title: "Day-of contacts set", copy: "Host contact, performer contact, and emergency contact are documented." },
      { id: "rider", title: "Rider reviewed", copy: "Equipment, parking, access, dress code, and venue notes are attached." }
    ]);
  }

  function initStatusTimeline(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var steps = [
      ["requested", "Requested"],
      ["matched", "Matched"],
      ["offered", "Offer Sent"],
      ["accepted", "Accepted"],
      ["confirmed", "Confirmed"],
      ["checked-in", "Checked In"],
      ["completed", "Completed"],
      ["paid", "Paid"]
    ];
    var state = readState("booking_status", { current: "accepted" });
    container.innerHTML = "";
    var rail = el("div", "cltch-status-rail");
    var activeIndex = Math.max(0, steps.findIndex(function (step) { return step[0] === state.current; }));
    steps.forEach(function (step, index) {
      var button = el("button", "cltch-status-step", step[1]);
      button.type = "button";
      button.classList.toggle("done", index < activeIndex);
      button.classList.toggle("active", index === activeIndex);
      button.addEventListener("click", function () {
        state.current = step[0];
        writeState("booking_status", state);
        initStatusTimeline(containerId);
      });
      rail.appendChild(button);
    });
    container.appendChild(rail);
  }

  function initPaymentLifecycle(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    renderChecklist(container, "payment_lifecycle", [
      { id: "method", title: "Payment method captured", copy: "Preferred payout/payment method is present before confirmation." },
      { id: "hold", title: "Funds plan documented", copy: "Manual or provider-backed payment plan is clear for both sides." },
      { id: "release", title: "Release condition set", copy: "Payment release depends on completion, check-in, or host approval." },
      { id: "receipt", title: "Receipt trail ready", copy: "Booking ID, amount, fee, and status can be audited later." }
    ]);
  }

  function initDisputeFlow(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var state = readState("dispute_flow", { reason: "", note: "" });
    container.innerHTML = "";
    var form = el("form", "cltch-component-form");
    form.innerHTML = [
      "<label>Issue Type</label>",
      "<select name=\"reason\">",
      "<option value=\"\">No active issue</option>",
      "<option>No-show</option>",
      "<option>Late arrival</option>",
      "<option>Payment issue</option>",
      "<option>Venue access problem</option>",
      "<option>Scope changed</option>",
      "</select>",
      "<label>Resolution Notes</label>",
      "<textarea name=\"note\" rows=\"3\" placeholder=\"Add the next action, refund note, replacement performer, or support decision.\"></textarea>",
      "<button type=\"submit\">Save Issue Note</button>",
      "<p class=\"cltch-component-status\"></p>"
    ].join("");
    form.reason.value = state.reason || "";
    form.note.value = state.note || "";
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      state.reason = form.reason.value;
      state.note = form.note.value.trim();
      writeState("dispute_flow", state);
      form.querySelector(".cltch-component-status").textContent = state.reason ? "Issue note saved for operations review." : "No active issue saved.";
    });
    container.appendChild(form);
  }

  function initTrustVerification(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    renderChecklist(container, "trust_verification", [
      { id: "email", title: "Email verified", copy: "Account contact is verified before booking actions." },
      { id: "profile", title: "Profile complete", copy: "Bio, location, skill category, and public-facing details are filled in." },
      { id: "payout", title: "Payout ready", copy: "Payment preference is available before an offer is accepted." },
      { id: "media", title: "Work proof present", copy: "Portfolio, social, EPK, or sample media gives the other side confidence." }
    ]);
  }

  function initPortfolioManager(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var state = readState("portfolio_manager", []);
    container.innerHTML = "";
    var form = el("form", "cltch-component-form");
    form.innerHTML = [
      "<label>Portfolio / EPK Link</label>",
      "<input name=\"url\" type=\"url\" placeholder=\"https://...\">",
      "<label>Label</label>",
      "<input name=\"label\" type=\"text\" placeholder=\"Live set, reel, EPK, gallery, social\">",
      "<button type=\"submit\">Add Media Link</button>"
    ].join("");
    var list = el("div", "cltch-chip-list");
    function renderList() {
      list.innerHTML = "";
      if (!state.length) {
        list.appendChild(el("p", "cltch-component-status", "No media links saved yet."));
        return;
      }
      state.forEach(function (item, index) {
        var chip = el("span", "vault-chip");
        var link = el("a", "", item.label || item.url);
        link.href = item.url;
        link.target = "_blank";
        link.rel = "noopener";
        var remove = el("button", "", "x");
        remove.type = "button";
        remove.addEventListener("click", function () {
          state.splice(index, 1);
          writeState("portfolio_manager", state);
          renderList();
        });
        chip.appendChild(link);
        chip.appendChild(remove);
        list.appendChild(chip);
      });
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var url = form.url.value.trim();
      if (!url) return;
      state.push({ url: url, label: form.label.value.trim() || "Media link" });
      writeState("portfolio_manager", state);
      form.reset();
      renderList();
    });
    container.appendChild(form);
    container.appendChild(list);
    renderList();
  }

  function initOperationsDashboard(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    var cards = [
      ["Open bookings", "Review offers, acceptances, and pending check-ins."],
      ["Payment review", "Watch bookings that need payout confirmation or manual payment notes."],
      ["Trust queue", "Check incomplete profiles, verification requests, and work-proof gaps."],
      ["Support issues", "Track disputes, cancellations, no-shows, and urgent event problems."],
      ["Content review", "Audit uploaded links, profile claims, and public-facing media."],
      ["Platform health", "Confirm auth, Firebase rules, deploy status, and page load checks."]
    ];
    var grid = el("div", "cltch-ops-grid");
    cards.forEach(function (card) {
      var node = el("article", "cltch-ops-card");
      node.innerHTML = "<strong>" + card[0] + "</strong><span>" + card[1] + "</span>";
      grid.appendChild(node);
    });
    container.appendChild(grid);
  }

  window.PlatformComponents = {
    initBookingAgreement: initBookingAgreement,
    initStatusTimeline: initStatusTimeline,
    initPaymentLifecycle: initPaymentLifecycle,
    initDisputeFlow: initDisputeFlow,
    initTrustVerification: initTrustVerification,
    initPortfolioManager: initPortfolioManager,
    initOperationsDashboard: initOperationsDashboard
  };
})();
