import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiStar, FiHeart, FiCheck } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "./Toast";

// Default weight options for solid products (grams/kg)
const defaultSolidWeights = [
  { label: "500 g", value: "500g", multiplier: 0.5 },
  { label: "1 kg", value: "1kg", multiplier: 1 },
  { label: "2 kg", value: "2kg", multiplier: 2 },
];

// Default weight options for liquid products (ml/L)
const defaultLiquidWeights = [
  { label: "500 ml", value: "500ml", multiplier: 0.5 },
  { label: "1 L", value: "1L", multiplier: 1 },
  { label: "2 L", value: "2L", multiplier: 2 },
];

// Parse weight value to get multiplier
const parseWeightMultiplier = (weightStr) => {
  if (!weightStr) return 1;
  const str = weightStr.toLowerCase();
  const num = parseFloat(str);
  if (isNaN(num)) return 1;
  if (str.includes("kg") || str.includes("l")) return num;
  if (str.includes("g") || str.includes("ml")) return num / 1000;
  return num;
};

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [justAdded, setJustAdded] = useState(false);
  const [showWeightSelector, setShowWeightSelector] = useState(false);

  // Determine if product is liquid based on category
  const isLiquid = ["oils", "beverages"].includes(product.category);

  // Get weight options - use product's weightOptions if available, otherwise defaults
  const weightOptions = useMemo(() => {
    if (product.weightOptions && product.weightOptions.length > 0) {
      return product.weightOptions.map((w) => ({
        label: w.replace(/(\d+)(g|kg|ml|l)/i, (_, num, unit) => `${num} ${unit.toUpperCase()}`),
        value: w,
        multiplier: parseWeightMultiplier(w),
      }));
    }
    return isLiquid ? defaultLiquidWeights : defaultSolidWeights;
  }, [product.weightOptions, isLiquid]);

  const [selectedWeight, setSelectedWeight] = useState(() => {
    // Find the 1kg/1L option or first option
    return weightOptions.find((w) => w.multiplier === 1) || weightOptions[0];
  });

  const wishlisted = isInWishlist(product._id);
  const inCart = isInCart(product._id);

  // Calculate price based on weight
  const basePrice = product.price;
  const pricePerUnit = basePrice; // Price shown is per kg/L
  const calculatedPrice = Math.round(pricePerUnit * selectedWeight.multiplier);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (inCart) {
      navigate("/cart");
      return;
    }

    // Add product with selected weight info
    const productWithWeight = {
      ...product,
      selectedWeight: selectedWeight.label,
      price: calculatedPrice,
    };
    addToCart(productWithWeight);
    setJustAdded(true);
    addToast(`${product.name} (${selectedWeight.label}) added to cart`, "success");
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleWeightClick = (e, weight) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedWeight(weight);
  };

  const toggleWeightSelector = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowWeightSelector(!showWeightSelector);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product);
    addToast(
      added ? `${product.name} added to wishlist` : `Removed from wishlist`,
      added ? "success" : "info",
    );
  };

  return (
    <Link to={`/product/${product._id}`} className="card group">
      <div className="relative overflow-hidden">
        <div className="h-40 xs:h-48 sm:h-56 bg-wheat flex items-center justify-center">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/300x200?text=Product+Image";
            }}
          />
        </div>
        {product.isFeatured && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-gold text-brown text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
            Featured
          </span>
        )}
        {/* Wishlist Heart */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
            wishlisted
              ? "bg-red-500 text-white shadow-md"
              : "bg-white/80 backdrop-blur-sm text-brown/60 hover:text-red-500 shadow-sm"
          }`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <FiHeart
            size={14}
            className={`sm:w-4 sm:h-4 ${wishlisted ? "fill-current" : ""}`}
          />
        </button>
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <span className="text-[10px] sm:text-xs font-medium text-olive uppercase tracking-wide truncate mr-2">
            {product.category}
          </span>
          {product.numReviews > 0 && (
            <div className="flex items-center space-x-0.5 sm:space-x-1 flex-shrink-0">
              <FiStar className="text-gold fill-current w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="text-[10px] sm:text-xs text-brown">
                {product.rating || 0}
              </span>
            </div>
          )}
        </div>

        <h3 className="font-display text-sm sm:text-base md:text-lg font-semibold text-brown mb-1 group-hover:text-olive transition-colors line-clamp-1">
          {product.name}
        </h3>

        <p className="text-xs sm:text-sm text-brown/70 mb-2 sm:mb-3 line-clamp-2 hidden xs:block">
          {product.description}
        </p>

        {/* Weight Selector */}
        <div className="mb-2 sm:mb-3">
          <button
            onClick={toggleWeightSelector}
            className="text-[10px] sm:text-xs text-brown/70 hover:text-olive transition-colors flex items-center gap-1"
          >
            <span className="font-medium text-brown">Qty:</span> {selectedWeight.label}
            <svg className={`w-3 h-3 transition-transform ${showWeightSelector ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showWeightSelector && (
            <div className="mt-2 grid grid-cols-3 gap-1">
              {weightOptions.map((weight) => (
                <button
                  key={weight.label}
                  onClick={(e) => handleWeightClick(e, weight)}
                  className={`px-1.5 py-1 text-[9px] sm:text-[10px] rounded-md transition-all ${
                    selectedWeight.value === weight.value
                      ? "bg-brown text-ivory font-medium"
                      : "bg-wheat/60 text-brown/70 hover:bg-wheat"
                  }`}
                >
                  {weight.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-base sm:text-lg md:text-xl font-bold text-olive">
              ₹{calculatedPrice}
            </span>
            <span className="text-[10px] sm:text-xs text-brown/60 ml-0.5 sm:ml-1 hidden xs:inline">
              / {selectedWeight.label}
            </span>
            <p className="text-[9px] sm:text-[10px] text-brown/50">
              (₹{pricePerUnit}/{isLiquid ? "L" : "kg"})
            </p>
          </div>

          <button
            onClick={handleAddToCart}
            className={`p-2 sm:p-2.5 rounded-lg transition-all duration-300 active:scale-90 flex-shrink-0 ${
              inCart || justAdded
                ? "bg-gold text-brown"
                : "bg-olive text-ivory hover:bg-opacity-90"
            }`}
            aria-label={inCart ? "Go to cart" : "Add to cart"}
            title={inCart ? "Go to Cart" : "Add to Cart"}
          >
            {inCart || justAdded ? (
              <FiCheck className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            ) : (
              <FiShoppingCart className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            )}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
