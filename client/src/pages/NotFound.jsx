import { Link } from "react-router-dom";
import { FiHome, FiArrowLeft } from "react-icons/fi";
import logo from "../../../logo/logo.png";

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        {/* Logo */}
        <img
          src={logo}
          alt="UrbanKisan"
          className="w-28 h-28 sm:w-32 sm:h-32 mx-auto object-contain opacity-60"
        />

        {/* 404 Text */}
        <h1 className="mt-6 font-display text-7xl sm:text-8xl font-bold text-olive/80">
          404
        </h1>

        <h2 className="mt-4 font-display text-2xl sm:text-3xl font-bold text-brown">
          Page Not Found
        </h2>

        <p className="mt-3 text-brown/60 text-sm sm:text-base">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-olive text-ivory font-medium rounded-xl hover:bg-olive/90 transition-colors"
          >
            <FiHome size={18} />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 border border-wheat text-brown font-medium rounded-xl hover:bg-wheat transition-colors"
          >
            <FiArrowLeft size={18} />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-10 pt-8 border-t border-wheat">
          <p className="text-sm text-brown/50 mb-4">Popular pages</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/products" className="text-sm text-olive hover:underline">
              Products
            </Link>
            <span className="text-brown/30">•</span>
            <Link to="/about" className="text-sm text-olive hover:underline">
              About Us
            </Link>
            <span className="text-brown/30">•</span>
            <Link to="/contact" className="text-sm text-olive hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
