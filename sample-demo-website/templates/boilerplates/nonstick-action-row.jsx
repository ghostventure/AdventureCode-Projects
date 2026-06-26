export default function NonstickActionRow({ status = "Draft", primaryLabel = "Save", secondaryLabel = "Cancel" }) {
  return (
    <div className="nonstick-action-row" role="region" aria-label="Page actions">
      <span>{status}</span>
      <div>
        <button className="secondary-button" type="button">{secondaryLabel}</button>
        <button type="button">{primaryLabel}</button>
      </div>
    </div>
  );
}
