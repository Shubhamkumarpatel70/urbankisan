import { useState } from "react";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend,
  FiClock,
  FiMessageCircle,
} from "react-icons/fi";
import axios from "axios";
import { useToast } from "../components/Toast";

const Contact = () => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      addToast("Please fill in all required fields", "error");
      return;
    }

    setSending(true);
    try {
      await axios.post("/api/contact", formData);
      addToast(
        "Message sent successfully! We'll get back to you soon.",
        "success",
      );
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      addToast(
        error.response?.data?.message || "Failed to send message",
        "error",
      );
    } finally {
      setSending(false);
    }
  };

  const contactInfo = [
    {
      icon: FiMapPin,
      title: "Visit Us",
      details: ["123 Farm Road, Andheri West", "Mumbai, Maharashtra 400058"],
    },
    {
      icon: FiPhone,
      title: "Call Us",
      details: ["+91 98765 43210", "+91 22 1234 5678"],
    },
    {
      icon: FiMail,
      title: "Email Us",
      details: ["hello@urbankisan.com", "support@urbankisan.com"],
    },
    {
      icon: FiClock,
      title: "Working Hours",
      details: ["Mon - Sat: 9:00 AM - 8:00 PM", "Sunday: 10:00 AM - 6:00 PM"],
    },
  ];

  const faqs = [
    {
      q: "How can I track my order?",
      a: "You can track your order using the Order ID sent to your email or by visiting the 'Track Order' page.",
    },
    {
      q: "What is your return policy?",
      a: "We offer easy returns within 24 hours of delivery for perishable items and 7 days for non-perishable products.",
    },
    {
      q: "Do you deliver to my area?",
      a: "We currently deliver to 20+ cities across India. Enter your pincode during checkout to confirm availability.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-olive/10 to-gold/10 py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-brown mb-4">
            Get in <span className="text-olive">Touch</span>
          </h1>
          <p className="text-brown/70 text-base sm:text-lg max-w-xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="max-w-6xl mx-auto px-4 -mt-6 sm:-mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {contactInfo.map((info, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-4 sm:p-5 shadow-md hover:shadow-lg transition-shadow text-center"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-olive/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <info.icon className="text-olive" size={20} />
              </div>
              <h3 className="font-display font-semibold text-brown mb-2 text-sm sm:text-base">
                {info.title}
              </h3>
              {info.details.map((detail, i) => (
                <p key={i} className="text-brown/60 text-xs sm:text-sm">
                  {detail}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="section-padding">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Form */}
            <div className="bg-white rounded-2xl shadow-md p-5 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-olive/10 rounded-full flex items-center justify-center">
                  <FiMessageCircle className="text-olive" size={20} />
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-brown">
                  Send a Message
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brown mb-1.5">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown mb-1.5">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message..."
                    rows={5}
                    className="input-field resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sending ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message <FiSend size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map & FAQs */}
            <div className="space-y-6">
              {/* Map Placeholder */}
              <div className="bg-wheat rounded-2xl h-48 sm:h-64 flex items-center justify-center overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109995709657!3d19.08219783958221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1677123456789!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="UrbanKisan Location"
                  className="rounded-2xl"
                />
              </div>

              {/* FAQs */}
              <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6">
                <h3 className="font-display text-lg sm:text-xl font-bold text-brown mb-4">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="border-b border-wheat pb-4 last:border-0 last:pb-0"
                    >
                      <p className="font-medium text-brown text-sm sm:text-base mb-1">
                        {faq.q}
                      </p>
                      <p className="text-brown/60 text-xs sm:text-sm">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
