import { useState, useEffect } from "react";
import { FiStar, FiTrash2, FiFilter, FiUser, FiPackage } from "react-icons/fi";
import axios from "axios";
import { useToast } from "../../components/Toast";

const AdminFeedback = () => {
  const { addToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchReviews();
  }, [ratingFilter, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {};
      if (ratingFilter) params.rating = ratingFilter;
      if (sortBy === "rating-high") params.sort = "rating-high";
      if (sortBy === "rating-low") params.sort = "rating-low";
      if (sortBy === "oldest") params.sort = "oldest";

      const { data } = await axios.get("/api/reviews/admin/all", { params });
      setReviews(data.reviews);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      addToast("Failed to load reviews", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axios.delete(`/api/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      addToast("Review deleted", "success");
      fetchReviews(); // Refresh to update stats
    } catch (error) {
      addToast("Failed to delete review", "error");
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            size={14}
            className={
              star <= rating ? "text-gold fill-current" : "text-brown/20"
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-brown">
        Customer Feedback
      </h2>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-brown/60">Total Reviews</p>
            <p className="text-2xl font-bold text-brown">
              {stats.totalReviews}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-brown/60">Average Rating</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-brown">
                {stats.avgRating ? stats.avgRating.toFixed(1) : "0"}
              </p>
              <FiStar className="text-gold fill-current" size={18} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-brown/60">5 Star Reviews</p>
            <p className="text-2xl font-bold text-olive">{stats.fiveStar}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-brown/60">1 Star Reviews</p>
            <p className="text-2xl font-bold text-red-500">{stats.oneStar}</p>
          </div>
        </div>
      )}

      {/* Rating Distribution */}
      {stats && stats.totalReviews > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-medium text-brown mb-4">
            Rating Distribution
          </h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count =
                stats[
                  `${["one", "two", "three", "four", "five"][rating - 1]}Star`
                ];
              const percentage =
                stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm text-brown w-6">{rating}★</span>
                  <div className="flex-1 h-2 bg-wheat rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${rating >= 4 ? "bg-olive" : rating === 3 ? "bg-gold" : "bg-red-400"}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-brown/60 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow-sm">
          <FiFilter className="text-brown/40" size={16} />
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="bg-transparent text-sm text-brown focus:outline-none"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-wheat bg-white text-sm text-brown focus:outline-none focus:border-olive"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="rating-high">Highest Rating</option>
          <option value="rating-low">Lowest Rating</option>
        </select>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <FiStar className="mx-auto text-brown/30 mb-4" size={48} />
          <p className="text-brown/60">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-xl shadow-sm p-4 sm:p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                {/* User & Product Info */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-olive/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiUser className="text-olive" size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-brown">
                      {review.user?.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-brown/50">
                      {review.user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {renderStars(review.rating)}
                  <span className="text-xs text-brown/50">
                    {new Date(review.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex items-center gap-3 p-3 bg-ivory rounded-lg mb-3">
                <FiPackage className="text-brown/40" size={16} />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {review.product?.image && (
                    <img
                      src={review.product.image}
                      alt=""
                      className="w-8 h-8 rounded object-cover bg-wheat"
                    />
                  )}
                  <span className="text-sm text-brown truncate">
                    {review.product?.name || "Product Deleted"}
                  </span>
                </div>
                <span className="text-xs text-brown/50">
                  Order: {review.order?.orderId || "N/A"}
                </span>
              </div>

              {/* Comment */}
              <p className="text-sm text-brown/80 leading-relaxed mb-4">
                "{review.comment}"
              </p>

              {/* Actions */}
              <div className="flex justify-end">
                <button
                  onClick={() => handleDelete(review._id)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <FiTrash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;
