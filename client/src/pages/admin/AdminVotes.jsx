import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiThumbsUp,
  FiThumbsDown,
  FiFilter,
  FiSearch,
  FiStar,
  FiPackage,
  FiUser,
  FiX,
} from "react-icons/fi";

const AdminVotes = () => {
  const [votes, setVotes] = useState([]);
  const [stats, setStats] = useState({ total: 0, upvotes: 0, downvotes: 0 });
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  // Filters
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedVoteType, setSelectedVoteType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchVotes();
  }, [selectedProduct, selectedVoteType]);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/products");
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchVotes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedProduct) params.append("productId", selectedProduct);
      if (selectedVoteType) params.append("voteType", selectedVoteType);

      const { data } = await axios.get(
        `/api/reviews/admin/votes?${params.toString()}`,
      );
      setVotes(data.votes);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching votes:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedProduct("");
    setSelectedVoteType("");
    setSearchTerm("");
  };

  const hasActiveFilters = selectedProduct || selectedVoteType || searchTerm;

  // Filter votes by search term
  const filteredVotes = votes.filter((vote) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      vote.user?.name?.toLowerCase().includes(search) ||
      vote.user?.email?.toLowerCase().includes(search) ||
      vote.product?.name?.toLowerCase().includes(search) ||
      vote.review?.comment?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-brown">
            Review Votes
          </h1>
          <p className="text-sm text-brown/60 mt-1">
            Track customer engagement on reviews
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            showFilters || hasActiveFilters
              ? "bg-gold/10 border-gold text-gold"
              : "bg-white border-brown/20 text-brown hover:border-gold"
          }`}
        >
          <FiFilter size={18} />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-gold text-white text-xs px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-brown/10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brown/10 flex items-center justify-center">
              <FiThumbsUp className="text-brown" size={18} />
            </div>
            <div>
              <p className="text-sm text-brown/60">Total Votes</p>
              <p className="text-xl font-bold text-brown">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-green/20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green/10 flex items-center justify-center">
              <FiThumbsUp className="text-green" size={18} />
            </div>
            <div>
              <p className="text-sm text-brown/60">Upvotes</p>
              <p className="text-xl font-bold text-green">{stats.upvotes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-red-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <FiThumbsDown className="text-red-500" size={18} />
            </div>
            <div>
              <p className="text-sm text-brown/60">Downvotes</p>
              <p className="text-xl font-bold text-red-500">
                {stats.downvotes}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl p-4 border border-brown/10 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-brown">Filter Votes</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gold hover:text-gold/80 flex items-center gap-1"
              >
                <FiX size={14} />
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm text-brown/70 mb-1">Search</label>
              <div className="relative">
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-brown/40"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="User, product, or comment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-brown/20 rounded-lg focus:outline-none focus:border-gold text-sm"
                />
              </div>
            </div>

            {/* Product Filter */}
            <div>
              <label className="block text-sm text-brown/70 mb-1">
                Product
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-4 py-2 border border-brown/20 rounded-lg focus:outline-none focus:border-gold text-sm bg-white"
              >
                <option value="">All Products</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Vote Type Filter */}
            <div>
              <label className="block text-sm text-brown/70 mb-1">
                Vote Type
              </label>
              <select
                value={selectedVoteType}
                onChange={(e) => setSelectedVoteType(e.target.value)}
                className="w-full px-4 py-2 border border-brown/20 rounded-lg focus:outline-none focus:border-gold text-sm bg-white"
              >
                <option value="">All Votes</option>
                <option value="upvote">Upvotes Only</option>
                <option value="downvote">Downvotes Only</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Votes Table */}
      <div className="bg-white rounded-xl border border-brown/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-brown/60">Loading votes...</p>
          </div>
        ) : filteredVotes.length === 0 ? (
          <div className="p-8 text-center">
            <FiThumbsUp size={40} className="mx-auto text-brown/20 mb-3" />
            <p className="text-brown/60">No votes found</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-2 text-sm text-gold hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-wheat/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-brown/70 uppercase tracking-wider">
                      Voter
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-brown/70 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-brown/70 uppercase tracking-wider">
                      Review
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-brown/70 uppercase tracking-wider">
                      Vote
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-brown/70 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brown/10">
                  {filteredVotes.map((vote, index) => (
                    <tr
                      key={`${vote.review?._id}-${vote.user?._id}-${vote.type}-${index}`}
                      className="hover:bg-wheat/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                            <FiUser size={14} className="text-gold" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-brown">
                              {vote.user?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-brown/50">
                              {vote.user?.email || "-"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {vote.product?.images?.[0] ? (
                            <img
                              src={vote.product.images[0]}
                              alt={vote.product.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-brown/10 flex items-center justify-center">
                              <FiPackage className="text-brown/40" />
                            </div>
                          )}
                          <span className="text-sm text-brown line-clamp-1">
                            {vote.product?.name || "Unknown Product"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="flex items-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FiStar
                              key={star}
                              size={10}
                              className={
                                star <= (vote.review?.rating || 0)
                                  ? "text-gold fill-current"
                                  : "text-brown/20"
                              }
                            />
                          ))}
                        </div>
                        <p className="text-xs text-brown/70 line-clamp-2">
                          {vote.review?.comment || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {vote.type === "upvote" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green/10 text-green text-xs font-medium">
                            <FiThumbsUp size={12} />
                            Upvote
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-500 text-xs font-medium">
                            <FiThumbsDown size={12} />
                            Downvote
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-brown/60">
                        {vote.votedAt
                          ? new Date(vote.votedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-brown/10">
              {filteredVotes.map((vote, index) => (
                <div
                  key={`${vote.review?._id}-${vote.user?._id}-${vote.type}-${index}`}
                  className="p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                        <FiUser size={16} className="text-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-brown">
                          {vote.user?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-brown/50">
                          {vote.votedAt
                            ? new Date(vote.votedAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                },
                              )
                            : "-"}
                        </p>
                      </div>
                    </div>
                    {vote.type === "upvote" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green/10 text-green text-xs font-medium">
                        <FiThumbsUp size={12} />
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-500 text-xs font-medium">
                        <FiThumbsDown size={12} />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    {vote.product?.images?.[0] ? (
                      <img
                        src={vote.product.images[0]}
                        alt={vote.product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-brown/10 flex items-center justify-center">
                        <FiPackage className="text-brown/40" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brown truncate">
                        {vote.product?.name || "Unknown Product"}
                      </p>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            size={10}
                            className={
                              star <= (vote.review?.rating || 0)
                                ? "text-gold fill-current"
                                : "text-brown/20"
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-brown/60 line-clamp-2 bg-brown/5 rounded-lg p-2">
                    "{vote.review?.comment || "No comment"}"
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Results Summary */}
      {!loading && filteredVotes.length > 0 && (
        <p className="text-sm text-brown/50 mt-4 text-center">
          Showing {filteredVotes.length} vote
          {filteredVotes.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
};

export default AdminVotes;
