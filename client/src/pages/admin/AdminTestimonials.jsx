import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiEdit2,
  FiTrash2,
  FiStar,
  FiToggleLeft,
  FiToggleRight,
  FiX,
  FiMessageSquare,
  FiMapPin,
  FiCheck,
  FiPackage,
} from "react-icons/fi";

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [eligibleReviews, setEligibleReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("testimonials");
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [addingReview, setAddingReview] = useState(null);
  const [formData, setFormData] = useState({
    text: "",
    location: "",
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [testimonialsRes, eligibleRes] = await Promise.all([
        axios.get("/api/testimonials/all"),
        axios.get("/api/testimonials/eligible-reviews"),
      ]);
      setTestimonials(testimonialsRes.data);
      setEligibleReviews(eligibleRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToTestimonials = (review) => {
    setAddingReview(review);
    setEditingTestimonial(null);
    setFormData({
      text: review.comment,
      location: "India",
      isActive: true,
      order: 0,
    });
    setShowModal(true);
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setAddingReview(null);
    setFormData({
      text: testimonial.text,
      location: testimonial.location || "India",
      isActive: testimonial.isActive,
      order: testimonial.order || 0,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTestimonial) {
        await axios.put(
          `/api/testimonials/${editingTestimonial._id}`,
          formData,
        );
      } else if (addingReview) {
        await axios.post("/api/testimonials", {
          reviewId: addingReview._id,
          ...formData,
        });
      }
      fetchData();
      closeModal();
    } catch (error) {
      console.error("Error saving testimonial:", error);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Remove this testimonial? (Original review will remain)")
    )
      return;
    try {
      await axios.delete(`/api/testimonials/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
    }
  };

  const handleToggle = async (id) => {
    try {
      await axios.patch(`/api/testimonials/${id}/toggle`, {});
      fetchData();
    } catch (error) {
      console.error("Error toggling testimonial:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTestimonial(null);
    setAddingReview(null);
    setFormData({
      text: "",
      location: "",
      isActive: true,
      order: 0,
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        size={14}
        className={i < rating ? "text-gold fill-current" : "text-brown/30"}
      />
    ));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-wheat rounded w-48"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-wheat rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-brown">
          Testimonials
        </h1>
        <p className="text-brown/60 text-sm mt-1">
          Manage customer testimonials displayed on homepage
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-brown/60 text-sm">Total Testimonials</p>
          <p className="text-2xl font-bold text-brown">{testimonials.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-brown/60 text-sm">Active</p>
          <p className="text-2xl font-bold text-olive">
            {testimonials.filter((t) => t.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-brown/60 text-sm">Eligible Reviews</p>
          <p className="text-2xl font-bold text-gold">
            {eligibleReviews.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-brown/60 text-sm">Avg Rating</p>
          <p className="text-2xl font-bold text-gold">
            {testimonials.length > 0
              ? (
                  testimonials.reduce(
                    (acc, t) => acc + (t.review?.rating || 5),
                    0,
                  ) / testimonials.length
                ).toFixed(1)
              : "0"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("testimonials")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "testimonials"
              ? "bg-olive text-ivory"
              : "bg-wheat text-brown hover:bg-wheat/80"
          }`}
        >
          Testimonials ({testimonials.length})
        </button>
        <button
          onClick={() => setActiveTab("eligible")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "eligible"
              ? "bg-olive text-ivory"
              : "bg-wheat text-brown hover:bg-wheat/80"
          }`}
        >
          Eligible Reviews ({eligibleReviews.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === "testimonials" ? (
        testimonials.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <FiMessageSquare size={48} className="mx-auto text-brown/30 mb-4" />
            <p className="text-brown/60">No testimonials yet</p>
            <button
              onClick={() => setActiveTab("eligible")}
              className="mt-4 text-olive font-medium hover:underline"
            >
              Add from eligible reviews
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial._id}
                className={`bg-white rounded-xl p-5 shadow-sm border-2 transition-all ${
                  testimonial.isActive
                    ? "border-transparent"
                    : "border-red-200 opacity-60"
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-1">
                    {renderStars(testimonial.review?.rating || 5)}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleToggle(testimonial._id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        testimonial.isActive
                          ? "text-olive hover:bg-olive/10"
                          : "text-red-500 hover:bg-red-50"
                      }`}
                      title={testimonial.isActive ? "Disable" : "Enable"}
                    >
                      {testimonial.isActive ? (
                        <FiToggleRight size={18} />
                      ) : (
                        <FiToggleLeft size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(testimonial)}
                      className="p-1.5 rounded-lg text-brown/60 hover:bg-wheat transition-colors"
                      title="Edit testimonial text"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial._id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Remove testimonial"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Product */}
                {testimonial.review?.product && (
                  <div className="flex items-center gap-2 mb-3 p-2 bg-wheat/50 rounded-lg">
                    <FiPackage size={14} className="text-brown/50" />
                    <span className="text-xs text-brown/70 truncate">
                      {testimonial.review.product.name}
                    </span>
                  </div>
                )}

                {/* Text */}
                <p className="text-brown/70 text-sm leading-relaxed mb-4 line-clamp-4">
                  "{testimonial.text}"
                </p>

                {/* Footer */}
                <div className="flex items-center gap-3 pt-3 border-t border-wheat">
                  <div className="w-10 h-10 rounded-full bg-olive/10 flex items-center justify-center">
                    <span className="text-olive font-bold">
                      {testimonial.review?.user?.name
                        ?.charAt(0)
                        .toUpperCase() || "C"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-brown text-sm">
                      {testimonial.review?.user?.name || "Customer"}
                    </p>
                    <p className="text-xs text-brown/50 flex items-center gap-1">
                      <FiMapPin size={10} />
                      {testimonial.location || "India"}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                {!testimonial.isActive && (
                  <div className="mt-3 text-xs text-red-500 font-medium">
                    Hidden from homepage
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : eligibleReviews.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <FiStar size={48} className="mx-auto text-brown/30 mb-4" />
          <p className="text-brown/60">No eligible reviews (4-5 stars)</p>
          <p className="text-sm text-brown/40 mt-2">
            Reviews with 4 or 5 stars will appear here
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eligibleReviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-xl p-5 shadow-sm border border-wheat hover:border-olive transition-colors"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-1">{renderStars(review.rating)}</div>
                <button
                  onClick={() => handleAddToTestimonials(review)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-olive text-ivory text-xs rounded-lg hover:bg-olive/90 transition-colors"
                >
                  <FiCheck size={14} />
                  Add
                </button>
              </div>

              {/* Product */}
              {review.product && (
                <div className="flex items-center gap-2 mb-3 p-2 bg-wheat/50 rounded-lg">
                  {review.product.image && (
                    <img
                      src={review.product.image}
                      alt={review.product.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  <span className="text-xs text-brown/70 truncate">
                    {review.product.name}
                  </span>
                </div>
              )}

              {/* Text */}
              <p className="text-brown/70 text-sm leading-relaxed mb-4 line-clamp-4">
                "{review.comment}"
              </p>

              {/* Footer */}
              <div className="flex items-center gap-3 pt-3 border-t border-wheat">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <span className="text-gold font-bold">
                    {review.user?.name?.charAt(0).toUpperCase() || "C"}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-brown text-sm">
                    {review.user?.name || "Customer"}
                  </p>
                  <p className="text-xs text-brown/50">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-wheat flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-display font-bold text-brown">
                {editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-wheat rounded-full transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Original Review Info */}
              {(addingReview || editingTestimonial?.review) && (
                <div className="p-4 bg-wheat/50 rounded-lg">
                  <p className="text-xs text-brown/50 mb-1">Original Review</p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {renderStars(
                        addingReview?.rating ||
                          editingTestimonial?.review?.rating,
                      )}
                    </div>
                    <span className="text-sm text-brown font-medium">
                      by{" "}
                      {addingReview?.user?.name ||
                        editingTestimonial?.review?.user?.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Testimonial Text */}
              <div>
                <label className="block text-sm font-medium text-brown mb-1">
                  Testimonial Text
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2.5 border border-wheat rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive resize-none"
                  placeholder="Edit the testimonial text for display..."
                  required
                />
                <p className="text-xs text-brown/50 mt-1">
                  You can edit this without affecting the original review
                </p>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-brown mb-1">
                  Location
                </label>
                <div className="relative">
                  <FiMapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-brown/40"
                    size={18}
                  />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 border border-wheat rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                    placeholder="Enter city name"
                  />
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-brown mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-wheat rounded-lg focus:ring-2 focus:ring-olive/20 focus:border-olive"
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-brown/50 mt-1">
                  Lower numbers appear first
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-4 bg-wheat/50 rounded-lg">
                <div>
                  <p className="font-medium text-brown text-sm">
                    Show on Homepage
                  </p>
                  <p className="text-xs text-brown/50">
                    Toggle to show/hide this testimonial
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, isActive: !formData.isActive })
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.isActive ? "bg-olive" : "bg-brown/20"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      formData.isActive ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-wheat rounded-lg text-brown font-medium hover:bg-wheat transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-olive text-ivory rounded-lg font-medium hover:bg-olive/90 transition-colors"
                >
                  {editingTestimonial ? "Update" : "Add"} Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTestimonials;
