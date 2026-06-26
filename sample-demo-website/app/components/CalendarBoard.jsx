const days = [
  ["Mon", "Discovery call"],
  ["Tue", "Manager review"],
  ["Wed", "Open slot"],
  ["Thu", "Client follow-up"],
  ["Fri", "Admin audit"]
];

export default function CalendarBoard() {
  return (
    <section className="component-card">
      <p className="component-label">Calendar</p>
      <div className="calendar-board">
        {days.map(([day, item]) => (
          <div key={day}>
            <strong>{day}</strong>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
