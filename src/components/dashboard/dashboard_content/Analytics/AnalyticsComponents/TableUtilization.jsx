import React from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

const TableUtilizationCard = ({ data = [], title = "Table Utilization" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm h-64 flex flex-col items-center justify-center">
        <div className="text-5xl mb-3">🍽️</div>
        <p className="text-gray-500 font-medium">No table data available</p>
      </div>
    );
  }

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm w-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <span className="text-sm text-gray-500">Total Tables: {data.length}</span>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Pie Chart */}
        <div className="w-full lg:w-2/3 h-[300px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="ordersCount"     // ✅ backend key
                nameKey="tableNumber"     // ✅ backend key
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name} (${value})`}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  `${value} orders (${props.payload.utilizationPercent}%)`,
                  `Table ${props.payload.tableNumber}`,
                ]}
                contentStyle={{
                  borderRadius: "8px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  border: "none",
                  fontSize: "14px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend List */}
        <div className="w-full lg:w-1/3 flex flex-col gap-3">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <span className="text-gray-700 font-medium">
                {entry.tableNumber}: {entry.ordersCount} orders (
                {entry.utilizationPercent}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableUtilizationCard;
