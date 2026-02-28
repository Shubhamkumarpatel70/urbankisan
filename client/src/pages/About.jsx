import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FiHeart,
  FiTruck,
  FiShield,
  FiUsers,
  FiSun,
  FiAward,
  FiCheckCircle,
  FiPackage,
  FiHome,
  FiMapPin,
  FiClock,
  FiThumbsUp,
  FiLinkedin,
  FiTwitter,
  FiMail,
} from "react-icons/fi";

const About = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isTimelineVisible, setIsTimelineVisible] = useState(false);
  const [team, setTeam] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const timelineRef = useRef(null);

  // Fetch team members
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data } = await axios.get("/api/team");
        setTeam(data);
      } catch (error) {
        console.error("Error fetching team:", error);
      } finally {
        setTeamLoading(false);
      }
    };
    fetchTeam();
  }, []);

  // Auto-advance timeline animation
  useEffect(() => {
    if (!isTimelineVisible) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev >= 4 ? 0 : prev + 1));
    }, 2500);
    return () => clearInterval(interval);
  }, [isTimelineVisible]);

  // Intersection observer for timeline
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsTimelineVisible(true);
        }
      },
      { threshold: 0.3 },
    );
    if (timelineRef.current) {
      observer.observe(timelineRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const values = [
    {
      icon: FiSun,
      title: "Farm Fresh",
      description:
        "We source directly from local farmers, ensuring the freshest produce reaches your table.",
    },
    {
      icon: FiShield,
      title: "100% Organic",
      description:
        "All our products are certified organic, free from harmful pesticides and chemicals.",
    },
    {
      icon: FiTruck,
      title: "Fast Delivery",
      description:
        "Quick and reliable delivery to your doorstep, ensuring freshness is preserved.",
    },
    {
      icon: FiHeart,
      title: "Quality Assured",
      description:
        "Every product goes through strict quality checks before reaching you.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-olive/10 to-gold/10 py-12 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-brown mb-4">
            About <span className="text-olive">UrbanKisan</span>
          </h1>
          <p className="text-brown/70 text-base sm:text-lg max-w-2xl mx-auto">
            Bridging the gap between local farmers and urban families, bringing
            you the purest organic produce directly from the heart of Indian
            farmlands.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="section-padding">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-brown mb-4">
                Our Story
              </h2>
              <p className="text-brown/70 mb-4 text-sm sm:text-base">
                UrbanKisan was born from a simple idea: everyone deserves access
                to fresh, organic, and authentic Indian produce. In 2020, we
                started our journey with a handful of local farmers and a dream
                to transform how India shops for groceries.
              </p>
              <p className="text-brown/70 mb-4 text-sm sm:text-base">
                Today, we partner with over 500 farmers across India, helping
                them reach urban customers while ensuring you get the freshest,
                chemical-free produce at fair prices.
              </p>
              <p className="text-brown/70 text-sm sm:text-base">
                Every product in our store tells a story of dedication,
                tradition, and the timeless bond between the farmer and the
                earth.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600"
                alt="Farmer in field"
                className="rounded-2xl shadow-xl w-full h-64 sm:h-80 object-cover"
              />
              <div className="absolute -bottom-4 -right-4 bg-gold text-brown px-4 py-2 rounded-xl font-medium text-sm shadow-lg">
                Since 2020
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-brown text-center mb-8 sm:mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {values.map((value, idx) => (
              <div
                key={idx}
                className="bg-ivory rounded-xl p-4 sm:p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-olive/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <value.icon className="text-olive" size={24} />
                </div>
                <h3 className="font-display font-semibold text-brown mb-2 text-sm sm:text-base">
                  {value.title}
                </h3>
                <p className="text-brown/60 text-xs sm:text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Timeline */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-brown/[0.02] via-olive/5 to-gold/10 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4" ref={timelineRef}>
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-1.5 bg-olive/10 text-olive text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              Farm to Table
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-brown mb-4">
              How We Deliver to You
            </h2>
            <p className="text-brown/60 max-w-xl mx-auto text-sm sm:text-base">
              Experience our seamless 5-step journey that ensures freshness from
              harvest to your home
            </p>
          </div>

          {/* Animated Timeline */}
          <div className="relative">
            {/* Animated Progress Line - Desktop */}
            <div className="hidden lg:block absolute top-20 left-[10%] right-[10%] h-1.5 bg-wheat/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-olive via-gold to-olive rounded-full transition-all duration-700 ease-out"
                style={{ width: `${(activeStep + 1) * 20}%` }}
              />
            </div>

            {/* Timeline Steps */}
            <div className="grid lg:grid-cols-5 gap-6 lg:gap-2 relative">
              {[
                {
                  icon: FiSun,
                  title: "Farm Harvest",
                  description: "Hand-picked organic produce at peak freshness",
                  time: "Day 1",
                  color: "from-green-400 to-emerald-500",
                },
                {
                  icon: FiCheckCircle,
                  title: "Quality Check",
                  description: "3-tier inspection for purity & freshness",
                  time: "Day 1",
                  color: "from-blue-400 to-cyan-500",
                },
                {
                  icon: FiPackage,
                  title: "Eco Packing",
                  description: "Sustainable packaging that preserves quality",
                  time: "Day 1-2",
                  color: "from-amber-400 to-orange-500",
                },
                {
                  icon: FiTruck,
                  title: "Express Dispatch",
                  description: "Cold chain logistics for maximum freshness",
                  time: "Day 2",
                  color: "from-purple-400 to-violet-500",
                },
                {
                  icon: FiHome,
                  title: "Your Doorstep",
                  description: "Delivered with care, ready to enjoy!",
                  time: "Day 2-3",
                  color: "from-rose-400 to-pink-500",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`relative flex lg:flex-col items-start lg:items-center gap-4 lg:gap-0 group cursor-pointer transition-all duration-500 ${
                    isTimelineVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  }`}
                  style={{ transitionDelay: `${idx * 150}ms` }}
                  onClick={() => setActiveStep(idx)}
                >
                  {/* Step Indicator */}
                  <div className="relative z-10 flex-shrink-0">
                    {/* Pulse Ring */}
                    <div
                      className={`absolute inset-0 rounded-full transition-all duration-500 ${
                        activeStep === idx
                          ? "bg-olive/20 scale-150 animate-pulse"
                          : "scale-100 opacity-0"
                      }`}
                    />

                    {/* Main Circle */}
                    <div
                      className={`relative w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                        activeStep >= idx
                          ? "bg-gradient-to-br " +
                            item.color +
                            " shadow-xl scale-110"
                          : "bg-white shadow-md border-2 border-wheat group-hover:border-olive/30 group-hover:scale-105"
                      }`}
                    >
                      <item.icon
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-all duration-300 ${
                          activeStep >= idx
                            ? "text-white"
                            : "text-brown/40 group-hover:text-olive"
                        }`}
                      />
                    </div>

                    {/* Step Number Badge */}
                    <span
                      className={`absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-all duration-300 ${
                        activeStep >= idx
                          ? "bg-gold text-brown scale-110"
                          : "bg-white text-brown/50 border border-wheat"
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </div>

                  {/* Content Card */}
                  <div
                    className={`lg:mt-6 lg:text-center flex-1 lg:px-2 transition-all duration-500 ${
                      activeStep === idx ? "lg:-translate-y-2" : ""
                    }`}
                  >
                    <div
                      className={`lg:bg-white lg:rounded-xl lg:p-4 lg:shadow-sm lg:border transition-all duration-300 ${
                        activeStep === idx
                          ? "lg:border-olive/30 lg:shadow-lg"
                          : "lg:border-transparent lg:group-hover:border-wheat lg:group-hover:shadow-md"
                      }`}
                    >
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mb-2 ${
                          activeStep >= idx
                            ? "bg-olive/10 text-olive"
                            : "bg-brown/5 text-brown/40"
                        }`}
                      >
                        <FiClock className="inline-block w-3 h-3 mr-1" />
                        {item.time}
                      </span>
                      <h3
                        className={`font-display font-bold text-base sm:text-lg mb-1 transition-colors ${
                          activeStep >= idx ? "text-brown" : "text-brown/60"
                        }`}
                      >
                        {item.title}
                      </h3>
                      <p
                        className={`text-xs sm:text-sm leading-relaxed ${
                          activeStep >= idx ? "text-brown/70" : "text-brown/40"
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Connecting Line - Mobile */}
                  {idx < 4 && (
                    <div
                      className={`lg:hidden absolute left-[31px] top-[64px] w-0.5 h-[calc(100%+24px)] transition-all duration-500 ${
                        activeStep > idx
                          ? "bg-gradient-to-b from-olive to-gold"
                          : "bg-wheat/50"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step Dots Navigation */}
            <div className="flex justify-center gap-2 mt-10 lg:mt-12">
              {[0, 1, 2, 3, 4].map((step) => (
                <button
                  key={step}
                  onClick={() => setActiveStep(step)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeStep === step
                      ? "w-8 bg-olive"
                      : "w-2 bg-wheat hover:bg-gold"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Delivery Stats */}
          <div
            className={`mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-700 delay-300 ${
              isTimelineVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            {[
              { value: "24-48h", label: "Metro Delivery", icon: "🚀" },
              { value: "99.2%", label: "On-Time Rate", icon: "⏱️" },
              { value: "4.9★", label: "Delivery Rating", icon: "⭐" },
              { value: "100%", label: "Fresh Guarantee", icon: "🌿" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center border border-wheat/50 hover:border-olive/30 hover:shadow-lg transition-all duration-300 group"
              >
                <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">
                  {stat.icon}
                </span>
                <p className="text-xl sm:text-2xl font-bold text-olive mb-0.5">
                  {stat.value}
                </p>
                <p className="text-xs text-brown/60">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Delivery Promise Card */}
          <div
            className={`mt-14 sm:mt-20 relative transition-all duration-700 delay-500 ${
              isTimelineVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-12 opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-olive/20 via-gold/20 to-olive/20 rounded-3xl blur-xl" />
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-10 shadow-2xl border border-gold/20 overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-gold/10 to-transparent rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-olive/10 to-transparent rounded-full blur-2xl" />

              <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-olive to-olive/80 rounded-2xl flex items-center justify-center shadow-xl rotate-3 hover:rotate-0 transition-transform duration-300">
                    <FiThumbsUp className="text-white w-12 h-12 sm:w-14 sm:h-14" />
                  </div>
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-brown mb-3">
                    Our Freshness Guarantee
                  </h3>
                  <p className="text-brown/70 text-sm sm:text-base mb-4 max-w-xl">
                    We promise delivery within{" "}
                    <span className="text-olive font-bold text-lg">
                      24-48 hours
                    </span>{" "}
                    in metro cities and{" "}
                    <span className="text-olive font-bold text-lg">
                      3-5 days
                    </span>{" "}
                    for other locations. If you're not 100% satisfied, we'll
                    replace your order or give you a full refund!
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-8 h-8 bg-olive/10 rounded-full flex items-center justify-center">
                        <FiMapPin className="text-olive w-4 h-4" />
                      </span>
                      <span className="text-brown/80">Real-time Tracking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center">
                        <FiShield className="text-gold w-4 h-4" />
                      </span>
                      <span className="text-brown/80">100% Safe Packaging</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-8 h-8 bg-olive/10 rounded-full flex items-center justify-center">
                        <FiTruck className="text-olive w-4 h-4" />
                      </span>
                      <span className="text-brown/80">Free Delivery ₹499+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { value: "500+", label: "Partner Farmers" },
              { value: "50K+", label: "Happy Customers" },
              { value: "100+", label: "Products" },
              { value: "20+", label: "Cities Served" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="text-center p-4 sm:p-6 bg-white rounded-xl shadow-sm"
              >
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-olive">
                  {stat.value}
                </p>
                <p className="text-brown/60 text-xs sm:text-sm mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-gradient-to-br from-wheat/30 to-gold/10 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12">
            <span className="inline-block px-4 py-1.5 bg-olive/10 text-olive text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              Our People
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-brown mb-3">
              Meet Our Team
            </h2>
            <p className="text-brown/60 max-w-lg mx-auto text-sm sm:text-base">
              The passionate individuals behind UrbanKisan working to bring
              fresh produce to your doorstep
            </p>
          </div>
          {teamLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl h-72 animate-pulse"
                />
              ))}
            </div>
          ) : team.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <FiUsers className="mx-auto text-brown/20 mb-4" size={48} />
              <p className="text-brown/50">Team information coming soon!</p>
            </div>
          ) : (
            <div
              className={`grid gap-4 ${team.length === 1 ? "max-w-xs mx-auto" : team.length === 2 ? "grid-cols-2 max-w-md mx-auto" : team.length === 3 ? "grid-cols-2 sm:grid-cols-3 max-w-2xl mx-auto" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"}`}
            >
              {team.map((member, idx) => (
                <div
                  key={member._id || idx}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group pt-5 pb-4"
                >
                  {/* Image */}
                  <div className="flex justify-center mb-3">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-3 border-wheat shadow-md group-hover:border-olive/30 transition-colors duration-300">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML =
                              '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-olive/10 to-gold/20"><span class="text-2xl font-bold text-olive/40">' +
                              member.name.charAt(0) +
                              "</span></div>";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-olive/10 to-gold/20">
                          <span className="text-2xl font-bold text-olive/40">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-3 text-center">
                    <h3 className="font-display font-bold text-brown text-sm sm:text-base mb-0.5 truncate">
                      {member.name}
                    </h3>
                    <p className="text-olive text-xs font-medium">
                      {member.role}
                    </p>

                    {member.bio && (
                      <p className="text-brown/60 text-[10px] leading-relaxed mt-2 line-clamp-2 hidden sm:block">
                        {member.bio}
                      </p>
                    )}

                    {/* Social Links */}
                    {(member.socialLinks?.linkedin ||
                      member.socialLinks?.twitter ||
                      member.socialLinks?.email) && (
                      <div className="flex justify-center gap-2 mt-3">
                        {member.socialLinks.linkedin && (
                          <a
                            href={member.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all"
                          >
                            <FiLinkedin size={12} />
                          </a>
                        )}
                        {member.socialLinks.twitter && (
                          <a
                            href={member.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 bg-sky-50 rounded-full flex items-center justify-center text-sky-500 hover:bg-sky-100 hover:scale-110 transition-all"
                          >
                            <FiTwitter size={12} />
                          </a>
                        )}
                        {member.socialLinks.email && (
                          <a
                            href={`mailto:${member.socialLinks.email}`}
                            className="w-7 h-7 bg-gold/10 rounded-full flex items-center justify-center text-gold hover:bg-gold/20 hover:scale-110 transition-all"
                          >
                            <FiMail size={12} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding">
        <div className="max-w-3xl mx-auto text-center">
          <FiAward className="text-gold mx-auto mb-4" size={48} />
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-brown mb-4">
            Our Mission
          </h2>
          <p className="text-brown/70 text-base sm:text-lg">
            "To empower Indian farmers while delivering the purest organic
            produce to every urban household, creating a sustainable ecosystem
            where quality meets affordability."
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
