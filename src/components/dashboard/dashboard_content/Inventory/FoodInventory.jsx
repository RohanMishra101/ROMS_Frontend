import { useState, useEffect } from "react";
import axios from "axios";
import FoodFormModal from "./InventoryComponents/FoodFromModal";
import FoodCard from "./InventoryComponents/FoodCard";
import ConfirmModal from "./InventoryComponents/ConfirmModal";
import { FaPlus } from "react-icons/fa";

const BASE_FOOD_API =
  import.meta.env.VITE_API_FOOD_URL || "http://localhost:3000/api/food";

export default function FoodInventory() {
  const [foodItems, setFoodItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const authHeaders = () => {
    const token = sessionStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(BASE_FOOD_API, { headers: authHeaders() });
      setFoodItems(data);
    } catch (err) {
      console.error("Error fetching food items:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (form) => {
    try {
      const data = new FormData();
      data.append("name", form.name);
      if (form.category) data.append("category", form.category);
      if (form.description) data.append("description", form.description);
      data.append("price", String(form.price));
      data.append("availability", form.availability ? "true" : "");
      if (form.image) data.append("image", form.image);

      if (currentItem?._id) {
        await axios.put(`${BASE_FOOD_API}/${currentItem._id}`, data, {
          headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(`${BASE_FOOD_API}/addFood`, data, {
          headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
        });
      }

      setModalOpen(false);
      setCurrentItem(null);
      fetchFoodItems();
    } catch (err) {
      console.error("Error saving food item:", err);
      alert(err?.response?.data?.message || "Save failed");
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDelete({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${BASE_FOOD_API}/${confirmDelete.id}`, { headers: authHeaders() });
      setConfirmDelete({ open: false, id: null });
      fetchFoodItems();
    } catch (err) {
      console.error("Error deleting food item:", err);
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete({ open: false, id: null });
  };

  useEffect(() => {
    fetchFoodItems();
  }, []);

  return (
    <div className="p-3 sm:p-4 md:p-6 min-h-full">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Food Inventory</h1>
        <button
          onClick={() => { setCurrentItem(null); setModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 w-full sm:w-auto"
        >
          <FaPlus /> Add Item
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : foodItems.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600">
          No food items found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {foodItems.map((item) => (
            <FoodCard
              key={item._id}
              item={item}
              onEdit={() => { setCurrentItem(item); setModalOpen(true); }}
              onDelete={() => handleDeleteClick(item._id)}
            />
          ))}
        </div>
      )}

      {/* Modal for Add/Edit */}
      {modalOpen && (
        <FoodFormModal
          item={currentItem}
          onClose={() => { setModalOpen(false); setCurrentItem(null); }}
          onSave={handleSave}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={confirmDelete.open}
        title="Delete Food Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
