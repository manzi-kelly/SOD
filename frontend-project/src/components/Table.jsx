export default function Table({ columns, data }) {
  return (
    <div className="overflow-x-auto bg-white rounded shadow">
      <table className="w-full border-collapse">

        {/* HEADER */}
        <thead className="bg-gray-200">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="p-3 border text-left">
                {col}
              </th>
            ))}
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center p-4 text-gray-500"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                className="hover:bg-gray-50 transition"
              >
                {Object.values(row).map((cell, j) => (
                  <td key={j} className="p-3 border">
                    {cell}
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