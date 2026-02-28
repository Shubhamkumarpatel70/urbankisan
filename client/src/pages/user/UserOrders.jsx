import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiPackage,
  FiTruck,
  FiEye,
  FiStar,
  FiX,
  FiEdit2,
  FiAlertCircle,
  FiXCircle,
} from "react-icons/fi";
import axios from "axios";
import { useToast } from "../../components/Toast";

const statusColors = {
  confirmed: "bg-gold/20 text-brown",
  processing: "bg-blue-50 text-blue-600",
  shipped: "bg-purple-50 text-purple-600",
  outForDelivery: "bg-orange-50 text-orange-600",
  delivered: "bg-olive/10 text-olive",
  cancelled: "bg-red-50 text-red-500",
};

const UserOrders = () => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [feedbackProduct, setFeedbackProduct] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingReviews, setExistingReviews] = useState({});
  const [editingReviewId, setEditingReviewId] = useState(null);

  // Cancel Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get("/api/orders/myorders");
        setOrders(data);

        // Fetch existing reviews for delivered orders
        const deliveredOrders = data.filter(
          (o) => o.orderStatus === "delivered",
        );
        const reviewsMap = {};
        for (const order of deliveredOrders) {
          for (const item of order.items) {
            try {
              const { data: review } = await axios.get(
                `/api/reviews/user-review/${order._id}/${item.product}`,
              );
              if (review) {
                reviewsMap[`${order._id}-${item.product}`] = review;
              }
            } catch (e) {
              // No review exists
            }
          }
        }
        setExistingReviews(reviewsMap);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered =
    filter === "all"
      ? orders
      : filter === "active"
        ? orders.filter(
            (o) =>
              o.orderStatus !== "delivered" && o.orderStatus !== "cancelled",
          )
        : orders.filter((o) => o.orderStatus === filter);

  const filters = [
    { label: "All", value: "all", count: orders.length },
    {
      label: "Active",
      value: "active",
      count: orders.filter(
        (o) => o.orderStatus !== "delivered" && o.orderStatus !== "cancelled",
      ).length,
    },
    {
      label: "Delivered",
      value: "delivered",
      count: orders.filter((o) => o.orderStatus === "delivered").length,
    },
    {
      label: "Cancelled",
      value: "cancelled",
      count: orders.filter((o) => o.orderStatus === "cancelled").length,
    },
  ];

  const openFeedback = (order, item) => {
    const key = `${order._id}-${item.product}`;
    const existingReview = existingReviews[key];

    setFeedbackOrder(order);
    setFeedbackProduct(item);

    if (existingReview) {
      setFeedbackRating(existingReview.rating);
      setFeedbackComment(existingReview.comment);
      setEditingReviewId(existingReview._id);
    } else {
      setFeedbackRating(0);
      setFeedbackComment("");
      setEditingReviewId(null);
    }
    setShowFeedback(true);
  };

  const closeFeedback = () => {
    setShowFeedback(false);
    setFeedbackOrder(null);
    setFeedbackProduct(null);
    setFeedbackRating(0);
    setFeedbackComment("");
    setEditingReviewId(null);
  };

  const submitFeedback = async () => {
    if (feedbackRating === 0) {
      addToast("Please select a rating", "error");
      return;
    }
    if (!feedbackComment.trim()) {
      addToast("Please write a comment", "error");
      return;
    }

    setSubmitting(true);
    try {
      let review;
      if (editingReviewId) {
        // Update existing review
        const { data } = await axios.put(`/api/reviews/${editingReviewId}`, {
          rating: feedbackRating,
          comment: feedbackComment.trim(),
        });
        review = data;
        addToast("Review updated successfully!", "success");
      } else {
        // Create new review
        const { data } = await axios.post("/api/reviews", {
          productId: feedbackProduct.product,
          orderId: feedbackOrder._id,
          rating: feedbackRating,
          comment: feedbackComment.trim(),
        });
        review = data;
        addToast("Thank you for your feedback!", "success");
      }

      // Update existing reviews map
      const key = `${feedbackOrder._id}-${feedbackProduct.product}`;
      setExistingReviews((prev) => ({
        ...prev,
        [key]: review,
      }));

      closeFeedback();
    } catch (error) {
      addToast(
        error.response?.data?.message || "Failed to submit feedback",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const hasReview = (orderId, productId) => {
    return !!existingReviews[`${orderId}-${productId}`];
  };

  const openCancelModal = (order) => {
    setCancellingOrder(order);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancellingOrder(null);
    setCancelReason("");
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      addToast("Please select or enter a reason", "error");
      return;
    }

    setCancelling(true);
    try {
      const { data } = await axios.put(
        `/api/orders/${cancellingOrder._id}/cancel`,
        {
          cancelReason: cancelReason.trim(),
        },
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === cancellingOrder._id ? data : o)),
      );
      addToast("Order cancelled successfully", "success");
      closeCancelModal();
    } catch (error) {
      addToast(
        error.response?.data?.message || "Failed to cancel order",
        "error",
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-brown">My Orders</h2>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              filter === f.value
                ? "bg-olive text-ivory"
                : "bg-white text-brown hover:bg-wheat"
            }`}
          >
            {f.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === f.value ? "bg-ivory/20" : "bg-wheat"
              }`}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-36 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <FiPackage className="mx-auto text-brown/30 mb-4" size={48} />
          <p className="text-brown/60 mb-4">
            {orders.length === 0
              ? "You haven't placed any orders yet"
              : "No orders in this category"}
          </p>
          <Link
            to="/products"
            className="text-olive font-medium hover:underline"
          >
            Start Shopping →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <p className="text-xs text-brown/50">Order ID</p>
                  <p className="text-sm font-mono font-bold text-olive">
                    {order.orderId || order._id}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusColors[order.orderStatus] || statusColors.confirmed}`}
                  >
                    {order.orderStatus === "outForDelivery"
                      ? "Out for Delivery"
                      : order.orderStatus}
                  </span>
                  <span className="text-xs text-brown/50">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex -space-x-2 flex-shrink-0">
                  {order.items.slice(0, 4).map((item, idx) => (
                    <img
                      key={idx}
                      src={item.image}
                      alt={item.name}
                      className="w-11 h-11 rounded-lg border-2 border-white object-cover bg-wheat"
                    />
                  ))}
                  {order.items.length > 4 && (
                    <div className="w-11 h-11 rounded-lg border-2 border-white bg-wheat flex items-center justify-center text-xs text-brown/60">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-brown/70 truncate">
                    {order.items.map((i) => i.name).join(", ")}
                  </p>
                  <p className="text-xs text-brown/50">
                    {order.items.length} items
                  </p>
                </div>
                <span className="text-lg font-bold text-brown">
                  ₹{order.totalPrice}
                </span>
              </div>

              {/* Tracking Info */}
              {order.trackingId && (
                <div className="flex items-center gap-3 mb-4 p-3 bg-olive/5 rounded-lg border border-olive/10">
                  <FiTruck className="text-olive" size={18} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brown">
                      {order.deliveryPartner}
                    </p>
                    <p className="text-xs text-brown/60 font-mono">
                      Tracking ID: {order.trackingId}
                    </p>
                  </div>
                </div>
              )}

              {/* Cancellation Reason */}
              {order.orderStatus === "cancelled" && order.cancelReason && (
                <div className="flex items-start gap-3 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <FiAlertCircle className="text-red-500 mt-0.5" size={18} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-700">
                      Cancellation Reason
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      {order.cancelReason}
                    </p>
                  </div>
                </div>
              )}

              {/* Refund Status for cancelled online payments */}
              {order.orderStatus === "cancelled" &&
                order.paymentMethod !== "COD" &&
                order.paymentMethod !== "Cash on Delivery" &&
                order.refundStatus && (
                  <div
                    className={`flex items-start gap-3 mb-4 p-3 rounded-lg border ${
                      order.refundStatus === "completed"
                        ? "bg-green-50 border-green-200"
                        : "bg-orange-50 border-orange-200"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        order.refundStatus === "completed"
                          ? "bg-green-500"
                          : "bg-orange-500"
                      }`}
                    >
                      <span className="text-white text-xs">₹</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          order.refundStatus === "completed"
                            ? "text-green-700"
                            : "text-orange-700"
                        }`}
                      >
                        {order.refundStatus === "completed"
                          ? "Refund Completed"
                          : "Refund Pending"}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          order.refundStatus === "completed"
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      >
                        {order.refundStatus === "completed"
                          ? `₹${order.totalPrice} has been refunded to your account`
                          : `₹${order.totalPrice} will be refunded within 5-7 business days`}
                      </p>
                      {order.refundStatus === "completed" &&
                        order.refundUtrNumber && (
                          <p className="text-xs text-green-600 font-mono mt-1">
                            UTR: {order.refundUtrNumber}
                          </p>
                        )}
                    </div>
                  </div>
                )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/track-order?id=${order.orderId || order._id}`}
                  className="flex items-center gap-1.5 text-sm px-4 py-2 bg-olive/10 text-olive rounded-lg font-medium hover:bg-olive/20 transition-colors"
                >
                  <FiTruck size={14} /> Track
                </Link>
                <Link
                  to={`/order-confirmation/${order._id}`}
                  className="flex items-center gap-1.5 text-sm px-4 py-2 bg-wheat text-brown rounded-lg font-medium hover:bg-wheat/70 transition-colors"
                >
                  <FiEye size={14} /> Details
                </Link>
                {/* Cancel Button - only for confirmed or processing orders */}
                {["confirmed", "processing"].includes(order.orderStatus) && (
                  <button
                    onClick={() => openCancelModal(order)}
                    className="flex items-center gap-1.5 text-sm px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                  >
                    <FiXCircle size={14} /> Cancel
                  </button>
                )}
              </div>

              {/* Feedback Section for Delivered Orders */}
              {order.orderStatus === "delivered" && (
                <div className="mt-4 pt-4 border-t border-wheat/50">
                  <p className="text-sm font-medium text-brown mb-3">
                    Rate your products
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item) => {
                      const reviewed = hasReview(order._id, item.product);
                      return (
                        <button
                          key={item.product}
                          onClick={() => openFeedback(order, item)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            reviewed
                              ? "bg-olive/10 text-olive hover:bg-olive/20"
                              : "bg-gold/20 text-brown hover:bg-gold/30"
                          }`}
                        >
                          <img
                            src={item.image}
                            alt=""
                            className="w-6 h-6 rounded object-cover"
                          />
                          <span className="max-w-[100px] truncate">
                            {item.name}
                          </span>
                          <FiStar
                            size={14}
                            className={reviewed ? "fill-current" : ""}
                          />
                          {reviewed && (
                            <FiEdit2 size={12} className="opacity-70" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && feedbackProduct && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          onClick={closeFeedback}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl font-semibold text-brown">
                {editingReviewId ? "Edit Review" : "Rate Product"}
              </h3>
              <button
                onClick={closeFeedback}
                className="w-8 h-8 rounded-full bg-wheat flex items-center justify-center text-brown"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Product Info */}
            <div className="flex items-center gap-3 p-3 bg-ivory rounded-xl mb-5">
              <img
                src={feedbackProduct.image}
                alt=""
                className="w-14 h-14 rounded-lg object-cover bg-wheat"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-brown truncate">
                  {feedbackProduct.name}
                </p>
                <p className="text-xs text-brown/60">
                  Order: {feedbackOrder.orderId || feedbackOrder._id.slice(-8)}
                </p>
              </div>
            </div>

            {/* Star Rating */}
            <div className="mb-5">
              <p className="text-sm font-medium text-brown mb-2">Your Rating</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedbackRating(star)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      star <= feedbackRating
                        ? "bg-gold text-brown scale-110"
                        : "bg-wheat text-brown/40 hover:bg-gold/30"
                    }`}
                  >
                    <FiStar
                      size={20}
                      className={star <= feedbackRating ? "fill-current" : ""}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-5">
              <p className="text-sm font-medium text-brown mb-2">Your Review</p>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Share your experience with this product..."
                className="w-full p-3 rounded-xl border border-wheat bg-white text-sm text-brown placeholder-brown/40 focus:outline-none focus:border-olive min-h-[100px] resize-none"
                rows={4}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={closeFeedback}
                className="flex-1 py-2.5 rounded-xl border border-wheat text-brown font-medium hover:bg-wheat transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-gold text-brown font-medium hover:bg-gold/90 transition-colors disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : editingReviewId
                    ? "Update Review"
                    : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && cancellingOrder && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          onClick={closeCancelModal}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl font-semibold text-brown">
                Cancel Order
              </h3>
              <button
                onClick={closeCancelModal}
                className="w-8 h-8 rounded-full bg-wheat flex items-center justify-center text-brown"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Order Info */}
            <div className="p-3 bg-ivory rounded-xl mb-5">
              <p className="text-sm font-medium text-brown">
                Order: {cancellingOrder.orderId || cancellingOrder._id}
              </p>
              <p className="text-xs text-brown/60 mt-1">
                ₹{cancellingOrder.totalPrice} • {cancellingOrder.items.length}{" "}
                items
              </p>
            </div>

            {/* Warning */}
            <div className="bg-red-50 rounded-xl p-4 mb-5 border border-red-100">
              <p className="text-sm text-red-600 font-medium">
                ⚠️ This action cannot be undone.
              </p>
              {cancellingOrder.paymentMethod !== "COD" &&
                cancellingOrder.paymentMethod !== "Cash on Delivery" && (
                  <p className="text-xs text-red-500 mt-1">
                    Refund will be processed within 5-7 business days.
                  </p>
                )}
            </div>

            {/* Reason Selection */}
            <div className="mb-5">
              <p className="text-sm font-medium text-brown mb-2">
                Reason for Cancellation <span className="text-red-500">*</span>
              </p>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 rounded-xl border border-wheat bg-ivory text-sm text-brown focus:outline-none focus:border-olive mb-3"
              >
                <option value="">Select a reason</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Found better price elsewhere">
                  Found better price elsewhere
                </option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Delivery time too long">
                  Delivery time too long
                </option>
                <option value="Incorrect address">Incorrect address</option>
                <option value="Other">Other</option>
              </select>
              {cancelReason === "Other" && (
                <textarea
                  value=""
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please specify your reason..."
                  className="w-full p-3 rounded-xl border border-wheat bg-ivory text-sm text-brown placeholder-brown/40 focus:outline-none focus:border-olive resize-none"
                  rows={3}
                />
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={closeCancelModal}
                className="flex-1 py-2.5 rounded-xl border border-wheat text-brown font-medium hover:bg-wheat transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling || !cancelReason.trim()}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
