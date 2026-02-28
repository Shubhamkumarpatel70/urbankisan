import { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiStar,
  FiCheck,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import axios from "axios";
import { useToast } from "../../components/Toast";

const categories = [
  "grains",
  "spices",
  "organic",
  "dairy",
  "snacks",
  "oils",
  "beverages",
];

// Weight options based on category type
const weightOptionsByType = {
  solid: [
    { label: "50 g", value: "50g" },
    { label: "100 g", value: "100g" },
    { label: "200 g", value: "200g" },
    { label: "250 g", value: "250g" },
    { label: "500 g", value: "500g" },
    { label: "1 kg", value: "1kg" },
    { label: "2 kg", value: "2kg" },
    { label: "5 kg", value: "5kg" },
  ],
  liquid: [
    { label: "100 ml", value: "100ml" },
    { label: "200 ml", value: "200ml" },
    { label: "500 ml", value: "500ml" },
    { label: "1 L", value: "1L" },
    { label: "2 L", value: "2L" },
    { label: "5 L", value: "5L" },
  ],
};

// Map categories to weight types
const categoryWeightType = {
  grains: "solid",
  spices: "solid",
  organic: "solid",
  dairy: "solid",
  snacks: "solid",
  oils: "liquid",
  beverages: "liquid",
};

const AdminProducts = () => {
  const { addToast } = useToast();
  const [uploading, setUploading] = useState(false);

  // Handle main image upload
  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formDataObj = new FormData();
    formDataObj.append("image", file);
    setUploading(true);
    try {
      const { data } = await axios.post("/api/products/upload", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((prev) => ({ ...prev, image: data.url }));
    } catch (err) {
      addToast("Image upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  // Handle additional image upload
  const handleAdditionalImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formDataObj = new FormData();
    formDataObj.append("image", file);
    setUploading(true);
    try {
      const { data } = await axios.post("/api/products/upload", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((prev) => ({ ...prev, images: [...prev.images, data.url] }));
    } catch (err) {
      addToast("Image upload failed", "error");
    } finally {
      setUploading(false);
    }
  };
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "grains",
    stock: "",
    weight: "",
    weightOptions: [],
    image: "",
    images: [],
    isFeatured: false,
    isActive: true,
  });
  const [newImageUrl, setNewImageUrl] = useState("");

  // Get available weight options based on selected category
  const getWeightOptions = (category) => {
    const type = categoryWeightType[category] || "solid";
    return weightOptionsByType[type];
  };

  const toggleWeightOption = (weightValue) => {
    setFormData((prev) => {
      const currentOptions = prev.weightOptions || [];
      if (currentOptions.includes(weightValue)) {
        return {
          ...prev,
          weightOptions: currentOptions.filter((w) => w !== weightValue),
        };
      } else {
        return {
          ...prev,
          weightOptions: [...currentOptions, weightValue],
        };
      }
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Admin gets all products including inactive ones
      const { data } = await axios.get("/api/products?includeInactive=true");
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      addToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !filterCat || p.category === filterCat;
    return matchesSearch && matchesCat;
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "grains",
      stock: "",
      weight: "",
      weightOptions: [],
      image: "",
      images: [],
      isFeatured: false,
      isActive: true,
    });
    setNewImageUrl("");
    setEditingProduct(null);
    setShowForm(false);
  };

  const addImage = () => {
    if (newImageUrl.trim() && !formData.images.includes(newImageUrl.trim())) {
      setFormData({
        ...formData,
        images: [...formData.images, newImageUrl.trim()],
      });
      setNewImageUrl("");
    }
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      weight: product.weight,
      weightOptions: product.weightOptions || [],
      image: product.image,
      images: product.images || [],
      isFeatured: product.isFeatured,
      isActive: product.isActive !== false,
    });
    setNewImageUrl("");
    setEditingProduct(product._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      addToast("Product deleted", "success");
    } catch (error) {
      addToast("Failed to delete product", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.description) {
      addToast("Name, description and price are required", "error");
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock) || 0,
    };

    try {
      if (editingProduct) {
        const { data } = await axios.put(
          `/api/products/${editingProduct}`,
          payload,
        );
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct ? data : p)),
        );
        addToast("Product updated", "success");
      } else {
        const { data } = await axios.post("/api/products", payload);
        setProducts((prev) => [data, ...prev]);
        addToast("Product added", "success");
      }
      resetForm();
    } catch (error) {
      addToast(
        error.response?.data?.message || "Failed to save product",
        "error",
      );
    }
  };

  const toggleFeatured = async (product) => {
    try {
      const { data } = await axios.put(`/api/products/${product._id}`, {
        isFeatured: !product.isFeatured,
      });
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? data : p)),
      );
    } catch (error) {
      addToast("Failed to update", "error");
    }
  };

  const toggleActive = async (product) => {
    try {
      const { data } = await axios.put(`/api/products/${product._id}`, {
        isActive: !product.isActive,
      });
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? data : p)),
      );
      addToast(
        data.isActive ? "Product is now visible" : "Product is now hidden",
        "success",
      );
    } catch (error) {
      addToast("Failed to update", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-brown">
          Manage Products
        </h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 bg-gold text-brown px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-gold/90 transition-colors active:scale-95"
        >
          <FiPlus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brown/40"
            size={16}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-wheat bg-white text-sm text-brown placeholder-brown/40 focus:outline-none focus:border-olive"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-wheat bg-white text-sm text-brown focus:outline-none focus:border-olive"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          onClick={resetForm}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl font-semibold text-brown">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={resetForm}
                className="w-8 h-8 rounded-full bg-wheat flex items-center justify-center text-brown"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input-field"
                  placeholder="e.g. Organic Basmati Rice"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brown mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="input-field min-h-[80px]"
                  placeholder="Product description..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="input-field"
                    placeholder="299"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brown mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className="input-field"
                    placeholder="50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value,
                        weightOptions: [],
                      })
                    }
                    className="input-field"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brown mb-1">
                    Default Weight
                  </label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    className="input-field"
                    placeholder="e.g. 1kg or 500ml"
                  />
                </div>
              </div>

              {/* Multiple Weight Options */}
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Available Weight Options
                  <span className="text-brown/50 font-normal ml-1">
                    (
                    {formData.category === "oils" ||
                    formData.category === "beverages"
                      ? "Liquids"
                      : "Solids"}
                    )
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {getWeightOptions(formData.category).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleWeightOption(opt.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                        formData.weightOptions?.includes(opt.value)
                          ? "bg-olive text-ivory border-olive shadow-md"
                          : "bg-wheat/30 text-brown/70 border-transparent hover:border-olive/30 hover:bg-wheat/50"
                      }`}
                    >
                      {formData.weightOptions?.includes(opt.value) && (
                        <FiCheck className="inline-block w-3 h-3 mr-1" />
                      )}
                      {opt.label}
                    </button>
                  ))}
                </div>
                {formData.weightOptions?.length > 0 && (
                  <p className="text-xs text-olive mt-2">
                    Selected: {formData.weightOptions.join(", ")}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-brown mb-1">
                  Main Image URL
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="input-field mb-2"
                  placeholder="https://..."
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageUpload}
                  className="block w-full text-sm text-brown file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-olive/10 file:text-olive hover:file:bg-olive/20"
                  disabled={uploading}
                />
                {uploading && (
                  <span className="text-xs text-brown/50 ml-2">
                    Uploading...
                  </span>
                )}
              </div>

              {/* Multiple Images */}
              <div>
                <label className="block text-sm font-medium text-brown mb-1">
                  Additional Images
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addImage())
                    }
                    className="input-field flex-1"
                    placeholder="Paste image URL and click Add"
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="px-4 py-2 bg-olive text-ivory rounded-xl text-sm font-medium hover:bg-olive/90"
                  >
                    Add
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAdditionalImageUpload}
                    className="block text-sm text-brown file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-olive/10 file:text-olive hover:file:bg-olive/20"
                    disabled={uploading}
                  />
                </div>
                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt=""
                          className="w-16 h-16 rounded-lg object-cover bg-wheat"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-brown/50 mt-1">
                  {formData.images.length} additional image(s)
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-wheat text-olive focus:ring-olive"
                  />
                  <span className="text-sm text-brown">Featured Product</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <span
                    className={`text-sm font-medium transition-colors ${
                      formData.isActive ? "text-olive" : "text-brown/60"
                    }`}
                  >
                    {formData.isActive
                      ? "Active (Visible)"
                      : "Inactive (Hidden)"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, isActive: !formData.isActive })
                    }
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 shadow-inner ${
                      formData.isActive ? "bg-olive" : "bg-brown/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center ${
                        formData.isActive ? "translate-x-7" : "translate-x-0.5"
                      }`}
                    >
                      {formData.isActive ? (
                        <FiCheck className="text-olive" size={12} />
                      ) : (
                        <FiX className="text-brown/40" size={12} />
                      )}
                    </span>
                  </button>
                </label>
              </div>
              <button type="submit" className="w-full btn-primary">
                {editingProduct ? "Update Product" : "Add Product"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-wheat/30 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-wheat bg-ivory/50">
                  <th className="text-left py-3 pl-5 text-xs font-medium text-brown/50 uppercase">
                    Product
                  </th>
                  <th className="text-left py-3 text-xs font-medium text-brown/50 uppercase">
                    Category
                  </th>
                  <th className="text-left py-3 text-xs font-medium text-brown/50 uppercase">
                    Price
                  </th>
                  <th className="text-left py-3 text-xs font-medium text-brown/50 uppercase">
                    Stock
                  </th>
                  <th className="text-left py-3 text-xs font-medium text-brown/50 uppercase">
                    Status
                  </th>
                  <th className="text-left py-3 text-xs font-medium text-brown/50 uppercase">
                    Featured
                  </th>
                  <th className="text-right py-3 pr-5 text-xs font-medium text-brown/50 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b border-wheat/50 last:border-0 hover:bg-ivory/30 transition-colors"
                  >
                    <td className="py-3 pl-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover bg-wheat"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-brown truncate max-w-[180px]">
                            {product.name}
                          </p>
                          <p className="text-xs text-brown/50">
                            {product.weight}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-xs bg-wheat px-2.5 py-1 rounded-full text-brown capitalize">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-3 text-sm font-medium text-brown">
                      ₹{product.price}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-sm font-medium ${product.stock < 20 ? "text-red-500" : "text-brown"}`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => toggleActive(product)}
                        className={`relative w-11 h-6 rounded-full transition-all duration-300 ease-in-out ${
                          product.isActive !== false
                            ? "bg-olive shadow-[0_0_8px_rgba(94,111,82,0.4)]"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ease-in-out flex items-center justify-center ${
                            product.isActive !== false
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full transition-colors ${
                              product.isActive !== false
                                ? "bg-olive"
                                : "bg-gray-400"
                            }`}
                          />
                        </span>
                      </button>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => toggleFeatured(product)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          product.isFeatured
                            ? "bg-gold text-brown shadow-[0_0_10px_rgba(193,154,73,0.5)] scale-110"
                            : "bg-wheat/60 text-brown/30 hover:bg-wheat hover:text-brown/50"
                        }`}
                      >
                        <FiStar
                          size={16}
                          className={`transition-transform ${product.isFeatured ? "fill-current" : ""}`}
                        />
                      </button>
                    </td>
                    <td className="py-3 pr-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="w-8 h-8 rounded-lg bg-olive/10 text-olive flex items-center justify-center hover:bg-olive/20 transition-colors"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <p className="text-center py-8 text-brown/50 text-sm">
            No products found
          </p>
        )}
      </div>

      <p className="text-xs text-brown/40 text-center">
        Showing {filtered.length} of {products.length} products
      </p>
    </div>
  );
};

export default AdminProducts;
