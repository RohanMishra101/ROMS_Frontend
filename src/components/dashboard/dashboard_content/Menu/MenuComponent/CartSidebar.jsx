// CartSidebar.jsx
import { useEffect } from "react";
import { FiPlus, FiMinus, FiX, FiShoppingCart } from "react-icons/fi";

export default function CartSidebar({
  cartItems,
  isOpen,
  toggleCart,
  confirmOrder,
  updateQuantity,
  setIsCartOpen, // 👈 add this prop so parent can control default open
}) {
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ✅ Open sidebar by default on large screens
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) {
        setIsCartOpen(true);
      }
    }
  }, [setIsCartOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleCart}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-[70px] bottom-0 right-0 w-full md:w-96 bg-white shadow-lg z-50 transform transition-transform duration-300 flex flex-col
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <div className="flex items-center">
            <FiShoppingCart size={24} className="mr-2" />
            <h2 className="text-xl font-semibold">Your Orders</h2>
            {cartItems.length > 0 && (
              <span className="ml-2 bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            )}
          </div>
          <button
            onClick={toggleCart}
            className="p-1 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 p-4 overflow-y-auto min-h-0">
          {cartItems.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <FiShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
              <p>Your Order is empty</p>
              <p className="text-sm mt-1">
                Add items from the menu to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center border rounded-lg p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Rs. {item.price.toFixed(2)} × {item.quantity} = Rs.{" "}
                      {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity - 1)
                      }
                      className="p-1 border rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    >
                      <FiMinus size={16} />
                    </button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity + 1)
                      }
                      className="p-1 border rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    >
                      <FiPlus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t bg-gray-50 flex-shrink-0">
            <div className="flex justify-between items-center mb-3">
              <p className="text-lg font-bold">Total Amount:</p>
              <p className="text-lg font-bold">
                Rs. {totalAmount.toFixed(2)}
              </p>
            </div>
            <button
              onClick={confirmOrder}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 active:bg-gray-900 active:scale-[0.98] transition-all duration-150 font-medium shadow-md hover:shadow-lg"
            >
              Confirm Order
            </button>
          </div>
        )}
      </div>
    </>
  );
}
