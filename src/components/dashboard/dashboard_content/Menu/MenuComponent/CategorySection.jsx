import React from "react";
import FoodItemCard from "./FoodItemCard";

export default function CategorySection({ category, items, tableNumber, refreshOrders }) {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">{category}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(item => (
          <FoodItemCard
            key={item._id}
            item={item}
            tableNumber={tableNumber}
            refreshOrders={refreshOrders}
          />
        ))}
      </div>
    </div>
  );
}
