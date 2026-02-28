import { useState, useEffect } from "react";
import { FiUser, FiMail, FiLock, FiMapPin, FiSave, FiCheck } from "react-icons/fi";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";

const UserSettings = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [loadingAddr, setLoadingAddr] = useState(true);

    const [profile, setProfile] = useState({
        name: user?.name || "",
        email: user?.email || "",
    });

    const [address, setAddress] = useState({
        street: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
    });

    const [passwords, setPasswords] = useState({
        current: "",
        newPass: "",
        confirm: "",
    });

    const [saving, setSaving] = useState({ profile: false, address: false, password: false });
    const [saved, setSaved] = useState({ profile: false, address: false, password: false });

    // Load saved address from DB
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const { data } = await axios.get("/api/users/profile");
                if (data.address && data.address.street) {
                    setAddress({
                        street: data.address.street || "",
                        city: data.address.city || "",
                        state: data.address.state || "",
                        pincode: data.address.pincode || "",
                        phone: data.address.phone || "",
                    });
                }
                if (data.name) setProfile({ name: data.name, email: data.email });
            } catch (err) {
                // ignore
            } finally {
                setLoadingAddr(false);
            }
        };
        loadProfile();
    }, []);

    const handleProfileSave = async (e) => {
        e.preventDefault();
        if (!profile.name || !profile.email) {
            addToast("Name and email are required", "error");
            return;
        }
        setSaving({ ...saving, profile: true });
        try {
            await axios.put("/api/users/profile", {
                name: profile.name,
                email: profile.email,
            });
            addToast("Profile updated successfully!", "success");
            setSaved({ ...saved, profile: true });
            setTimeout(() => setSaved((s) => ({ ...s, profile: false })), 2000);
        } catch (error) {
            addToast(error.response?.data?.message || "Failed to update profile", "error");
        } finally {
            setSaving((s) => ({ ...s, profile: false }));
        }
    };

    const handleAddressSave = async (e) => {
        e.preventDefault();
        if (!address.street || !address.city || !address.state || !address.pincode) {
            addToast("Please fill all required address fields", "error");
            return;
        }
        setSaving({ ...saving, address: true });
        try {
            await axios.put("/api/users/profile", { address });
            addToast("Address saved successfully!", "success");
            setSaved({ ...saved, address: true });
            setTimeout(() => setSaved((s) => ({ ...s, address: false })), 2000);
        } catch (error) {
            addToast(error.response?.data?.message || "Failed to save address", "error");
        } finally {
            setSaving((s) => ({ ...s, address: false }));
        }
    };

    const handlePasswordSave = async (e) => {
        e.preventDefault();
        if (!passwords.current || !passwords.newPass || !passwords.confirm) {
            addToast("All password fields are required", "error");
            return;
        }
        if (passwords.newPass !== passwords.confirm) {
            addToast("New passwords don't match", "error");
            return;
        }
        if (passwords.newPass.length < 6) {
            addToast("Password must be at least 6 characters", "error");
            return;
        }
        setSaving({ ...saving, password: true });
        try {
            await axios.put("/api/users/profile", { password: passwords.newPass });
            addToast("Password changed successfully!", "success");
            setPasswords({ current: "", newPass: "", confirm: "" });
            setSaved({ ...saved, password: true });
            setTimeout(() => setSaved((s) => ({ ...s, password: false })), 2000);
        } catch (error) {
            addToast(error.response?.data?.message || "Failed to change password", "error");
        } finally {
            setSaving((s) => ({ ...s, password: false }));
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <h2 className="font-display text-2xl font-bold text-brown">Account Settings</h2>

            {/* Profile Section */}
            <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-olive/10 rounded-xl flex items-center justify-center">
                        <FiUser className="text-olive" size={20} />
                    </div>
                    <div>
                        <h3 className="font-display font-semibold text-brown">Profile Information</h3>
                        <p className="text-xs text-brown/50">Update your name and email</p>
                    </div>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-brown mb-1">Full Name</label>
                        <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="input-field"
                            placeholder="Your name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brown mb-1">Email Address</label>
                        <div className="relative">
                            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-brown/40" size={16} />
                            <input
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                className="input-field pl-10"
                                placeholder="your@email.com"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={saving.profile}
                        className="flex items-center gap-2 bg-olive text-ivory px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-olive/90 transition-colors active:scale-95 disabled:opacity-60"
                    >
                        {saved.profile ? <><FiCheck size={16} /> Saved!</> : saving.profile ? "Saving..." : <><FiSave size={16} /> Save Changes</>}
                    </button>
                </form>
            </div>

            {/* Address Section */}
            <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center">
                        <FiMapPin className="text-gold" size={20} />
                    </div>
                    <div>
                        <h3 className="font-display font-semibold text-brown">Shipping Address</h3>
                        <p className="text-xs text-brown/50">Default delivery address</p>
                    </div>
                </div>

                {loadingAddr ? (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-10 bg-wheat/30 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <form onSubmit={handleAddressSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-brown mb-1">Street Address</label>
                            <input
                                type="text"
                                value={address.street}
                                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                className="input-field"
                                placeholder="123 Main Street, Apt 4B"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-brown mb-1">City</label>
                                <input
                                    type="text"
                                    value={address.city}
                                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                    className="input-field"
                                    placeholder="Mumbai"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brown mb-1">State</label>
                                <input
                                    type="text"
                                    value={address.state}
                                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                    className="input-field"
                                    placeholder="Maharashtra"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-brown mb-1">Pincode</label>
                                <input
                                    type="text"
                                    value={address.pincode}
                                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                                    className="input-field"
                                    placeholder="400001"
                                    maxLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brown mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={address.phone}
                                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                                    className="input-field"
                                    placeholder="9876543210"
                                    maxLength={10}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={saving.address}
                            className="flex items-center gap-2 bg-olive text-ivory px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-olive/90 transition-colors active:scale-95 disabled:opacity-60"
                        >
                            {saved.address ? <><FiCheck size={16} /> Saved!</> : saving.address ? "Saving..." : <><FiSave size={16} /> Save Address</>}
                        </button>
                    </form>
                )}
            </div>

            {/* Password Section */}
            <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                        <FiLock className="text-red-500" size={20} />
                    </div>
                    <div>
                        <h3 className="font-display font-semibold text-brown">Change Password</h3>
                        <p className="text-xs text-brown/50">Update your account password</p>
                    </div>
                </div>

                <form onSubmit={handlePasswordSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-brown mb-1">Current Password</label>
                        <input
                            type="password"
                            value={passwords.current}
                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                            className="input-field"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brown mb-1">New Password</label>
                        <input
                            type="password"
                            value={passwords.newPass}
                            onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                            className="input-field"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brown mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                            className="input-field"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={saving.password}
                        className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-red-600 transition-colors active:scale-95 disabled:opacity-60"
                    >
                        {saved.password ? <><FiCheck size={16} /> Changed!</> : saving.password ? "Updating..." : <><FiLock size={16} /> Change Password</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserSettings;
