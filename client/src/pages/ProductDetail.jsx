import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiShoppingCart,
  FiHeart,
  FiShare2,
  FiMinus,
  FiPlus,
  FiArrowLeft,
  FiStar,
  FiCheck,
  FiUser,
  FiThumbsUp,
  FiThumbsDown,
  FiMapPin,
  FiTruck,
} from "react-icons/fi";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import ShareModal from "../components/ShareModal";
import ProductCard from "../components/ProductCard";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showShare, setShowShare] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [votingReview, setVotingReview] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [checkingPincode, setCheckingPincode] = useState(false);

  // Default weight options for solid products (grams/kg)
  const defaultSolidWeights = [
    { label: "500 g", value: "500g", multiplier: 0.5 },
    { label: "1 kg", value: "1kg", multiplier: 1 },
    { label: "1.5 kg", value: "1.5kg", multiplier: 1.5 },
    { label: "3 kg", value: "3kg", multiplier: 3 },
    { label: "5 kg", value: "5kg", multiplier: 5 },
    { label: "7 kg", value: "7kg", multiplier: 7 },
  ];

  // Default weight options for liquid products (ml/L)
  const defaultLiquidWeights = [
    { label: "500 ml", value: "500ml", multiplier: 0.5 },
    { label: "1 L", value: "1L", multiplier: 1 },
    { label: "2 L", value: "2L", multiplier: 2 },
    { label: "5 L", value: "5L", multiplier: 5 },
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

  // Determine if product is liquid based on category
  const isLiquid = ["oils", "beverages"].includes(product?.category);

  // Get weight options - use product's weightOptions if available, otherwise defaults
  const weightOptions = useMemo(() => {
    if (!product) return [];
    if (product.weightOptions && product.weightOptions.length > 0) {
      return product.weightOptions.map((w) => ({
        label: w.replace(
          /(\d+)(g|kg|ml|l)/i,
          (_, num, unit) => `${num} ${unit.toUpperCase()}`,
        ),
        value: w,
        multiplier: parseWeightMultiplier(w),
      }));
    }
    return isLiquid ? defaultLiquidWeights : defaultSolidWeights;
  }, [product, isLiquid]);

  // Set default weight when product loads
  useEffect(() => {
    if (weightOptions.length > 0 && !selectedWeight) {
      // Find 1kg/1L option or use second option (usually 1kg)
      const defaultOpt =
        weightOptions.find((w) => w.multiplier === 1) ||
        weightOptions[1] ||
        weightOptions[0];
      setSelectedWeight(defaultOpt);
    }
  }, [weightOptions, selectedWeight]);

  // Calculate price based on selected weight
  const pricePerUnit = product?.price || 0;
  const calculatedPrice = selectedWeight
    ? Math.round(pricePerUnit * selectedWeight.multiplier)
    : pricePerUnit;

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    setSelectedImage(0);
    setSelectedWeight(null); // Reset weight selection when product changes
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/products/${id}`);
      setProduct(data);

      // Fetch related products by same category
      const { data: related } = await axios.get("/api/products", {
        params: { category: data.category },
      });
      setRelatedProducts(related.filter((p) => p._id !== data._id).slice(0, 4));
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const { data } = await axios.get(`/api/reviews/product/${id}`);
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleVote = async (reviewId, voteType) => {
    if (!isAuthenticated) {
      addToast("Please login to vote", "error");
      navigate("/login");
      return;
    }

    setVotingReview(reviewId);
    try {
      await axios.post(`/api/reviews/${reviewId}/${voteType}`);

      // Refetch reviews to get updated vote data
      await fetchReviews();
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to vote", "error");
    } finally {
      setVotingReview(null);
    }
  };

  const hasUserVoted = (review, voteType) => {
    if (!user) return false;
    const votes = voteType === "upvote" ? review.upvotes : review.downvotes;
    return (votes || []).some(
      (id) =>
        id === user._id ||
        id?.toString?.() === user._id ||
        id?._id === user._id,
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl h-80 sm:h-96 animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-wheat rounded-lg w-3/4 animate-pulse" />
            <div className="h-4 bg-wheat rounded w-1/2 animate-pulse" />
            <div className="h-6 bg-wheat rounded w-1/4 animate-pulse" />
            <div className="h-20 bg-wheat rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-brown/50 text-lg mb-4">Product not found</p>
        <Link to="/products" className="text-olive font-medium hover:underline">
          ← Back to Products
        </Link>
      </div>
    );
  }

  const wishlisted = isInWishlist(product._id);
  const inCart = isInCart(product._id);

  const handleAddToCart = () => {
    if (inCart || justAdded) {
      navigate("/cart");
      return;
    }
    // Add product with selected weight info
    const productWithWeight = {
      ...product,
      selectedWeight: selectedWeight?.label || product.weight,
      price: calculatedPrice,
    };
    addToCart(productWithWeight, quantity);
    setJustAdded(true);
    addToast(
      `${product.name} (${selectedWeight?.label}) added to cart!`,
      "success",
    );
  };

  const handleToggleWishlist = () => {
    const added = toggleWishlist(product);
    addToast(
      added ? `${product.name} added to wishlist!` : `Removed from wishlist`,
      added ? "success" : "info",
    );
  };

  const checkPincode = () => {
    if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      addToast("Please enter a valid 6-digit pincode", "error");
      return;
    }

    setCheckingPincode(true);

    // Simulate API call delay
    setTimeout(() => {
      const today = new Date();
      const pincodeNum = parseInt(pincode);
      const firstDigit = Math.floor(pincodeNum / 100000);
      const firstTwo = Math.floor(pincodeNum / 10000);
      const firstThree = Math.floor(pincodeNum / 1000);

      // Determine delivery zone based on pincode ranges
      let deliveryDays;
      let available = true;
      let isCOD = true;
      let freeDelivery = calculatedPrice >= 499;

      // Metro cities - Same day to 2 days
      const metroPincodes = [
        [110001, 110099], // Delhi
        [400001, 400104], // Mumbai
        [560001, 560100], // Bangalore
        [600001, 600119], // Chennai
        [700001, 700157], // Kolkata
        [500001, 500100], // Hyderabad
        [380001, 380061], // Ahmedabad
        [411001, 411062], // Pune
      ];

      // Tier 2 cities - 2-4 days
      const tier2Pincodes = [
        [302001, 302039], // Jaipur
        [226001, 226031], // Lucknow
        [440001, 440037], // Nagpur
        [141001, 141020], // Ludhiana
        [160001, 160104], // Chandigarh
        [682001, 682041], // Kochi
        [395001, 395023], // Surat
        [462001, 462044], // Bhopal
        [452001, 452020], // Indore
        [201001, 201318], // NCR (Ghaziabad, Noida)
        [122001, 122108], // Gurugram
        [248001, 248198], // Dehradun
        [180001, 180020], // Jammu
        [144001, 144633], // Amritsar region
      ];

      // Check metro cities
      const isMetro = metroPincodes.some(
        ([start, end]) => pincodeNum >= start && pincodeNum <= end,
      );

      // Check tier 2 cities
      const isTier2 = tier2Pincodes.some(
        ([start, end]) => pincodeNum >= start && pincodeNum <= end,
      );

      // North East & Remote areas - 7-10 days
      const isRemote =
        (firstTwo >= 78 && firstTwo <= 79) || // Northeast
        (firstThree >= 190 && firstThree <= 194) || // J&K
        (firstThree >= 737 && firstThree <= 737) || // Sikkim
        firstTwo === 74; // Himachal remote

      if (isMetro) {
        // Metro: Tomorrow or day after
        deliveryDays = 1 + Math.floor(Math.random() * 2); // 1-2 days
      } else if (isTier2) {
        // Tier 2: 2-4 days
        deliveryDays = 2 + Math.floor(Math.random() * 3); // 2-4 days
      } else if (isRemote) {
        // Remote areas: 7-10 days
        deliveryDays = 7 + Math.floor(Math.random() * 4); // 7-10 days
        isCOD = false; // COD not available in remote areas
      } else if (firstDigit >= 1 && firstDigit <= 8) {
        // Rest of India: 4-6 days
        deliveryDays = 4 + Math.floor(Math.random() * 3); // 4-6 days
      } else {
        // Invalid pincode
        available = false;
      }

      if (available) {
        const deliveryDate = new Date(today);
        // Skip Sundays for delivery
        let daysAdded = 0;
        while (daysAdded < deliveryDays) {
          deliveryDate.setDate(deliveryDate.getDate() + 1);
          if (deliveryDate.getDay() !== 0) {
            daysAdded++;
          }
        }

        const formatDate = (date) => {
          const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          return `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]}`;
        };

        // Calculate if order placed before cutoff time (5 PM)
        const cutoffHour = 17;
        const currentHour = today.getHours();
        const orderBeforeCutoff = currentHour < cutoffHour;

        setDeliveryInfo({
          available: true,
          deliveryDate: formatDate(deliveryDate),
          deliveryDays,
          isFast: deliveryDays <= 2,
          isExpress: deliveryDays === 1,
          isCOD,
          freeDelivery,
          orderBeforeCutoff,
          isRemote,
        });
      } else {
        setDeliveryInfo({
          available: false,
        });
      }

      setPincodeChecked(true);
      setCheckingPincode(false);
    }, 600);
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPincode(value);
    if (pincodeChecked) {
      setPincodeChecked(false);
      setDeliveryInfo(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      {/* Breadcrumb */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm text-brown/60 hover:text-olive mb-6 transition-colors"
      >
        <FiArrowLeft size={14} /> Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-6 sm:gap-10">
        {/* Image Gallery - Flipkart Style */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          {/* Thumbnails */}
          {(() => {
            const allImages = [product.image, ...(product.images || [])].filter(
              Boolean,
            );
            return allImages.length > 1 ? (
              <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-96 pb-2 sm:pb-0 sm:pr-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    onMouseEnter={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? "border-olive shadow-md"
                        : "border-transparent hover:border-gold/50"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover bg-wheat"
                    />
                  </button>
                ))}
              </div>
            ) : null;
          })()}

          {/* Main Image */}
          <div className="relative flex-1">
            <img
              src={
                [product.image, ...(product.images || [])].filter(Boolean)[
                  selectedImage
                ] || product.image
              }
              alt={product.name}
              className="w-full h-72 sm:h-96 object-cover rounded-2xl bg-wheat"
            />
            {product.isFeatured && (
              <span className="absolute top-4 left-4 bg-olive text-ivory text-xs px-3 py-1.5 rounded-full font-medium">
                Featured
              </span>
            )}
            {/* Image counter */}
            {[product.image, ...(product.images || [])].filter(Boolean).length >
              1 && (
              <span className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                {selectedImage + 1} /{" "}
                {
                  [product.image, ...(product.images || [])].filter(Boolean)
                    .length
                }
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-olive/70">
              {product.category}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowShare(true)}
                className="w-10 h-10 rounded-full bg-wheat flex items-center justify-center text-brown/60 hover:text-olive transition-colors"
              >
                <FiShare2 size={18} />
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  wishlisted
                    ? "bg-red-50 text-red-500"
                    : "bg-wheat text-brown/60 hover:text-red-500"
                }`}
              >
                <FiHeart
                  size={18}
                  className={wishlisted ? "fill-current" : ""}
                />
              </button>
            </div>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-brown mb-2">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            {reviews.length > 0 ? (
              <>
                <div className="flex items-center gap-1 bg-gold/20 px-2.5 py-1 rounded-full">
                  <FiStar className="text-gold fill-current" size={14} />
                  <span className="text-sm font-bold text-brown">
                    {product.rating || 0}
                  </span>
                </div>
                <span className="text-sm text-brown/50">
                  ({reviews.length} reviews)
                </span>
              </>
            ) : (
              <span className="text-sm text-brown/50">
                {reviewsLoading ? "Loading..." : "No ratings yet"}
              </span>
            )}
            <span className="text-sm text-brown/50">•</span>
            <span className="text-sm text-brown/50">{product.weight}</span>
          </div>

          {/* Stock Info */}
          <div className="text-sm mb-4">
            {product.stock > 0 ? (
              <span className="text-olive font-medium">
                ✓ In Stock
                {product.stock < 20 ? ` (Only ${product.stock} left)` : ""}
              </span>
            ) : (
              <span className="text-red-500 font-medium">✗ Out of Stock</span>
            )}
          </div>

          {/* Selected Quantity & Price */}
          <div className="mb-4">
            <p className="text-sm font-medium text-brown mb-3">
              <span className="text-brown/60">Selected Quantity:</span>{" "}
              <span className="text-olive font-semibold">
                {selectedWeight?.label || product.weight}
              </span>
            </p>

            {/* Weight Options Grid */}
            <div className="flex flex-wrap gap-2 mb-4">
              {weightOptions.map((weight) => (
                <button
                  key={weight.value}
                  onClick={() => setSelectedWeight(weight)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${
                    selectedWeight?.value === weight.value
                      ? "bg-brown text-ivory border-brown shadow-md"
                      : "bg-white text-brown/70 border-wheat hover:border-brown/30 hover:bg-wheat/30"
                  }`}
                >
                  {weight.label}
                </button>
              ))}
            </div>

            {/* Price per unit display */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brown/50">
              {weightOptions.map((weight) => (
                <span
                  key={weight.value}
                  className={
                    selectedWeight?.value === weight.value
                      ? "text-olive font-medium"
                      : ""
                  }
                >
                  (₹{Math.round(pricePerUnit * weight.multiplier)}/
                  {weight.label.replace(" ", "")})
                </span>
              ))}
            </div>
          </div>

          <p className="text-2xl sm:text-3xl font-bold text-olive mb-2">
            ₹{calculatedPrice}
          </p>
          <p className="text-xs text-brown/50 mb-4">
            (₹{pricePerUnit}/{isLiquid ? "L" : "kg"})
          </p>

          <p className="text-brown/70 text-sm sm:text-base leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Quantity + Add to Cart */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex items-center bg-wheat rounded-xl">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center text-brown hover:text-olive"
              >
                <FiMinus size={16} />
              </button>
              <span className="w-10 text-center font-medium text-brown">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center text-brown hover:text-olive"
              >
                <FiPlus size={16} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors active:scale-95 ${
                inCart || justAdded
                  ? "bg-gold text-brown hover:bg-gold/90"
                  : "bg-olive text-ivory hover:bg-olive/90"
              }`}
            >
              {inCart || justAdded ? (
                <>
                  <FiCheck size={18} /> Go to Cart
                </>
              ) : (
                <>
                  <FiShoppingCart size={18} /> Add to Cart
                </>
              )}
            </button>
          </div>

          {/* Pincode Delivery Check */}
          <div className="border-t border-wheat pt-6">
            <div className="flex items-center gap-2 mb-3">
              <FiMapPin className="text-olive" size={18} />
              <span className="font-medium text-brown text-sm">
                Check Delivery Availability
              </span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={pincode}
                  onChange={handlePincodeChange}
                  placeholder="Enter 6-digit pincode"
                  className="w-full px-4 py-2.5 border border-wheat rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive text-sm"
                  maxLength={6}
                />
              </div>
              <button
                onClick={checkPincode}
                disabled={pincode.length !== 6 || checkingPincode}
                className="px-4 py-2.5 bg-olive text-ivory text-sm font-medium rounded-lg hover:bg-olive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {checkingPincode ? "Checking..." : "Check"}
              </button>
            </div>

            {/* Delivery Info */}
            {pincodeChecked && deliveryInfo && (
              <div className="mt-3">
                {deliveryInfo.available ? (
                  <div className="space-y-2">
                    {/* Delivery Date */}
                    <div className="flex items-start gap-3 p-3 bg-olive/5 rounded-lg border border-olive/20">
                      <FiTruck
                        className="text-olive mt-0.5 flex-shrink-0"
                        size={18}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-brown/70">
                            Delivery by
                          </span>
                          <span className="text-sm font-bold text-brown">
                            {deliveryInfo.deliveryDate}
                          </span>
                          {deliveryInfo.isExpress && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-olive text-ivory rounded-full">
                              EXPRESS
                            </span>
                          )}
                          {deliveryInfo.isFast && !deliveryInfo.isExpress && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-gold text-brown rounded-full">
                              FAST
                            </span>
                          )}
                        </div>
                        {deliveryInfo.orderBeforeCutoff &&
                          deliveryInfo.isFast && (
                            <p className="text-xs text-olive mt-1">
                              Order within {17 - new Date().getHours()}h to get
                              it faster
                            </p>
                          )}
                      </div>
                    </div>

                    {/* Free Delivery & COD Info */}
                    <div className="flex flex-wrap gap-3 text-xs">
                      {deliveryInfo.freeDelivery ? (
                        <span className="flex items-center gap-1 text-olive">
                          <span className="w-4 h-4 bg-olive/10 rounded-full flex items-center justify-center">
                            ✓
                          </span>
                          FREE Delivery
                        </span>
                      ) : (
                        <span className="text-brown/60">
                          ₹49 delivery charge (Free above ₹499)
                        </span>
                      )}
                      {deliveryInfo.isCOD ? (
                        <span className="flex items-center gap-1 text-olive">
                          <span className="w-4 h-4 bg-olive/10 rounded-full flex items-center justify-center">
                            ✓
                          </span>
                          COD Available
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500">
                          <span className="w-4 h-4 bg-red-50 rounded-full flex items-center justify-center">
                            ✗
                          </span>
                          COD Not Available
                        </span>
                      )}
                    </div>

                    {deliveryInfo.isRemote && (
                      <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                        ⚠ Remote area - Delivery may take longer than usual
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
                    <span className="text-sm text-red-600">
                      Sorry, delivery is not available to this pincode
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="mt-12 sm:mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-brown">
            Customer Reviews
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gold/20 px-3 py-1.5 rounded-full">
                <FiStar className="text-gold fill-current" size={14} />
                <span className="text-sm font-bold text-brown">
                  {product.rating || 0}
                </span>
              </div>
              <span className="text-sm text-brown/50">
                ({reviews.length} reviews)
              </span>
            </div>
          )}
        </div>

        {reviewsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <FiStar className="mx-auto text-brown/30 mb-4" size={40} />
            <p className="text-brown/60">
              No reviews yet. Be the first to review!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white rounded-xl p-4 sm:p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-olive/10 rounded-full flex items-center justify-center">
                      <FiUser className="text-olive" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-brown">
                        {review.user?.name || "Anonymous"}
                      </p>
                      <p className="text-xs text-brown/50">
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        size={14}
                        className={
                          star <= review.rating
                            ? "text-gold fill-current"
                            : "text-brown/20"
                        }
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-brown/80 leading-relaxed">
                  {review.comment}
                </p>

                {/* Voting Section */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-brown/10">
                  <button
                    onClick={() => handleVote(review._id, "upvote")}
                    disabled={votingReview === review._id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      hasUserVoted(review, "upvote")
                        ? "bg-green/20 text-green border border-green"
                        : "bg-brown/5 text-brown/70 hover:bg-green/10 hover:text-green border border-transparent"
                    } ${votingReview === review._id ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <FiThumbsUp
                      size={14}
                      className={
                        hasUserVoted(review, "upvote") ? "fill-current" : ""
                      }
                    />
                    <span>{(review.upvotes || []).length}</span>
                  </button>

                  <button
                    onClick={() => handleVote(review._id, "downvote")}
                    disabled={votingReview === review._id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      hasUserVoted(review, "downvote")
                        ? "bg-red-500/20 text-red-600 border border-red-500"
                        : "bg-brown/5 text-brown/70 hover:bg-red-500/10 hover:text-red-500 border border-transparent"
                    } ${votingReview === review._id ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <FiThumbsDown
                      size={14}
                      className={
                        hasUserVoted(review, "downvote") ? "fill-current" : ""
                      }
                    />
                    <span>{(review.downvotes || []).length}</span>
                  </button>

                  {votingReview === review._id && (
                    <span className="text-xs text-brown/50">Updating...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12 sm:mt-16">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-brown mb-6">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShare && (
        <ShareModal product={product} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
};

export default ProductDetail;
