import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import axios from "axios";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const { data } = await axios.get(`/api/users/reset-password/${token}`);
        if (data.valid) {
          setTokenValid(true);
          setEmail(data.email);
        }
      } catch (error) {
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };
    verifyToken();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`/api/users/reset-password/${token}`, {
        password: formData.password,
      });
      setSuccess(true);
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (validating) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-olive/20 border-t-olive rounded-full animate-spin mx-auto mb-4" />
          <p className="text-brown/60">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid/expired token
  if (!tokenValid) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-6 sm:py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle className="text-red-500" size={32} />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-brown mb-3">
              Invalid Reset Link
            </h1>
            <p className="text-brown/60 mb-6">
              This password reset link is invalid or has expired. Please request
              a new one.
            </p>
            <Link to="/forgot-password" className="btn-primary inline-block">
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              Password Reset!
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
              Create a new password for{" "}
              <span className="font-medium text-brown">{email}</span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-brown font-medium mb-2">
                New Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-brown/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-wheat bg-ivory text-brown placeholder-brown/40 focus:outline-none focus:border-olive"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-brown/60 mt-8">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-olive font-medium hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
