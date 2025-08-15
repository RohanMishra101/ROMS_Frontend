import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";

export default function CustomerMenu() {
  const { tableId } = useParams();
  const [socket, setSocket] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Connect to Socket.IO
    const newSocket = io("http://localhost:3000");
    newSocket.emit("joinTable", tableId);
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [tableId]);

  useEffect(() => {
    // Fetch menu items
    axios.get("http://localhost:3000/food-items")
      .then((res) => setMenuItems(res.data))
      .catch(console.error);
  }, []);

  const addToCart = (item) => {
    setCart((prev) => {
      const exist = prev.find(i => i._id === item._id);
      if (exist) {
        return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i._id !== itemId));
  };

  const placeOrder = () => {
    if (!socket || cart.length === 0) return;

    const order = {
      tableId,
      items: cart.map(({ _id, name, price, quantity }) => ({ _id, name, price, quantity })),
      totalAmount: cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
      status: "In Progress",
      createdAt: new Date(),
    };

    socket.emit("placeOrder", order); // emit to backend / admin
    setCart([]); // clear cart
    alert("Order placed!");
  };

  // Group items by category
  const categories = [...new Set(menuItems.map(i => i.category))];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Table {tableId} Menu</h1>

      {categories.map((cat) => (
        <div key={cat} className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{cat}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {menuItems
              .filter((i) => i.category === cat && i.availability)
              .map((item) => (
                <div key={item._id} className="p-4 bg-white rounded shadow">
                  <h3 className="font-bold">{item.name}</h3>
                  <p>${item.price}</p>
                  <button
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
                    onClick={() => addToCart(item)}
                  >
                    Add
                  </button>
                </div>
              ))}
          </div>
        </div>
      ))}

      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 p-4 bg-white rounded shadow w-80">
          <h3 className="font-bold mb-2">Cart</h3>
          {cart.map((i) => (
            <div key={i._id} className="flex justify-between mb-1">
              <span>{i.name} x {i.quantity}</span>
              <button onClick={() => removeFromCart(i._id)} className="text-red-500">Remove</button>
            </div>
          ))}
          <p className="mt-2 font-bold">Total: ${cart.reduce((sum, i) => sum + i.price * i.quantity, 0)}</p>
          <button
            onClick={placeOrder}
            className="mt-2 w-full bg-green-500 text-white px-3 py-1 rounded"
          >
            Place Order
          </button>
        </div>
      )}
    </div>
  );
}
