import DataTable from "./DataTable";

export default function PaginatedDataTable({ columns, rows, page = 1, pageSize = 10 }) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  return (
    <section className="component-card wide-card">
      <p className="component-label">Paginated data table</p>
      <DataTable columns={columns} rows={pageRows} />
      <div className="pagination-bar">
        <span>Page {page} of {totalPages}</span>
        <span>{rows.length} records</span>
      </div>
    </section>
  );
}
