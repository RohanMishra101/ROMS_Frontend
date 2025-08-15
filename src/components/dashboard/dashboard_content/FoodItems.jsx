import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle, FaPlus } from "react-icons/fa";

export default function FoodItems() {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    availability: true,
    imageURL: ""
  });

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get("http://localhost:3000/api/food", { headers });
      setFoodItems(res.data);
    } catch (err) {
      console.error("Failed to fetch food items:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setCurrentItem(item);
      setFormData({
        name: item.name,
        category: item.category || "",
        description: item.description || "",
        price: item.price,
        availability: item.availability,
        imageURL: item.imageURL || ""
      });
    } else {
      setCurrentItem(null);
      setFormData({
        name: "",
        category: "",
        description: "",
        price: "",
        availability: true,
        imageURL: ""
      });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (currentItem) {
        await axios.put(`http://localhost:3000/api/food/${currentItem._id}`, formData, { headers });
      } else {
        await axios.post("http://localhost:3000/api/food", formData, { headers });
      }

      setModalOpen(false);
      fetchFoodItems();
    } catch (err) {
      console.error("Error saving food item:", err);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`http://localhost:3000/api/food/${currentItem._id}`, { headers });
      setDeleteConfirmOpen(false);
      fetchFoodItems();
    } catch (err) {
      console.error("Error deleting food item:", err);
    }
  };

  const availabilityColors = {
    true: "bg-green-100 text-green-800",
    false: "bg-red-100 text-red-800",
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Food Items</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          <FaPlus /> Add Item
        </button>
      </div>

      {foodItems.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-500">No food items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {foodItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {item.imageURL ? (
                <img
                  src={item.imageURL}
                  alt={item.name}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                  No Image
                </div>
              )}

              <div className="p-4 flex flex-col justify-between h-full">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3>
                  {item.category && (
                    <p className="text-xs text-gray-500 mb-1">
                      {item.category}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <p className="font-bold text-gray-800">
                    ${item.price.toFixed(2)}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      availabilityColors[item.availability]
                    }`}
                  >
                    {item.availability ? "Available" : "Unavailable"}
                  </span>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-3 text-white bg-green-500 hover:bg-green-600 rounded-full text-sm"
                  >
                    <FaCheckCircle /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setCurrentItem(item);
                      setDeleteConfirmOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-3 text-white bg-red-500 hover:bg-red-600 rounded-full text-sm"
                  >
                    <FaTimesCircle /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {currentItem ? "Edit Food Item" : "Add Food Item"}
            </h2>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="border p-2 rounded"
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={formData.imageURL}
                onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })}
                className="border p-2 rounded"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                />
                Available
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg mb-4">
              Are you sure you want to delete "{currentItem?.name}"?
            </h2>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
