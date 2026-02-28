import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiHeart,
  FiPackage,
  FiSend,
} from "react-icons/fi";
import axios from "axios";
import logo from "../../../logo/logo.png";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMsg, setSubscribeMsg] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSubscribing(true);
    setSubscribeMsg("");
    try {
      const { data } = await axios.post("/api/newsletter/subscribe", { email });
      setSubscribeMsg(data.message);
      setEmail("");
    } catch (error) {
      setSubscribeMsg(error.response?.data?.message || "Failed to subscribe");
    } finally {
      setSubscribing(false);
      setTimeout(() => setSubscribeMsg(""), 3000);
    }
  };

  return (
    <footer className="bg-brown text-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <div className="flex items-center mb-4">
              <img
                src={logo}
                alt="UrbanKisan"
                className="w-28 h-28 object-contain"
              />
            </div>
            <p className="text-ivory/80 mb-4 text-sm max-w-md">
              Bringing farm-fresh, organic goodness directly to your doorstep.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="w-9 h-9 bg-ivory/10 rounded-full flex items-center justify-center text-ivory/60 hover:text-gold hover:bg-ivory/20 transition-colors"
              >
                <FiInstagram size={18} />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-ivory/10 rounded-full flex items-center justify-center text-ivory/60 hover:text-gold hover:bg-ivory/20 transition-colors"
              >
                <FiFacebook size={18} />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-ivory/10 rounded-full flex items-center justify-center text-ivory/60 hover:text-gold hover:bg-ivory/20 transition-colors"
              >
                <FiTwitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-base sm:text-lg font-semibold mb-4 text-gold">
              Shop
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/products"
                  className="text-ivory/80 hover:text-gold transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=organic"
                  className="text-ivory/80 hover:text-gold transition-colors"
                >
                  Organic
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=spices"
                  className="text-ivory/80 hover:text-gold transition-colors"
                >
                  Spices & Masalas
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=grains"
                  className="text-ivory/80 hover:text-gold transition-colors"
                >
                  Grains & Cereals
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="font-display text-base sm:text-lg font-semibold mb-4 text-gold">
              Account
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/profile"
                  className="text-ivory/80 hover:text-gold transition-colors flex items-center gap-1.5"
                >
                  My Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  className="text-ivory/80 hover:text-gold transition-colors flex items-center gap-1.5"
                >
                  <FiHeart size={12} /> Wishlist
                </Link>
              </li>
              <li>
                <Link
                  to="/track-order"
                  className="text-ivory/80 hover:text-gold transition-colors flex items-center gap-1.5"
                >
                  <FiPackage size={12} /> Track Order
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-ivory/80 hover:text-gold transition-colors"
                >
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-base sm:text-lg font-semibold mb-4 text-gold">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <FiMapPin
                  className="text-gold flex-shrink-0 mt-0.5"
                  size={14}
                />
                <span className="text-ivory/80">123 Farm Road, Mumbai</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiPhone className="text-gold" size={14} />
                <span className="text-ivory/80">+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiMail className="text-gold" size={14} />
                <span className="text-ivory/80">hello@urbankisan.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-b border-ivory/20 py-8 my-8">
          <div className="max-w-xl mx-auto text-center">
            <h4 className="font-display text-lg sm:text-xl font-semibold mb-2 text-gold">
              Subscribe to Our Newsletter
            </h4>
            <p className="text-ivory/70 text-sm mb-4">
              Get exclusive offers, organic tips, and new product updates
              delivered to your inbox.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <div className="flex-1 relative">
                <FiMail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-brown/40"
                  size={18}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-ivory/10 border border-ivory/20 text-ivory placeholder-ivory/50 focus:outline-none focus:border-gold focus:bg-ivory/20 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={subscribing}
                className="px-6 py-3 bg-gold text-brown font-medium rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {subscribing ? (
                  "Subscribing..."
                ) : (
                  <>
                    <FiSend size={16} /> Subscribe
                  </>
                )}
              </button>
            </form>
            {subscribeMsg && (
              <p
                className={`mt-3 text-sm ${subscribeMsg.includes("success") || subscribeMsg.includes("Successfully") ? "text-green-400" : "text-gold"}`}
              >
                {subscribeMsg}
              </p>
            )}
          </div>
        </div>

        <div className="text-center">
          <p className="text-ivory/60 text-sm">
            © 2026 UrbanKisan. All rights reserved. Made with ❤️ for organic
            living.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
