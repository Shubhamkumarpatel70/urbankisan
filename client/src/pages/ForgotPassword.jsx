import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMail,
  FiArrowLeft,
  FiCheck,
  FiUser,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import axios from "axios";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userFound, setUserFound] = useState(false);
  const [userData, setUserData] = useState({ name: "", email: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });
  const [success, setSuccess] = useState(false);

  // Step 1: Check email
  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post("/api/users/check-email", { email });
      if (data.found) {
        setUserData({ name: data.name, email: data.email });
        setUserFound(true);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Update password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!passwords.password || !passwords.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (passwords.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (passwords.password !== passwords.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/users/direct-reset-password", {
        email: userData.email,
        password: passwords.password,
      });
      setSuccess(true);
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Cancel and go back to email entry
  const handleCancel = () => {
    setUserFound(false);
    setUserData({ name: "", email: "" });
    setPasswords({ password: "", confirmPassword: "" });
    setError("");
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-6 sm:py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-olive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="text-olive" size={32} />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-brown mb-3">
              Password Updated!
            </h1>
            <p className="text-brown/60 mb-6">
              Your password has been successfully reset. You can now login with
              your new password.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="btn-primary inline-block"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User found - show password reset form
  if (userFound) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-6 sm:py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-olive rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FiLock className="text-ivory" size={24} />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-brown">
                Reset Password
              </h1>
              <p className="text-brown/60 mt-1.5 sm:mt-2 text-sm sm:text-base">
                Create a new password for your account
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            {/* User Info Display */}
            <div className="bg-ivory rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-olive/10 rounded-full flex items-center justify-center">
                  <FiUser className="text-olive" size={18} />
                </div>
                <div>
                  <p className="font-medium text-brown">{userData.name}</p>
                  <p className="text-sm text-brown/60">{userData.email}</p>
                </div>
              </div>
            </div>

            {/* Password Form */}
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div>
                <label className="block text-brown font-medium mb-2">
                  New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-brown/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwords.password}
                    onChange={(e) => {
                      setPasswords({ ...passwords, password: e.target.value });
                      setError("");
                    }}
                    placeholder="Enter new password"
                    className="w-full pl-12 pr-12 py-3 rounded-lg border border-wheat bg-ivory text-brown placeholder-brown/40 focus:outline-none focus:border-olive"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brown/40 hover:text-brown"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-brown font-medium mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-brown/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwords.confirmPassword}
                    onChange={(e) => {
                      setPasswords({
                        ...passwords,
                        confirmPassword: e.target.value,
                      });
                      setError("");
                    }}
                    placeholder="Confirm new password"
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-wheat bg-ivory text-brown placeholder-brown/40 focus:outline-none focus:border-olive"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-3 rounded-lg border-2 border-wheat text-brown font-medium hover:bg-wheat/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Initial state - email entry
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-6 sm:py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-olive rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FiMail className="text-ivory" size={24} />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-brown">
              Forgot Password?
            </h1>
            <p className="text-brown/60 mt-1.5 sm:mt-2 text-sm sm:text-base">
              Enter your email to reset your password
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleCheckEmail} className="space-y-6">
            <div>
              <label className="block text-brown font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-brown/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-wheat bg-ivory text-brown placeholder-brown/40 focus:outline-none focus:border-olive"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? "Checking..." : "Continue"}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-8">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-olive hover:text-olive/80 font-medium"
            >
              <FiArrowLeft /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
