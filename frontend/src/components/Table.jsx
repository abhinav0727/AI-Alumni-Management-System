/**
 * Table – a generic data table component.
 *
 * Props:
 *   columns  – array of { key, label, render? }
 *   data     – array of row objects
 *   emptyMsg – string shown when data is empty
 */
export default function Table({ columns = [], data = [], emptyMsg = 'No data available.' }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={`${col.key}-${idx}`}
                className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-10 text-center text-slate-400 text-sm"
              >
                {emptyMsg}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row._id || row.id || idx}
                className="hover:bg-slate-50 transition-colors duration-100"
              >
                {columns.map((col, colIdx) => (
                  <td key={`${col.key}-${colIdx}`} className="px-5 py-3.5 text-slate-700 whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
