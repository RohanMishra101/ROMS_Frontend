import OrderCard from "./OrdersCard";

export default function OrdersList({ title, orders, badgeColor, showActions, updatingOrderId, onUpdate }) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">{title}</h2>
          <span className={`${badgeColor} text-xs px-2 sm:px-3 py-1 rounded-full`}>
            {orders.length} orders
          </span>
        </div>
      </div>
      {orders.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">No orders found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
