const plugins = {
  formula_assistant: {
    id: "formula_assistant",
    name: "Formula Assistant",
    description: "Suggests spreadsheet formulas from plain-English goals.",
    run(input) {
      const prompt = String(input?.prompt || "").toLowerCase();
      const kbEntries = Array.isArray(input?.kbContext?.entries) ? input.kbContext.entries : [];
      const suggestions = [];
      if (prompt.includes("sum") || prompt.includes("total")) {
        suggestions.push({
          title: "Total by range",
          formula: "=SUM(B2:B100)",
          note: "Use when you want a column total."
        });
      }
      if (prompt.includes("average") || prompt.includes("mean")) {
        suggestions.push({
          title: "Average",
          formula: "=AVERAGE(B2:B100)",
          note: "Use for mean values."
        });
      }
      if (prompt.includes("lookup") || prompt.includes("match") || prompt.includes("find")) {
        suggestions.push({
          title: "Lookup value",
          formula: '=XLOOKUP(E2,A2:A100,B2:B100,"Not found")',
          note: "Finds a value from a key column."
        });
      }
      if (prompt.includes("if")) {
        suggestions.push({
          title: "Conditional value",
          formula: '=IF(C2>1000,"High","Normal")',
          note: "Branches output based on a condition."
        });
      }
      if (suggestions.length === 0) {
        suggestions.push({
          title: "General starter",
          formula: "=SUMIFS(C:C,A:A,E2,B:B,F2)",
          note: "Flexible pattern for filtered totals."
        });
      }
      if (kbEntries.length > 0) {
        const first = kbEntries[0];
        const kbFormula = first?.formula || first?.example || first?.snippet;
        if (kbFormula) {
          suggestions.unshift({
            title: "ExcelJet encyclopedia hint",
            formula: String(kbFormula),
            note: "Sourced from external knowledge context."
          });
        }
      }
      return {
        summary: "Formula suggestions generated.",
        suggestions,
        metadata: {
          contextSources: kbEntries.length > 0 ? ["local", "exceljet_kb"] : ["local"]
        }
      };
    }
  },
  connector_advisor: {
    id: "connector_advisor",
    name: "Connector Advisor",
    description: "Recommends connectors based on reporting intent.",
    run(input) {
      const goal = String(input?.prompt || "").toLowerCase();
      const kbEntries = Array.isArray(input?.kbContext?.entries) ? input.kbContext.entries : [];
      const picks = [];
      if (goal.includes("revenue") || goal.includes("payments")) picks.push("Stripe", "PayPal", "Square");
      if (goal.includes("account") || goal.includes("p&l") || goal.includes("tax")) picks.push("QuickBooks", "Xero");
      if (goal.includes("ecommerce") || goal.includes("inventory") || goal.includes("orders")) picks.push("Shopify");
      if (goal.includes("crm") || goal.includes("pipeline") || goal.includes("customers")) picks.push("HubSpot", "Salesforce");
      if (goal.includes("marketing") || goal.includes("campaign")) picks.push("Mailchimp");
      const unique = [...new Set(picks)];
      const kbConnectors = kbEntries
        .map((entry) => entry?.connector || entry?.tool || entry?.source)
        .filter(Boolean)
        .map((value) => String(value));
      return {
        summary: unique.length
          ? "Recommended connectors for this workflow."
          : "No specific connector signal detected. Start with your source of truth app first.",
        connectors: [...new Set([...kbConnectors, ...unique])]
      };
    }
  },
  export_planner: {
    id: "export_planner",
    name: "Export Planner",
    description: "Creates a practical export workflow plan.",
    run(input) {
      const cadence = input?.cadence || "weekly";
      return {
        summary: "Suggested export plan generated.",
        checklist: [
          "Validate connected sources and token health.",
          "Pick template and confirm required columns.",
          `Run a ${cadence} scheduled export with small sample first.`,
          "Enable anomaly checks on totals and row counts.",
          "Distribute export to stakeholders with version timestamp."
        ]
      };
    }
  },
  support_triage: {
    id: "support_triage",
    name: "Support Triage",
    description: "Generates first-response troubleshooting steps.",
    run(input) {
      const issue = String(input?.prompt || "").toLowerCase();
      const steps = ["Confirm user plan limits and usage caps.", "Check connector authentication/token expiration.", "Review recent sync and API rate-limit events."];
      if (issue.includes("export")) steps.push("Re-run export with reduced date range to isolate row-size constraints.");
      if (issue.includes("login")) steps.push("Inspect auth guard lockout state and reset password flow.");
      if (issue.includes("billing")) steps.push("Validate active subscription cycle and invoice state.");
      return {
        summary: "Initial support triage prepared.",
        steps
      };
    }
  }
};

function listPlugins() {
  return Object.values(plugins).map(({ id, name, description }) => ({ id, name, description }));
}

self.addEventListener("message", (event) => {
  const { id, type, payload } = event.data || {};
  try {
    if (type === "plugins/list") {
      self.postMessage({ id, ok: true, data: { plugins: listPlugins() } });
      return;
    }
    if (type === "plugin/run") {
      const pluginId = payload?.pluginId;
      const plugin = plugins[pluginId];
      if (!plugin) {
        self.postMessage({ id, ok: false, error: `Unknown plugin: ${pluginId}` });
        return;
      }
      const result = plugin.run(payload || {});
      self.postMessage({ id, ok: true, data: { pluginId, result } });
      return;
    }
    self.postMessage({ id, ok: false, error: `Unsupported request type: ${type}` });
  } catch (error) {
    self.postMessage({
      id,
      ok: false,
      error: error instanceof Error ? error.message : "Background plugin worker error"
    });
  }
});
