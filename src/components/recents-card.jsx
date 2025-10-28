import { Link } from "react-router";

export default function RecentsCard({
  title,
  columns,
  data = [],
  actionLabel = "View All",
  onAction,
}) {
  const handleRowClick = (id) => {
    if (data.length > 0) {
      window.location.href = `/bookings/${id}`;
    }
  };
  return (
    <div className="border-border overflow-hidden rounded-xl border bg-white">
      <div className="border-border bg-chart-5/10 flex items-center justify-between border-b p-6">
        <h2 className="text-foreground text-lg font-semibold">{title}</h2>
        <Link
          to="/bookings"
          onClick={onAction}
          className="text-primary text-xs hover:underline"
        >
          {actionLabel}
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="text-muted-foreground px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {(data.length !== 0 ? data : Array(5).fill(0))?.map(
              (row, index) => (
                <tr
                  onClick={() => handleRowClick(row._id)}
                  key={index}
                  className="hover:bg-muted/20 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="text-foreground px-6 py-4 text-xs tabular-nums"
                    >
                      {column.key
                        .split(".")
                        .reduce((acc, part) => acc && acc[part], row) || "-"}
                    </td>
                  ))}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
