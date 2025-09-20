const handleSave = async (formData) => {
  try {
    const token = sessionStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    const BASE_FOOD_API = import.meta.env.VITE_API_FOOD_URL || "http://localhost:3000/api/food";
    // convert to FormData for file upload
    const data = new FormData();
    data.append("name", formData.name);
    data.append("category", formData.category);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("availability", formData.availability);
    if (formData.image) {
      data.append("image", formData.image); // <-- file upload
    }

    if (currentItem) {
      await axios.put(
        `${BASE_FOOD_API}/${currentItem._id}`,
        data,
        { headers: { ...headers, "Content-Type": "multipart/form-data" } }
      );
    } else {
      await axios.post(`${BASE_FOOD_API}`, data, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
    }

    setModalOpen(false);
    setCurrentItem(null);
    fetchFoodItems();
  } catch (err) {
    console.error("Error saving food item:", err);
  }
};
