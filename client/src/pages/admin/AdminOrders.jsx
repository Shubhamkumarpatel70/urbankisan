import { useState, useEffect } from "react";
import {
  FiSearch,
  FiEye,
  FiTruck,
  FiX,
  FiEdit2,
  FiPackage,
  FiCalendar,
  FiCreditCard,
  FiMapPin,
  FiUser,
  FiTag,
  FiPercent,
  FiDollarSign,
} from "react-icons/fi";
import axios from "axios";
import { useToast } from "../../components/Toast";

const statusOptions = [
  "confirmed",
  "processing",
  "shipped",
  "outForDelivery",
  "delivered",
];
const statusColors = {
  confirmed: "bg-gold/20 text-brown",
  processing: "bg-blue-50 text-blue-600",
  shipped: "bg-purple-50 text-purple-600",
  outForDelivery: "bg-orange-50 text-orange-600",
  delivered: "bg-olive/10 text-olive",
  cancelled: "bg-red-50 text-red-500",
};
const statusLabels = {
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  outForDelivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const deliveryPartners = [
  "BlueDart",
  "Delhivery",
  "DTDC",
  "FedEx",
  "Amazon Logistics",
  "Ecom Express",
  "XpressBees",
  "Shadowfax",
  "Other",
];

const AdminOrders = () => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  // Tracking Modal State
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [pendingStatus, setPendingStatus] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [deliveryPartner, setDeliveryPartner] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Order Details Modal State
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingOrder, setCancellingOrder] = useState(null);

  // Refund Modal State
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundingOrder, setRefundingOrder] = useState(null);
  const [refundUtrNumber, setRefundUtrNumber] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/orders");
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (order, newStatus) => {
    // If changing to cancelled, show cancellation reason modal
    if (newStatus === "cancelled") {
      setCancellingOrder(order);
      setCancelReason("");
      setShowCancelModal(true);
    }
    // If changing to processing and no tracking info yet, show modal
    else if (newStatus === "processing" && !order.trackingId) {
      setPendingOrder(order);
      setPendingStatus(newStatus);
      setTrackingId("");
      setDeliveryPartner("");
      setShowTrackingModal(true);
    } else {
      updateStatus(order._id, newStatus);
    }
  };

  const handleCancelSubmit = async () => {
    if (!cancelReason.trim()) {
      addToast("Please enter a reason for cancellation", "error");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.put(
        `/api/orders/${cancellingOrder._id}/status`,
        {
          orderStatus: "cancelled",
          cancelReason: cancelReason.trim(),
        },
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === cancellingOrder._id ? data : o)),
      );
      addToast("Order has been cancelled", "success");
      setShowCancelModal(false);
      setCancellingOrder(null);
      setCancelReason("");
    } catch (error) {
      addToast("Failed to cancel order", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefund = async (order) => {
    setRefundingOrder(order);
    setRefundUtrNumber("");
    setShowRefundModal(true);
  };

  const handleRefundSubmit = async () => {
    if (!refundUtrNumber.trim()) {
      addToast("Please enter the refund UTR number", "error");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.put(
        `/api/orders/${refundingOrder._id}/refund`,
        {
          refundUtrNumber: refundUtrNumber.trim(),
        },
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === refundingOrder._id ? data : o)),
      );
      if (selectedOrder?._id === refundingOrder._id) {
        setSelectedOrder(data);
      }
      addToast("Refund marked as completed", "success");
      setShowRefundModal(false);
      setRefundingOrder(null);
      setRefundUtrNumber("");
    } catch (error) {
      addToast(
        error.response?.data?.message || "Failed to process refund",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (orderId, newStatus, trackingInfo = {}) => {
    try {
      setSubmitting(true);
      const { data } = await axios.put(`/api/orders/${orderId}/status`, {
        orderStatus: newStatus,
        ...trackingInfo,
      });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data : o)));
      addToast(
        isEditMode
          ? "Tracking info updated"
          : `Order status updated to ${statusLabels[newStatus]}`,
        "success",
      );
      setShowTrackingModal(false);
      setPendingOrder(null);
      setIsEditMode(false);
    } catch (error) {
      addToast("Failed to update status", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackingSubmit = () => {
    if (!trackingId.trim() || !deliveryPartner) {
      addToast("Please enter tracking ID and select delivery partner", "error");
      return;
    }
    updateStatus(pendingOrder._id, pendingStatus, {
      trackingId: trackingId.trim(),
      deliveryPartner,
    });
  };

  const handleModalCancel = () => {
    setShowTrackingModal(false);
    setPendingOrder(null);
    setTrackingId("");
    setDeliveryPartner("");
    setIsEditMode(false);
  };

  const handleEditTracking = (order) => {
    setPendingOrder(order);
    setPendingStatus(order.orderStatus);
    setTrackingId(order.trackingId || "");
    setDeliveryPartner(order.deliveryPartner || "");
    setIsEditMode(!!order.trackingId); // true if editing, false if adding new
    setShowTrackingModal(true);
  };

  const filtered = orders.filter((o) => {
    const matchesStatus = !filterStatus || o.orderStatus === filterStatus;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      (o.orderId && o.orderId.toLowerCase().includes(q)) ||
      o._id.toLowerCase().includes(q) ||
      (o.user?.name && o.user.name.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-brown">
          Manage Orders
        </h2>
        <p className="text-brown/60 text-sm mt-1">
          {orders.length} total orders
        </p>
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
            placeholder="Search by order ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-wheat bg-white text-sm text-brown placeholder-brown/40 focus:outline-none focus:border-olive font-mono"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus("")}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              !filterStatus ? "bg-olive text-ivory" : "bg-wheat text-brown"
            }`}
          >
            All
          </button>
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                filterStatus === s
                  ? "bg-olive text-ivory"
                  : "bg-wheat text-brown"
              }`}
            >
              {statusLabels[s] || s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-brown/50 text-sm">
            {orders.length === 0
              ? "No orders yet"
              : "No orders match your filters"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-mono font-bold text-olive">
                    {order.orderId || order._id}
                  </p>
                  <p className="text-xs text-brown/50 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* View Details Button */}
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetailsModal(true);
                    }}
                    className="p-2 text-brown/50 hover:text-olive hover:bg-olive/10 rounded-lg transition-colors"
                    title="View order details"
                  >
                    <FiEye size={18} />
                  </button>
                  {/* Status Update Dropdown */}
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order, e.target.value)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium border-0 cursor-pointer ${
                      statusColors[order.orderStatus] || statusColors.confirmed
                    }`}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {statusLabels[s] || s}
                      </option>
                    ))}
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Items Row */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex -space-x-2 flex-shrink-0">
                  {order.items.slice(0, 4).map((item, idx) => (
                    <img
                      key={idx}
                      src={item.image}
                      alt={item.name}
                      className="w-9 h-9 rounded-lg border-2 border-white object-cover bg-wheat"
                    />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-brown/70 truncate">
                    {order.items.map((i) => i.name).join(", ")}
                  </p>
                </div>
                <p className="text-lg font-bold text-brown whitespace-nowrap">
                  ₹{order.totalPrice}
                </p>
              </div>

              {/* Footer */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-brown/50">
                <span>👤 {order.user?.name || "Customer"}</span>
                <span>•</span>
                <span>
                  📍 {order.shippingAddress?.city || "N/A"},{" "}
                  {order.shippingAddress?.state || "N/A"}
                </span>
                <span>•</span>
                <span>💳 {order.paymentMethod}</span>
                {order.trackingId ? (
                  <>
                    <span>•</span>
                    <span className="text-olive font-medium">
                      🚚 {order.deliveryPartner}: {order.trackingId}
                    </span>
                    <button
                      onClick={() => handleEditTracking(order)}
                      className="ml-1 p-1 text-brown/40 hover:text-olive hover:bg-olive/10 rounded transition-colors"
                      title="Edit tracking info"
                    >
                      <FiEdit2 size={12} />
                    </button>
                  </>
                ) : order.orderStatus !== "confirmed" &&
                  order.orderStatus !== "cancelled" ? (
                  <>
                    <span>•</span>
                    <button
                      onClick={() => handleEditTracking(order)}
                      className="text-olive hover:underline flex items-center gap-1 font-medium"
                    >
                      <FiTruck size={12} /> Add Tracking
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tracking Info Modal */}
      {showTrackingModal && pendingOrder && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleModalCancel}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-wheat">
              <div>
                <h3 className="font-display text-lg font-bold text-brown">
                  {isEditMode ? "Edit" : "Add"} Tracking Information
                </h3>
                <p className="text-sm text-brown/60">
                  Order: {pendingOrder.orderId || pendingOrder._id}
                </p>
              </div>
              <button
                onClick={handleModalCancel}
                className="p-2 hover:bg-wheat rounded-full transition-colors"
              >
                <FiX size={20} className="text-brown/60" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Delivery Partner <span className="text-red-500">*</span>
                </label>
                <select
                  value={deliveryPartner}
                  onChange={(e) => setDeliveryPartner(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-wheat bg-ivory text-brown focus:outline-none focus:border-olive"
                >
                  <option value="">Select delivery partner</option>
                  {deliveryPartners.map((partner) => (
                    <option key={partner} value={partner}>
                      {partner}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Tracking ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full px-4 py-3 rounded-xl border border-wheat bg-ivory text-brown placeholder-brown/40 focus:outline-none focus:border-olive font-mono"
                />
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <FiTruck className="text-blue-500 mt-0.5" size={18} />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">
                      Tracking info will be shared with customer
                    </p>
                    <p className="text-blue-600 mt-1">
                      Customer will receive a notification with tracking
                      details.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-5 border-t border-wheat">
              <button
                onClick={handleModalCancel}
                className="flex-1 px-4 py-3 rounded-xl border border-wheat text-brown font-medium hover:bg-wheat/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTrackingSubmit}
                disabled={submitting || !trackingId.trim() || !deliveryPartner}
                className="flex-1 px-4 py-3 rounded-xl bg-olive text-ivory font-medium hover:bg-olive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? isEditMode
                    ? "Updating..."
                    : "Submitting..."
                  : isEditMode
                    ? "Update"
                    : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-wheat sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-display text-lg font-bold text-brown">
                  Order Details
                </h3>
                <p className="text-sm text-brown/60 font-mono">
                  {selectedOrder.orderId || selectedOrder._id}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-wheat rounded-full transition-colors"
              >
                <FiX size={20} className="text-brown/60" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {/* Current Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-brown/60">Current Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedOrder.orderStatus]}`}
                >
                  {statusLabels[selectedOrder.orderStatus]}
                </span>
              </div>

              {/* Order Items */}
              <div className="bg-ivory rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FiPackage className="text-olive" size={16} />
                  <h4 className="font-medium text-brown">
                    Order Items ({selectedOrder.items.length})
                  </h4>
                </div>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-white rounded-lg p-3"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover bg-wheat"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brown truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-brown/60">
                          ₹{item.price} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-brown">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-ivory rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FiTag className="text-olive" size={16} />
                  <h4 className="font-medium text-brown">Price Breakdown</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-brown/70">
                    <span>Subtotal</span>
                    <span>
                      ₹
                      {selectedOrder.items.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0,
                      )}
                    </span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <FiPercent size={12} />
                        Discount
                        {selectedOrder.discountCode && (
                          <span className="text-xs bg-green-100 px-1.5 py-0.5 rounded">
                            {selectedOrder.discountCode}
                          </span>
                        )}
                        {selectedOrder.discountType && (
                          <span className="text-xs text-brown/50">
                            ({selectedOrder.discountType})
                          </span>
                        )}
                      </span>
                      <span>-₹{selectedOrder.discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-brown/70">
                    <span>Shipping</span>
                    <span>
                      {selectedOrder.shippingCharge > 0
                        ? `₹${selectedOrder.shippingCharge}`
                        : "Free"}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-brown pt-2 border-t border-wheat">
                    <span>Total</span>
                    <span>₹{selectedOrder.totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Customer & Shipping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-ivory rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FiUser className="text-olive" size={16} />
                    <h4 className="font-medium text-brown">Customer</h4>
                  </div>
                  <p className="text-sm text-brown">
                    {selectedOrder.user?.name || "N/A"}
                  </p>
                  <p className="text-xs text-brown/60 mt-1">
                    {selectedOrder.user?.email || "N/A"}
                  </p>
                  {selectedOrder.user?.phone && (
                    <p className="text-xs text-brown/60">
                      {selectedOrder.user.phone}
                    </p>
                  )}
                </div>

                <div className="bg-ivory rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FiMapPin className="text-olive" size={16} />
                    <h4 className="font-medium text-brown">Shipping Address</h4>
                  </div>
                  {selectedOrder.shippingAddress ? (
                    <div className="text-sm text-brown/70">
                      <p>{selectedOrder.shippingAddress.fullName}</p>
                      <p>{selectedOrder.shippingAddress.address}</p>
                      <p>
                        {selectedOrder.shippingAddress.city},{" "}
                        {selectedOrder.shippingAddress.state}{" "}
                        {selectedOrder.shippingAddress.pincode}
                      </p>
                      {selectedOrder.shippingAddress.phone && (
                        <p className="mt-1 text-xs">
                          📞 {selectedOrder.shippingAddress.phone}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-brown/50">N/A</p>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-ivory rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FiCreditCard className="text-olive" size={16} />
                  <h4 className="font-medium text-brown">
                    Payment Information
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-brown/60">Method: </span>
                    <span className="text-brown font-medium">
                      {selectedOrder.paymentMethod}
                    </span>
                  </div>
                  <div>
                    <span className="text-brown/60">Status: </span>
                    <span
                      className={`font-medium ${
                        selectedOrder.isPaid ||
                        (selectedOrder.orderStatus === "delivered" &&
                          (selectedOrder.paymentMethod === "COD" ||
                            selectedOrder.paymentMethod === "Cash on Delivery"))
                          ? "text-green-600"
                          : "text-orange-500"
                      }`}
                    >
                      {selectedOrder.isPaid ||
                      (selectedOrder.orderStatus === "delivered" &&
                        (selectedOrder.paymentMethod === "COD" ||
                          selectedOrder.paymentMethod === "Cash on Delivery"))
                        ? "Paid"
                        : "Pending"}
                    </span>
                  </div>
                  {selectedOrder.utrNumber && (
                    <div className="sm:col-span-2">
                      <span className="text-brown/60">UTR Number: </span>
                      <span className="text-brown font-mono font-medium">
                        {selectedOrder.utrNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Refund Section (for cancelled orders with online payment) */}
              {selectedOrder.orderStatus === "cancelled" &&
                selectedOrder.paymentMethod !== "COD" &&
                selectedOrder.paymentMethod !== "Cash on Delivery" && (
                  <div
                    className={`rounded-xl p-4 border ${
                      selectedOrder.refundStatus === "completed"
                        ? "bg-green-50 border-green-100"
                        : "bg-orange-50 border-orange-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FiDollarSign
                          className={
                            selectedOrder.refundStatus === "completed"
                              ? "text-green-600"
                              : "text-orange-600"
                          }
                          size={16}
                        />
                        <div>
                          <h4
                            className={`font-medium ${selectedOrder.refundStatus === "completed" ? "text-green-700" : "text-orange-700"}`}
                          >
                            Refund Status
                          </h4>
                          <p
                            className={`text-sm ${selectedOrder.refundStatus === "completed" ? "text-green-600" : "text-orange-600"}`}
                          >
                            {selectedOrder.refundStatus === "completed"
                              ? `Refunded on ${new Date(selectedOrder.refundedAt).toLocaleDateString("en-IN")}`
                              : `Refund pending - ₹${selectedOrder.totalPrice}`}
                          </p>
                          {selectedOrder.refundStatus === "completed" &&
                            selectedOrder.refundUtrNumber && (
                              <p className="text-xs text-green-600 font-mono mt-1">
                                UTR: {selectedOrder.refundUtrNumber}
                              </p>
                            )}
                          {selectedOrder.cancelledBy && (
                            <p className="text-xs text-brown/50 mt-1">
                              Cancelled by:{" "}
                              {selectedOrder.cancelledBy === "user"
                                ? "Customer"
                                : "Admin"}
                            </p>
                          )}
                        </div>
                      </div>
                      {selectedOrder.refundStatus === "pending" && (
                        <button
                          onClick={() => handleRefund(selectedOrder)}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Mark Refunded
                        </button>
                      )}
                    </div>
                  </div>
                )}

              {/* Tracking Info */}
              {selectedOrder.trackingId && (
                <div className="bg-ivory rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FiTruck className="text-olive" size={16} />
                    <h4 className="font-medium text-brown">
                      Tracking Information
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-brown/60">Partner: </span>
                      <span className="text-brown font-medium">
                        {selectedOrder.deliveryPartner}
                      </span>
                    </div>
                    <div>
                      <span className="text-brown/60">Tracking ID: </span>
                      <span className="text-brown font-mono font-medium">
                        {selectedOrder.trackingId}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Cancellation Reason (if cancelled) */}
              {selectedOrder.orderStatus === "cancelled" &&
                selectedOrder.cancelReason && (
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-500">❌</span>
                      <h4 className="font-medium text-red-700">
                        Cancellation Reason
                      </h4>
                    </div>
                    <p className="text-sm text-red-600">
                      {selectedOrder.cancelReason}
                    </p>
                  </div>
                )}

              {/* Status Timeline */}
              <div className="bg-ivory rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FiCalendar className="text-olive" size={16} />
                  <h4 className="font-medium text-brown">Status Timeline</h4>
                </div>
                <div className="space-y-3">
                  {/* Order Created */}
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-olive"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-brown">
                        Order Placed
                      </p>
                      <p className="text-xs text-brown/60">
                        {new Date(selectedOrder.createdAt).toLocaleString(
                          "en-IN",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                  {/* Status Dates */}
                  {selectedOrder.statusDates &&
                    Object.entries(selectedOrder.statusDates)
                      .filter(([_, date]) => date)
                      .sort(([, a], [, b]) => new Date(a) - new Date(b))
                      .map(([status, date]) => (
                        <div key={status} className="flex items-center gap-3">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              status === "cancelled"
                                ? "bg-red-500"
                                : status === "delivered"
                                  ? "bg-green-500"
                                  : "bg-olive/60"
                            }`}
                          ></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-brown">
                              {statusLabels[status] || status}
                            </p>
                            <p className="text-xs text-brown/60">
                              {new Date(date).toLocaleString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {showCancelModal && cancellingOrder && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCancelModal(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-wheat">
              <div>
                <h3 className="font-display text-lg font-bold text-brown">
                  Cancel Order
                </h3>
                <p className="text-sm text-brown/60">
                  Order: {cancellingOrder.orderId || cancellingOrder._id}
                </p>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-2 hover:bg-wheat rounded-full transition-colors"
              >
                <FiX size={20} className="text-brown/60" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ This action cannot be undone. The customer will be notified
                  about the cancellation.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Reason for Cancellation{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-wheat bg-ivory text-brown focus:outline-none focus:border-olive mb-3"
                >
                  <option value="">Select a reason</option>
                  <option value="Out of stock">Out of stock</option>
                  <option value="Payment verification failed">
                    Payment verification failed
                  </option>
                  <option value="Delivery not available in this area">
                    Delivery not available in this area
                  </option>
                  <option value="Customer requested cancellation">
                    Customer requested cancellation
                  </option>
                  <option value="Fraudulent order">Fraudulent order</option>
                  <option value="Other">Other</option>
                </select>
                {cancelReason === "Other" && (
                  <textarea
                    value={cancelReason === "Other" ? "" : cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Enter custom reason..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-wheat bg-ivory text-brown placeholder-brown/40 focus:outline-none focus:border-olive resize-none"
                  />
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-5 border-t border-wheat">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-wheat text-brown font-medium hover:bg-wheat/50 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelSubmit}
                disabled={submitting || !cancelReason.trim()}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && refundingOrder && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRefundModal(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-wheat">
              <div>
                <h3 className="font-display text-lg font-bold text-brown">
                  Process Refund
                </h3>
                <p className="text-sm text-brown/60">
                  Order: {refundingOrder.orderId || refundingOrder._id}
                </p>
              </div>
              <button
                onClick={() => setShowRefundModal(false)}
                className="p-2 hover:bg-wheat rounded-full transition-colors"
              >
                <FiX size={20} className="text-brown/60" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <p className="text-sm text-green-700 font-medium">
                  💰 Refund Amount: ₹{refundingOrder.totalPrice}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Payment Method: {refundingOrder.paymentMethod}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Refund UTR Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={refundUtrNumber}
                  onChange={(e) => setRefundUtrNumber(e.target.value)}
                  placeholder="Enter UTR/Reference number"
                  className="w-full px-4 py-3 rounded-xl border border-wheat bg-ivory text-brown placeholder-brown/40 focus:outline-none focus:border-olive font-mono"
                />
                <p className="text-xs text-brown/50 mt-2">
                  Enter the UTR number from the bank transaction
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-5 border-t border-wheat">
              <button
                onClick={() => setShowRefundModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-wheat text-brown font-medium hover:bg-wheat/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRefundSubmit}
                disabled={submitting || !refundUtrNumber.trim()}
                className="flex-1 px-4 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Processing..." : "Mark Refunded"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
