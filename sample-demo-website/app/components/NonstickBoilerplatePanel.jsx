import { nonstickBoilerplateItems } from "../../lib/nonstick-boilerplates";

export default function NonstickBoilerplatePanel() {
  return (
    <section className="component-card">
      <p className="component-label">Global non-stick boilerplates</p>
      <h2>Installed layout starters</h2>
      <p>Reusable normal-flow patterns for future client pages that should avoid sticky or fixed UI.</p>
      <div className="split-list">
        {nonstickBoilerplateItems.map((item) => (
          <span key={item.label}>
            <strong>{item.label}</strong>
            {item.value}
          </span>
        ))}
      </div>
    </section>
  );
}
