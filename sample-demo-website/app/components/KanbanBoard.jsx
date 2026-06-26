const lanes = [
  ["Backlog", "New invite", "Request review"],
  ["Active", "Manager follow-up", "Client message"],
  ["Done", "Audit check", "Profile update"]
];

export default function KanbanBoard() {
  return (
    <section className="component-card wide-card">
      <p className="component-label">Kanban board</p>
      <div className="kanban-board">
        {lanes.map(([lane, ...cards]) => (
          <div className="kanban-lane" key={lane}>
            <strong>{lane}</strong>
            {cards.map((card) => (
              <span key={card}>{card}</span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
