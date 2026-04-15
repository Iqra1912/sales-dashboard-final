import { useMemo, useState } from "react";
import { FiDownload, FiFilter, FiSearch } from "react-icons/fi";

const MOCK_DEALS = [
  {
    id: "DL-1024",
    customer: "Ava Richardson",
    email: "ava.r@northwind.io",
    product: "Enterprise Analytics",
    value: 12400,
    closeDate: "2026-04-02",
    avatar: "AR",
  },
  {
    id: "DL-1023",
    customer: "Marcus Chen",
    email: "marcus.c@pixel.co",
    product: "Inventory Sync",
    value: 8200,
    closeDate: "2026-04-01",
    avatar: "MC",
  },
  {
    id: "DL-1022",
    customer: "Sofia Patel",
    email: "sofia@loomtrade.com",
    product: "API Add-on",
    value: 3100,
    closeDate: "2026-03-28",
    avatar: "SP",
  },
  {
    id: "DL-1021",
    customer: "James Wilson",
    email: "j.wilson@acme.org",
    product: "Support Plus",
    value: 5600,
    closeDate: "2026-03-25",
    avatar: "JW",
  },
  {
    id: "DL-1020",
    customer: "Elena Rossi",
    email: "elena.r@studio.it",
    product: "Creative Suite",
    value: 9800,
    closeDate: "2026-03-22",
    avatar: "ER",
  },
];

function formatMoney(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function SalesDealsTable({ searchQuery: controlledQuery, onSearchChange } = {}) {
  const [internalQuery, setInternalQuery] = useState("");
  const searchControlled = controlledQuery !== undefined;
  const query = searchControlled ? controlledQuery : internalQuery;
  const setQuery = searchControlled && onSearchChange ? onSearchChange : setInternalQuery;
  const [selected, setSelected] = useState(() => new Set());
  const [filterOpen, setFilterOpen] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_DEALS;
    return MOCK_DEALS.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.product.toLowerCase().includes(q)
    );
  }, [query]);

  const toggleRow = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === rows.length) setSelected(new Set());
    else setSelected(new Set(rows.map((r) => r.id)));
  };

  const exportCsv = () => {
    const header = ["ID Deal", "Customer Name", "Customer Email", "Product/Service", "Deal Value", "Close Date"];
    const lines = rows.map((r) =>
      [r.id, r.customer, r.email, r.product, r.value, r.closeDate].map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sales-deals.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-slate-900">Sales deals</h2>
        <div className="flex flex-wrap items-center gap-2">
          {!searchControlled && (
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search deals..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none ring-blue-500/0 transition-shadow focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/15"
              />
            </div>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <FiFilter className="h-4 w-4" />
              Filter
            </button>
            {filterOpen && (
              <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                <p className="text-xs font-medium text-slate-500">Quick filters</p>
                <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300" />
                  Open deals
                </label>
                <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" className="rounded border-slate-300" />
                  High value (&gt;$8k)
                </label>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <FiDownload className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="w-10 py-3 pr-2">
                <input
                  type="checkbox"
                  checked={rows.length > 0 && selected.size === rows.length}
                  onChange={toggleAll}
                  className="rounded border-slate-300"
                  aria-label="Select all"
                />
              </th>
              <th className="py-3 pr-4">ID Deal</th>
              <th className="py-3 pr-4">Customer</th>
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">Product / Service</th>
              <th className="py-3 pr-4">Deal value</th>
              <th className="py-3">Close date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id} className="text-slate-700 hover:bg-slate-50/80">
                <td className="py-3 pr-2">
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => toggleRow(r.id)}
                    className="rounded border-slate-300"
                    aria-label={`Select ${r.id}`}
                  />
                </td>
                <td className="py-3 pr-4 font-mono text-xs font-medium text-slate-600">{r.id}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                      {r.avatar}
                    </div>
                    <span className="font-medium text-slate-900">{r.customer}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-slate-500">{r.email}</td>
                <td className="py-3 pr-4">{r.product}</td>
                <td className="py-3 pr-4 font-semibold text-slate-900">{formatMoney(r.value)}</td>
                <td className="py-3 text-slate-500">{r.closeDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500">No deals match your search.</p>
      )}
    </div>
  );
}
