import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiFilter, FiX, FiSearch } from "react-icons/fi";
import axios from "axios";
import ProductCard from "../components/ProductCard";

const categories = [
  { id: "all", label: "All Products" },
  { id: "grains", label: "Grains & Cereals" },
  { id: "spices", label: "Spices & Masalas" },
  { id: "organic", label: "Organic Products" },
  { id: "dairy", label: "Dairy & Ghee" },
  { id: "snacks", label: "Snacks & Dry Fruits" },
  { id: "oils", label: "Cooking Oils" },
  { id: "beverages", label: "Beverages" },
];

const Products = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== "all") params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      const { data } = await axios.get("/api/products", { params });
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Prevent body scroll when filter open
  useEffect(() => {
    if (window.innerWidth < 1024) {
      document.body.style.overflow = showFilter ? "hidden" : "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showFilter]);

  const activeFilters = selectedCategory !== "all" ? [selectedCategory] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-brown">
            All Products
          </h1>
          {/* <p className="text-brown/60 text-sm mt-1">
            {products.length} products
          </p> */}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brown/40"
            size={16}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-wheat bg-white text-sm text-brown placeholder-brown/40 focus:outline-none focus:border-olive"
          />
        </div>
      </div>

      {/* Active Filters + Mobile Filter Button */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setShowFilter(true)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 bg-olive text-ivory rounded-xl text-sm font-medium active:scale-95 transition-transform"
        >
          <FiFilter size={14} /> Filters
        </button>
        {activeFilters.map((f) => (
          <span
            key={f}
            className="flex items-center gap-1 bg-olive/10 text-olive px-3 py-1.5 rounded-full text-xs font-medium capitalize"
          >
            {f}
            <button onClick={() => setSelectedCategory("all")}>
              <FiX size={12} />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-white rounded-xl p-4 shadow-sm sticky top-24">
            <h3 className="font-display font-semibold text-brown mb-3">
              Categories
            </h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-olive text-ivory font-medium"
                      : "text-brown hover:bg-wheat/50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {showFilter && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
              onClick={() => setShowFilter(false)}
            />
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 p-5 animate-slideIn lg:hidden max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-brown text-lg">
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilter(false)}
                  className="w-8 h-8 rounded-full bg-wheat flex items-center justify-center"
                >
                  <FiX size={18} />
                </button>
              </div>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setShowFilter(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-olive text-ivory font-medium"
                        : "text-brown hover:bg-wheat/50"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl h-56 sm:h-64 md:h-72 animate-pulse"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <p className="text-brown/50 text-base sm:text-lg mb-4">
                No products found
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="text-olive font-medium hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
