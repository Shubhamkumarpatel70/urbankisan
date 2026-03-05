import { useEffect, useState } from "react";
import axios from "axios";
import { FiUpload, FiCheck, FiImage } from "react-icons/fi";

const AdminSiteImages = () => {
  const [uploading, setUploading] = useState({
    homeBanner: false,
    ourStory: false,
  });
  const [preview, setPreview] = useState({ homeBanner: "", ourStory: "" });
  const [success, setSuccess] = useState({
    homeBanner: false,
    ourStory: false,
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data } = await axios.get("/api/settings/images");
      // Add cache buster to prevent browser caching
      const cacheBuster = `?t=${Date.now()}`;
      setPreview({
        homeBanner: data.homeBanner ? data.homeBanner + cacheBuster : "",
        ourStory: data.ourStory ? data.ourStory + cacheBuster : "",
      });
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setUploading((prev) => ({ ...prev, [type]: true }));
    setSuccess((prev) => ({ ...prev, [type]: false }));
    try {
      const { data } = await axios.post(
        `/api/settings/images/${type}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      // Add cache buster to force browser to load new image
      const newUrl = data.url + `?t=${Date.now()}`;
      setPreview((prev) => ({ ...prev, [type]: newUrl }));
      setSuccess((prev) => ({ ...prev, [type]: true }));
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess((prev) => ({ ...prev, [type]: false }));
      }, 3000);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="space-y-10 max-w-2xl mx-auto p-4">
      <h2 className="font-display text-2xl font-bold text-brown mb-6">
        Site Images
      </h2>
      {/* Home Banner */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h3 className="font-semibold text-brown mb-4">Home Banner</h3>
        <div className="mb-4">
          {preview.homeBanner ? (
            <img
              src={preview.homeBanner}
              alt="Home Banner"
              className="w-full max-h-56 object-cover rounded-lg border border-wheat"
            />
          ) : (
            <div className="w-full h-40 bg-wheat/30 rounded-lg border border-dashed border-wheat flex flex-col items-center justify-center">
              <FiImage className="text-brown/30 mb-2" size={32} />
              <span className="text-sm text-brown/50">No banner uploaded</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label
            className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${uploading.homeBanner ? "bg-brown/20 cursor-not-allowed" : "bg-olive text-ivory hover:bg-olive/90"}`}
          >
            <FiUpload size={16} />
            <span className="text-sm font-medium">
              {uploading.homeBanner ? "Uploading..." : "Upload Image"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, "homeBanner")}
              className="hidden"
              disabled={uploading.homeBanner}
            />
          </label>
          {success.homeBanner && (
            <span className="flex items-center gap-1 text-sm text-olive">
              <FiCheck size={16} /> Uploaded successfully!
            </span>
          )}
        </div>
      </div>
      {/* Our Story */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-brown mb-4">Our Story Image</h3>
        <div className="mb-4">
          {preview.ourStory ? (
            <img
              src={preview.ourStory}
              alt="Our Story"
              className="w-full max-h-56 object-cover rounded-lg border border-wheat"
            />
          ) : (
            <div className="w-full h-40 bg-wheat/30 rounded-lg border border-dashed border-wheat flex flex-col items-center justify-center">
              <FiImage className="text-brown/30 mb-2" size={32} />
              <span className="text-sm text-brown/50">No image uploaded</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label
            className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${uploading.ourStory ? "bg-brown/20 cursor-not-allowed" : "bg-olive text-ivory hover:bg-olive/90"}`}
          >
            <FiUpload size={16} />
            <span className="text-sm font-medium">
              {uploading.ourStory ? "Uploading..." : "Upload Image"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, "ourStory")}
              className="hidden"
              disabled={uploading.ourStory}
            />
          </label>
          {success.ourStory && (
            <span className="flex items-center gap-1 text-sm text-olive">
              <FiCheck size={16} /> Uploaded successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSiteImages;
