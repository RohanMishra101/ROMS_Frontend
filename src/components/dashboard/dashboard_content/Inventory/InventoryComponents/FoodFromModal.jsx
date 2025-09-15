import { useState, useEffect } from "react";

const EMPTY = {
  name: "",
  category: "",
  description: "",
  price: "",
  availability: true,
  image: null,
};

export default function FoodFormModal({ item, onClose, onSave }) {
  const [formData, setFormData] = useState(EMPTY);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        category: item.category || "",
        description: item.description || "",
        price: item.price ?? "",
        availability: Boolean(item.availability),
        image: null,
      });
      setPreview(item.imageURL || null);
    } else {
      setFormData(EMPTY);
      setPreview(null);
    }
  }, [item]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setFormData((p) => ({ ...p, image: file }));
    if (file) setPreview(URL.createObjectURL(file));
  };

  const saveDisabled =
    !formData.name.trim() || formData.price === "" || Number(formData.price) < 0;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {item ? "Edit Food Item" : "Add Food Item"}
        </h2>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) =>
              setFormData((p) => ({ ...p, name: e.target.value }))
            }
            className="border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) =>
              setFormData((p) => ({ ...p, category: e.target.value }))
            }
            className="border p-2 rounded"
          />

          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData((p) => ({ ...p, description: e.target.value }))
            }
            className="border p-2 rounded"
          />

          <input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) =>
              setFormData((p) => ({ ...p, price: e.target.value }))
            }
            className="border p-2 rounded"
          />

          {/* Preview */}
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="w-full h-40 object-cover rounded"
            />
          ) : null}

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="border p-2 rounded"
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.availability}
              onChange={(e) =>
                setFormData((p) => ({ ...p, availability: e.target.checked }))
              }
            />
            Available
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
            Cancel
          </button>
          <button
            disabled={saveDisabled}
            onClick={() => onSave(formData)}
            className={`px-4 py-2 text-white rounded ${
              saveDisabled ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
