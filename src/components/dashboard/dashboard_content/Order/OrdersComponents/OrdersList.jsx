import OrderCard from "./OrdersCard";

export default function OrdersList({ title, orders, badgeColor, showActions, updatingOrderId, onUpdate }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <span className={`${badgeColor} text-xs px-3 py-1 rounded-full`}>
            {orders.length} orders
          </span>
        </div>
      </div>
      {orders.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">No orders found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              showActions={showActions}
              updatingOrderId={updatingOrderId}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
