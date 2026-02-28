import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import SplashScreen from "../components/SplashScreen";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      setShowSplash(true);
    } else {
      setError(result.message);
    }
  };

  const handleSplashComplete = () => {
    navigate("/");
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} duration={900} />;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-6 sm:py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-olive rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-ivory font-display font-bold text-xl sm:text-2xl">
                U
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-brown">
              Welcome Back
            </h1>
            <p className="text-brown/60 mt-1.5 sm:mt-2 text-sm sm:text-base">
              Sign in to continue shopping
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
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-brown/40" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-wheat bg-ivory text-brown placeholder-brown/40 focus:outline-none focus:border-olive"
                />
              </div>
            </div>

            <div>
              <label className="block text-brown font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-brown/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-wheat text-olive focus:ring-olive"
                />
                <span className="text-sm text-brown/70">Remember me</span>
              </label>
              <a href="#" className="text-sm text-olive hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-brown/60 mt-8">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-olive font-medium hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
