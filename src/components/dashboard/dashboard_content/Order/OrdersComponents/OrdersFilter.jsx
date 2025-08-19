import { FiFilter } from "react-icons/fi";

export default function OrdersFilter({ statusFilter, setStatusFilter }) {
  return (
    <div className="flex items-center gap-3">
      <FiFilter className="text-gray-500" />
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="rounded-lg border border-gray-300 py-2 px-4 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      >
        <option value="all">All Orders</option>
        <option value="pending">Pending</option>
        <option value="preparing">Preparing</option>
        <option value="served">Served</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
}
