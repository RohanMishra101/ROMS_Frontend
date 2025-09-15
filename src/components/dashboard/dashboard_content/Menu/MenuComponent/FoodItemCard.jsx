// FoodItemCard.jsx
import React from "react";
import { FiPlus, FiMinus } from "react-icons/fi";

export default function FoodItemCard({ item, addToCart, cartQuantity, updateQuantity }) {
  return (
    <div className="border rounded-xl shadow-sm hover:shadow-md transition bg-white overflow-hidden flex flex-col h-full">
      {/* Image */}
      
      <div className="relative h-40 w-full bg-gray-100">
        {item.imageURL ? (
          <img
            src={item.imageURL}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400 bg-gray-200">
            No Image
          </div>
        )}

        {/* Category Badge */}
        {item.category && (
          <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
            {item.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {item.description || "Delicious meal to enjoy."}
          </p>
        </div>

        {/* Price + Quantity Controls */}
        <div className="flex justify-between items-center">
          <p className="text-base font-bold">Rs. {item.price.toFixed(2)}</p>
          
          {cartQuantity > 0 ? (
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
              <button
                onClick={() => updateQuantity(item._id, cartQuantity - 1)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <FiMinus size={16} />
              </button>
              <span className="text-sm font-medium">{cartQuantity}</span>
              <button
                onClick={() => updateQuantity(item._id, cartQuantity + 1)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <FiPlus size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(item, 1)}
              className="flex items-center gap-1 bg-black text-white px-3 py-2 rounded-lg hover:bg-gray-800 text-sm"
            >
              <FiPlus size={16} /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}