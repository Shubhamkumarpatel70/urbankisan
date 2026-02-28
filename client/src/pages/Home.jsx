import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiStar, FiTruck, FiShield, FiSun } from "react-icons/fi";
import axios from "axios";
import ProductCard from "../components/ProductCard";

const categories = [
  { id: "grains", label: "Grains", icon: "🌾" },
  { id: "spices", label: "Spices", icon: "🌶️" },
  { id: "organic", label: "Organic", icon: "🌿" },
  { id: "dairy", label: "Dairy", icon: "🥛" },
  { id: "snacks", label: "Snacks", icon: "🥜" },
  { id: "oils", label: "Oils", icon: "🫒" },
];

const testimonials = [
  {
    name: "Priya Sharma",
    text: "The quality of spices is unmatched! My kitchen has never smelled this good. The turmeric and garam masala are simply outstanding.",
    rating: 5,
    location: "Delhi",
  },
  {
    name: "Rajesh Kumar",
    text: "Fresh organic products delivered right to my doorstep. The basmati rice quality is just like what we used to get from farms directly.",
    rating: 5,
    location: "Mumbai",
  },
  {
    name: "Anita Desai",
    text: "Love the A2 ghee and cold-pressed oils. You can really taste the difference with these pure, unadulterated products.",
    rating: 5,
    location: "Bangalore",
  },
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured products
        const { data: featured } = await axios.get("/api/products", {
          params: { featured: "true" },
        });
        setFeaturedProducts(featured);

        // Fetch all active products to get category counts
        const { data: allProducts } = await axios.get("/api/products");
        const counts = {};
        allProducts.forEach((p) => {
          counts[p.category] = (counts[p.category] || 0) + 1;
        });
        setCategoryCounts(counts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-olive/10 to-gold/10 py-12 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-brown leading-tight mb-4">
              Fresh from the
              <span className="text-olive"> Farm</span> to
              <span className="text-gold"> Your Table</span>
            </h1>
            <p className="text-brown/70 text-base sm:text-lg mb-6 max-w-lg mx-auto md:mx-0">
              Discover authentic, organic Indian produce sourced directly from
              local farmers. Pure quality, honest prices.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link to="/products" className="btn-primary text-center">
                Shop Now →
              </Link>
              <Link
                to="/products?category=organic"
                className="px-6 py-3 border-2 border-olive text-olive rounded-xl font-medium hover:bg-olive hover:text-ivory transition-colors text-center"
              >
                Explore Organic
              </Link>
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600"
              alt="Fresh produce"
              className="rounded-2xl shadow-xl w-full object-cover h-64 sm:h-80"
            />
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-y border-wheat">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-3 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <FiTruck className="text-olive" size={24} />
            <div>
              <p className="font-medium text-brown text-sm">Free Delivery</p>
              <p className="text-xs text-brown/50 hidden sm:block">
                Orders above ₹499
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <FiShield className="text-olive" size={24} />
            <div>
              <p className="font-medium text-brown text-sm">100% Genuine</p>
              <p className="text-xs text-brown/50 hidden sm:block">
                Quality assured products
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <FiSun className="text-olive" size={24} />
            <div>
              <p className="font-medium text-brown text-sm">Farm Fresh</p>
              <p className="text-xs text-brown/50 hidden sm:block">
                Directly from farmers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-brown text-center mb-8">
          Shop by Category
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
          {categories.filter((cat) => categoryCounts[cat.id] > 0).map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 text-center group"
            >
              <span className="text-2xl sm:text-3xl block mb-2">
                {cat.icon}
              </span>
              <p className="text-sm font-medium text-brown group-hover:text-olive transition-colors">
                {cat.label}
              </p>
              {categoryCounts[cat.id] > 0 && (
                <p className="text-xs text-brown/50 mt-1">
                  {categoryCounts[cat.id]} product{categoryCounts[cat.id] !== 1 ? "s" : ""}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16 bg-ivory">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-brown">
            Featured Products
          </h2>
          <Link
            to="/products"
            className="text-olive font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all"
          >
            View All <FiArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl h-56 sm:h-64 md:h-72 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-brown text-center mb-8">
          What Our Customers Say
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white rounded-xl p-5 sm:p-6 shadow-sm">
              <div className="flex gap-1 mb-3">
                {[...Array(t.rating)].map((_, i) => (
                  <FiStar
                    key={i}
                    size={14}
                    className="text-gold fill-current"
                  />
                ))}
              </div>
              <p className="text-brown/70 text-sm leading-relaxed mb-4">
                "{t.text}"
              </p>
              <div>
                <p className="font-medium text-brown text-sm">{t.name}</p>
                <p className="text-xs text-brown/50">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
