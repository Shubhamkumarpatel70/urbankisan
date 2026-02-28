import { useState, useEffect } from "react";
import {
  FiSearch,
  FiMail,
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
  FiDownload,
  FiChevronDown,
} from "react-icons/fi";
import axios from "axios";
import { useToast } from "../../components/Toast";

const AdminNewsletter = () => {
  const { addToast } = useToast();
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchSubscribers();
  }, [statusFilter]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/newsletter", {
        params: { status: statusFilter, search },
      });
      setSubscribers(data.subscribers);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      addToast("Failed to fetch subscribers", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSubscribers();
  };

  const toggleStatus = async (id) => {
    try {
      await axios.put(`/api/newsletter/${id}/toggle`, {});
      addToast("Subscriber status updated", "success");
      fetchSubscribers();
    } catch (error) {
      addToast("Failed to update status", "error");
    }
  };

  const deleteSubscriber = async (id) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;
    try {
      await axios.delete(`/api/newsletter/${id}`);
      addToast("Subscriber deleted successfully", "success");
      fetchSubscribers();
    } catch (error) {
      addToast("Failed to delete subscriber", "error");
    }
  };

  const exportToCSV = () => {
    const activeOnly = subscribers.filter((s) => s.isActive);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Email,Name,Subscribed Date,Status\n" +
      activeOnly
        .map(
          (s) =>
            `${s.email},${s.name || "N/A"},${new Date(s.subscribedAt).toLocaleDateString()},${s.isActive ? "Active" : "Inactive"}`,
        )
        .join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute(
      "download",
      `newsletter_subscribers_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Subscribers exported successfully", "success");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brown">
            Newsletter Subscribers
          </h1>
          <p className="text-brown/60 text-sm">
            Manage your newsletter mailing list
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-olive text-ivory rounded-lg hover:bg-olive/90 transition-colors"
        >
          <FiDownload size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-wheat">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-olive/10 rounded-lg">
              <FiUsers className="text-olive" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-brown">{stats.total}</p>
              <p className="text-xs text-brown/60">Total Subscribers</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-wheat">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiUserCheck className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
              <p className="text-xs text-brown/60">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-wheat">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FiUserX className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {stats.inactive}
              </p>
              <p className="text-xs text-brown/60">Unsubscribed</p>
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
                placeholder="Search by email or name..."
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
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-brown/40 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-xl border border-wheat overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-olive border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-brown/60">Loading subscribers...</p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-8 text-center">
            <FiMail className="mx-auto text-4xl text-brown/30 mb-4" />
            <p className="text-brown/60">No subscribers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ivory">
                <tr>
                  <th className="text-left px-4 sm:px-6 py-4 text-sm font-semibold text-brown">
                    Email
                  </th>
                  <th className="text-left px-4 sm:px-6 py-4 text-sm font-semibold text-brown hidden sm:table-cell">
                    Name
                  </th>
                  <th className="text-left px-4 sm:px-6 py-4 text-sm font-semibold text-brown hidden md:table-cell">
                    Subscribed
                  </th>
                  <th className="text-center px-4 sm:px-6 py-4 text-sm font-semibold text-brown">
                    Status
                  </th>
                  <th className="text-right px-4 sm:px-6 py-4 text-sm font-semibold text-brown">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wheat">
                {subscribers.map((subscriber) => (
                  <tr
                    key={subscriber._id}
                    className="hover:bg-ivory/50 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-olive/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <FiMail className="text-olive" size={14} />
                        </div>
                        <span className="text-sm text-brown truncate max-w-[200px]">
                          {subscriber.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-brown/70 hidden sm:table-cell">
                      {subscriber.name || "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-brown/70 hidden md:table-cell">
                      {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          subscriber.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {subscriber.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleStatus(subscriber._id)}
                          className="p-2 text-brown/60 hover:text-olive hover:bg-olive/10 rounded-lg transition-colors"
                          title={
                            subscriber.isActive ? "Deactivate" : "Activate"
                          }
                        >
                          {subscriber.isActive ? (
                            <FiToggleRight
                              size={18}
                              className="text-green-600"
                            />
                          ) : (
                            <FiToggleLeft size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => deleteSubscriber(subscriber._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-olive/10 rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold text-brown mb-2">Newsletter Tips</h3>
        <ul className="text-sm text-brown/70 space-y-1 list-disc list-inside">
          <li>Subscribers can sign up via the newsletter form in the footer</li>
          <li>
            Use the Export feature to download active subscribers for email
            campaigns
          </li>
          <li>
            Inactive subscribers have opted out and should not receive marketing
            emails
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminNewsletter;
