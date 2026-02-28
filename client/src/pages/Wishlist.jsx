import { Link } from "react-router-dom";
import {
  FiTrash2,
  FiShoppingCart,
  FiHeart,
  FiArrowRight,
} from "react-icons/fi";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../components/Toast";

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const handleAddToCart = (product) => {
    addToCart(product);
    addToast(`${product.name} added to cart`, "success");
  };

  const handleRemove = (product) => {
    removeFromWishlist(product._id);
    addToast(`Removed from wishlist`, "info");
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="section-padding">
        <div className="max-w-4xl mx-auto text-center py-10 sm:py-16">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-wheat rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <FiHeart className="text-brown/40 w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-brown mb-3 sm:mb-4">
            Your Wishlist is Empty
          </h2>
          <p className="text-brown/70 mb-6 sm:mb-8 text-sm sm:text-base">
            Save your favorite products here for later!
          </p>
          <Link
            to="/products"
            className="btn-primary inline-flex items-center gap-2"
          >
            Browse Products <FiArrowRight />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-brown">
              My Wishlist
            </h1>
            <p className="text-brown/70 mt-1 text-sm sm:text-base">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "item" : "items"} saved
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {wishlistItems.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl shadow-md overflow-hidden group animate-fadeIn"
            >
              {/* Image */}
              <Link to={`/product/${product._id}`}>
                <div className="relative h-36 xs:h-44 sm:h-52 bg-wheat overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>

              {/* Info */}
              <div className="p-3 sm:p-4">
                <Link to={`/product/${product._id}`}>
                  <h3 className="font-display text-sm sm:text-base md:text-lg font-semibold text-brown mb-0.5 sm:mb-1 group-hover:text-olive transition-colors truncate">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-xs sm:text-sm text-brown/60 mb-2 sm:mb-3 capitalize">
                  {product.category}
                </p>

                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-base sm:text-lg md:text-xl font-bold text-olive">
                    ₹{product.price}
                  </span>
                  <span className="text-[10px] sm:text-xs text-brown/60 hidden xs:inline">
                    / {product.weight || "500g"}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-olive text-ivory py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm hover:bg-olive/90 transition-colors active:scale-95"
                  >
                    <FiShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{" "}
                    <span className="hidden xs:inline">Add to</span> Cart
                  </button>
                  <button
                    onClick={() => handleRemove(product)}
                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-wheat text-brown/50 hover:text-red-500 hover:border-red-200 transition-colors flex-shrink-0"
                  >
                    <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
