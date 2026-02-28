import { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiEye,
  FiEyeOff,
  FiImage,
  FiX,
  FiLinkedin,
  FiTwitter,
  FiMail,
} from "react-icons/fi";
import axios from "axios";

const AdminTeam = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    image: "",
    bio: "",
    order: 0,
    socialLinks: { linkedin: "", twitter: "", email: "" },
  });
  const [uploading, setUploading] = useState(false);

  // Handle image file upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formDataObj = new FormData();
    formDataObj.append("image", file);
    setUploading(true);
    try {
      const { data } = await axios.post("/api/team/upload", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((prev) => ({ ...prev, image: data.url }));
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const { data } = await axios.get("/api/team/all");
      setTeam(data);
    } catch (error) {
      console.error("Error fetching team:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editMember) {
        await axios.put(`/api/team/${editMember._id}`, formData);
      } else {
        await axios.post("/api/team", formData);
      }
      fetchTeam();
      closeModal();
    } catch (error) {
      console.error("Error saving team member:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this team member?"))
      return;
    try {
      await axios.delete(`/api/team/${id}`);
      setTeam(team.filter((m) => m._id !== id));
    } catch (error) {
      console.error("Error deleting team member:", error);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const { data } = await axios.patch(`/api/team/${id}/toggle`);
      setTeam(team.map((m) => (m._id === id ? data : m)));
    } catch (error) {
      console.error("Error toggling team member:", error);
    }
  };

  const openModal = (member = null) => {
    if (member) {
      setEditMember(member);
      setFormData({
        name: member.name,
        role: member.role,
        image: member.image || "",
        bio: member.bio || "",
        order: member.order || 0,
        socialLinks: member.socialLinks || {
          linkedin: "",
          twitter: "",
          email: "",
        },
      });
    } else {
      setEditMember(null);
      setFormData({
        name: "",
        role: "",
        image: "",
        bio: "",
        order: team.length,
        socialLinks: { linkedin: "", twitter: "", email: "" },
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMember(null);
    setFormData({
      name: "",
      role: "",
      image: "",
      bio: "",
      order: 0,
      socialLinks: { linkedin: "", twitter: "", email: "" },
    });
  };

  const activeCount = team.filter((m) => m.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-brown">Team</h2>
          <p className="text-brown/60 text-sm mt-1">
            Manage your team members displayed on the website
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-olive text-ivory px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-olive/90 transition-colors"
        >
          <FiPlus size={18} /> Add Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm text-center">
          <p className="text-lg sm:text-2xl font-bold text-brown">
            {team.length}
          </p>
          <p className="text-[10px] sm:text-xs text-brown/60">Total Members</p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm text-center">
          <p className="text-lg sm:text-2xl font-bold text-olive">
            {activeCount}
          </p>
          <p className="text-[10px] sm:text-xs text-brown/60">Active</p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm text-center">
          <p className="text-lg sm:text-2xl font-bold text-brown/40">
            {team.length - activeCount}
          </p>
          <p className="text-[10px] sm:text-xs text-brown/60">Hidden</p>
        </div>
      </div>

      {/* Team Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      ) : team.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FiUsers className="mx-auto text-brown/20 mb-4" size={48} />
          <p className="text-brown/60 font-medium mb-2">No team members yet</p>
          <p className="text-brown/40 text-sm mb-6">
            Add your first team member to display on the website
          </p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 bg-olive text-ivory px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-olive/90 transition-colors"
          >
            <FiPlus size={18} /> Add First Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {team.map((member) => (
            <div
              key={member._id}
              className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all ${
                !member.isActive ? "opacity-60" : ""
              }`}
            >
              {/* Image */}
              <div className="relative pt-6 pb-2 bg-gradient-to-br from-wheat/50 to-gold/10">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/150?text=No+Image";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-wheat">
                      <FiImage className="text-brown/20" size={32} />
                    </div>
                  )}
                </div>
                {/* Order Badge */}
                <span className="absolute top-2 left-2 bg-brown/70 text-white px-2 py-0.5 rounded-md text-xs font-medium">
                  #{member.order + 1}
                </span>
                {/* Status Badge */}
                <span
                  className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-xs font-medium ${
                    member.isActive
                      ? "bg-olive/90 text-white"
                      : "bg-brown/50 text-white"
                  }`}
                >
                  {member.isActive ? "Active" : "Hidden"}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-display font-semibold text-brown mb-0.5 truncate">
                  {member.name}
                </h3>
                <p className="text-olive text-sm mb-3">{member.role}</p>

                {member.bio && (
                  <p className="text-brown/60 text-xs line-clamp-2 mb-3">
                    {member.bio}
                  </p>
                )}

                {/* Social Links */}
                {(member.socialLinks?.linkedin ||
                  member.socialLinks?.twitter ||
                  member.socialLinks?.email) && (
                  <div className="flex gap-2 mb-4">
                    {member.socialLinks.linkedin && (
                      <a
                        href={member.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors"
                      >
                        <FiLinkedin size={14} />
                      </a>
                    )}
                    {member.socialLinks.twitter && (
                      <a
                        href={member.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 bg-sky-100 rounded-lg flex items-center justify-center text-sky-500 hover:bg-sky-200 transition-colors"
                      >
                        <FiTwitter size={14} />
                      </a>
                    )}
                    {member.socialLinks.email && (
                      <a
                        href={`mailto:${member.socialLinks.email}`}
                        className="w-7 h-7 bg-gold/20 rounded-lg flex items-center justify-center text-gold hover:bg-gold/30 transition-colors"
                      >
                        <FiMail size={14} />
                      </a>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(member._id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      member.isActive
                        ? "bg-brown/5 text-brown/70 hover:bg-brown/10"
                        : "bg-olive/10 text-olive hover:bg-olive/20"
                    }`}
                    title={member.isActive ? "Hide" : "Show"}
                  >
                    {member.isActive ? (
                      <FiEyeOff size={14} />
                    ) : (
                      <FiEye size={14} />
                    )}
                    {member.isActive ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => openModal(member)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gold/10 text-gold rounded-lg text-xs font-medium hover:bg-gold/20 transition-colors"
                  >
                    <FiEdit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-brown/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-wheat px-5 py-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-brown">
                {editMember ? "Edit Team Member" : "Add Team Member"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-ivory rounded-lg transition-colors"
              >
                <FiX size={20} className="text-brown/60" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Image Preview */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-wheat to-gold/20 overflow-hidden flex-shrink-0">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/150?text=Invalid";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiImage className="text-brown/20" size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-brown mb-1">
                    Profile Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2.5 bg-ivory border border-wheat rounded-xl text-sm focus:outline-none focus:border-olive"
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-brown file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-olive/10 file:text-olive hover:file:bg-olive/20"
                      disabled={uploading}
                    />
                    {uploading && (
                      <span className="text-xs text-brown/50">
                        Uploading...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-brown mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter full name"
                  required
                  className="w-full px-4 py-2.5 bg-ivory border border-wheat rounded-xl text-sm focus:outline-none focus:border-olive"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-brown mb-1">
                  Role/Position <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  placeholder="e.g., Founder & CEO"
                  required
                  className="w-full px-4 py-2.5 bg-ivory border border-wheat rounded-xl text-sm focus:outline-none focus:border-olive"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-brown mb-1">
                  Bio (Optional)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Brief description about the team member..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-ivory border border-wheat rounded-xl text-sm focus:outline-none focus:border-olive resize-none"
                />
              </div>

              {/* Display Order */}
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
                  min="0"
                  className="w-full px-4 py-2.5 bg-ivory border border-wheat rounded-xl text-sm focus:outline-none focus:border-olive"
                />
                <p className="text-xs text-brown/50 mt-1">
                  Lower numbers appear first
                </p>
              </div>

              {/* Social Links */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-brown">
                  Social Links (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <FiLinkedin
                    className="text-blue-600 flex-shrink-0"
                    size={18}
                  />
                  <input
                    type="url"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: {
                          ...formData.socialLinks,
                          linkedin: e.target.value,
                        },
                      })
                    }
                    placeholder="LinkedIn URL"
                    className="flex-1 px-4 py-2 bg-ivory border border-wheat rounded-xl text-sm focus:outline-none focus:border-olive"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <FiTwitter className="text-sky-500 flex-shrink-0" size={18} />
                  <input
                    type="url"
                    value={formData.socialLinks.twitter}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: {
                          ...formData.socialLinks,
                          twitter: e.target.value,
                        },
                      })
                    }
                    placeholder="Twitter URL"
                    className="flex-1 px-4 py-2 bg-ivory border border-wheat rounded-xl text-sm focus:outline-none focus:border-olive"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <FiMail className="text-gold flex-shrink-0" size={18} />
                  <input
                    type="email"
                    value={formData.socialLinks.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: {
                          ...formData.socialLinks,
                          email: e.target.value,
                        },
                      })
                    }
                    placeholder="Email address"
                    className="flex-1 px-4 py-2 bg-ivory border border-wheat rounded-xl text-sm focus:outline-none focus:border-olive"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 border border-wheat rounded-xl text-brown/70 font-medium hover:bg-ivory transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.name || !formData.role}
                  className="flex-1 py-2.5 bg-olive text-ivory rounded-xl font-medium hover:bg-olive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving
                    ? "Saving..."
                    : editMember
                      ? "Update Member"
                      : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeam;
