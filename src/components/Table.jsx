const Table = ({ columns, children }) => {
  return (
    <div className="bg-white dark:bg-[#2A1F16] rounded-2xl shadow-sm border border-[#EDE6DA] dark:border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F6F2EC] dark:bg-white/5 text-left text-[#8A7C68] dark:text-[#A99A82] uppercase text-xs tracking-wide">
              {columns.map((col) => (
                <th key={col} className="px-5 py-3 font-medium whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0EAE0] dark:divide-white/10">{children}</tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;