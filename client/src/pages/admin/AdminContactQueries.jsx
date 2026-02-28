import { useState, useEffect } from "react";
import {
  FiSearch,
  FiMail,
  FiUser,
  FiClock,
  FiMessageCircle,
  FiChevronDown,
  FiTrash2,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import axios from "axios";
import { useToast } from "../../components/Toast";

const AdminContactQueries = () => {
  const { addToast } = useToast();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchQueries();
  }, [statusFilter]);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/contact", {
        params: { status: statusFilter, search },
      });
      setQueries(data);
    } catch (error) {
      console.error("Error fetching queries:", error);
      addToast("Failed to fetch contact queries", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchQueries();
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`/api/contact/${id}`, { status: newStatus, adminNotes });
      addToast("Status updated successfully", "success");
      fetchQueries();
      setSelectedQuery(null);
      setAdminNotes("");
    } catch (error) {
      addToast("Failed to update status", "error");
    }
  };

  const deleteQuery = async (id) => {
    if (!confirm("Are you sure you want to delete this query?")) return;
    try {
      await axios.delete(`/api/contact/${id}`);
      addToast("Query deleted successfully", "success");
      fetchQueries();
    } catch (error) {
      addToast("Failed to delete query", "error");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      new: "bg-blue-100 text-blue-700",
      "in-progress": "bg-yellow-100 text-yellow-700",
      resolved: "bg-green-100 text-green-700",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {status === "in-progress"
          ? "In Progress"
          : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const stats = {
    total: queries.length,
    new: queries.filter((q) => q.status === "new").length,
    inProgress: queries.filter((q) => q.status === "in-progress").length,
    resolved: queries.filter((q) => q.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brown">Contact Queries</h1>
          <p className="text-brown/60 text-sm">
            Manage customer inquiries and messages
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-wheat">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brown/10 rounded-lg">
              <FiMessageCircle className="text-brown" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-brown">{stats.total}</p>
              <p className="text-xs text-brown/60">Total Queries</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-wheat">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiAlertCircle className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
              <p className="text-xs text-brown/60">New</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-wheat">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FiClock className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.inProgress}
              </p>
              <p className="text-xs text-brown/60">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-wheat">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiCheck className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {stats.resolved}
              </p>
              <p className="text-xs text-brown/60">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-wheat">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-brown/40" />
              <input
                type="text"
                placeholder="Search by name, email, or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-wheat rounded-lg focus:outline-none focus:ring-2 focus:ring-olive/20"
              />
            </div>
          </form>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none w-full sm:w-40 px-4 py-2.5 border border-wheat rounded-lg focus:outline-none focus:ring-2 focus:ring-olive/20 bg-white pr-10"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-brown/40 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Queries List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-8 rounded-xl border border-wheat text-center">
            <div className="animate-spin w-8 h-8 border-2 border-olive border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-brown/60">Loading queries...</p>
          </div>
        ) : queries.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-wheat text-center">
            <FiMessageCircle className="mx-auto text-4xl text-brown/30 mb-4" />
            <p className="text-brown/60">No contact queries found</p>
          </div>
        ) : (
          queries.map((query) => (
            <div
              key={query._id}
              className="bg-white p-4 sm:p-6 rounded-xl border border-wheat hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {getStatusBadge(query.status)}
                    <span className="text-sm text-brown/50">
                      {new Date(query.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-brown text-lg mb-1">
                    {query.subject || "No Subject"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-brown/70 mb-3">
                    <span className="flex items-center gap-1">
                      <FiUser size={14} /> {query.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiMail size={14} /> {query.email}
                    </span>
                  </div>
                  <p className="text-brown/70 text-sm bg-ivory/50 p-3 rounded-lg">
                    {query.message}
                  </p>
                  {query.adminNotes && (
                    <div className="mt-3 p-3 bg-olive/10 rounded-lg">
                      <p className="text-xs font-medium text-olive mb-1">
                        Admin Notes:
                      </p>
                      <p className="text-sm text-brown/70">
                        {query.adminNotes}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex lg:flex-col gap-2">
                  <button
                    onClick={() => {
                      setSelectedQuery(query);
                      setAdminNotes(query.adminNotes || "");
                    }}
                    className="flex-1 lg:flex-none px-4 py-2 bg-olive text-ivory rounded-lg text-sm hover:bg-olive/90 transition-colors"
                  >
                    Update Status
                  </button>
                  <button
                    onClick={() => deleteQuery(query._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Status Update Modal */}
      {selectedQuery && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedQuery(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg text-brown mb-4">
              Update Query Status
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["new", "in-progress", "resolved"].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedQuery._id, status)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        selectedQuery.status === status
                          ? "bg-olive text-ivory"
                          : "bg-wheat text-brown hover:bg-olive/20"
                      }`}
                    >
                      {status === "in-progress"
                        ? "In Progress"
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brown mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-wheat rounded-lg focus:outline-none focus:ring-2 focus:ring-olive/20 resize-none"
                  placeholder="Add internal notes..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedQuery(null)}
                className="flex-1 px-4 py-2 border border-wheat rounded-lg text-brown hover:bg-wheat/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  updateStatus(selectedQuery._id, selectedQuery.status)
                }
                className="flex-1 px-4 py-2 bg-olive text-ivory rounded-lg hover:bg-olive/90 transition-colors"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContactQueries;
