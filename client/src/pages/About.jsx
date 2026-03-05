import { useState, useEffect } from "react";
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
  FiThumbsUp,
  FiLinkedin,
  FiTwitter,
  FiMail,
} from "react-icons/fi";

const About = () => {
  const [team, setTeam] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [ourStoryImage, setOurStoryImage] = useState("");

  // Fetch team members and site images
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

    const fetchSiteImages = async () => {
      try {
        const { data } = await axios.get("/api/settings/images");
        if (data.ourStory) {
          setOurStoryImage(data.ourStory);
        }
      } catch (error) {
        console.error("Error fetching site images:", error);
      }
    };

    fetchTeam();
    fetchSiteImages();
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
                src={
                  ourStoryImage ||
                  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600"
                }
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
      <section className="py-16 sm:py-20 bg-ivory">
        <div className="max-w-6xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-olive/10 text-olive text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              Farm to Table
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-brown mb-3">
              How We Deliver to You
            </h2>
            <p className="text-brown/60 max-w-lg mx-auto text-sm sm:text-base">
              Our simple 5-step process ensures freshness from harvest to your
              doorstep
            </p>
          </div>

          {/* Timeline Steps */}
          <div className="grid md:grid-cols-5 gap-6 md:gap-4 relative">
            {/* Connecting Line - Desktop */}
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-wheat" />

            {[
              {
                icon: FiSun,
                title: "Farm Harvest",
                description: "Hand-picked at peak freshness",
                time: "Day 1",
              },
              {
                icon: FiCheckCircle,
                title: "Quality Check",
                description: "3-tier inspection process",
                time: "Day 1",
              },
              {
                icon: FiPackage,
                title: "Eco Packing",
                description: "Sustainable packaging",
                time: "Day 1-2",
              },
              {
                icon: FiTruck,
                title: "Express Dispatch",
                description: "Cold chain logistics",
                time: "Day 2",
              },
              {
                icon: FiHome,
                title: "Your Doorstep",
                description: "Delivered fresh to you",
                time: "Day 2-3",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex md:flex-col items-start md:items-center gap-4 md:gap-0"
              >
                {/* Step Circle */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border-2 border-olive flex items-center justify-center shadow-sm">
                    <item.icon className="w-7 h-7 md:w-8 md:h-8 text-olive" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-gold text-brown text-xs font-bold rounded-full flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>

                {/* Content */}
                <div className="md:mt-4 md:text-center">
                  <span className="text-[10px] font-semibold text-olive/70 uppercase tracking-wide">
                    {item.time}
                  </span>
                  <h3 className="font-display font-bold text-brown text-base mt-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-brown/60 mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "24-48h", label: "Metro Delivery", icon: "🚀" },
              { value: "99.2%", label: "On-Time Rate", icon: "⏱️" },
              { value: "4.9★", label: "Delivery Rating", icon: "⭐" },
              { value: "100%", label: "Fresh Guarantee", icon: "🌿" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-4 text-center border border-wheat"
              >
                <span className="text-xl mb-1 block">{stat.icon}</span>
                <p className="text-lg sm:text-xl font-bold text-olive">
                  {stat.value}
                </p>
                <p className="text-xs text-brown/60">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Delivery Promise */}
          <div className="mt-12 bg-white rounded-2xl p-6 sm:p-8 border border-wheat">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-olive rounded-xl flex items-center justify-center">
                  <FiThumbsUp className="text-white w-10 h-10" />
                </div>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-brown mb-2">
                  Our Freshness Guarantee
                </h3>
                <p className="text-brown/70 text-sm mb-4">
                  Delivery within{" "}
                  <span className="text-olive font-bold">24-48 hours</span> in
                  metro cities. Not satisfied? We'll replace it or give you a
                  full refund!
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-olive" />
                    <span className="text-brown/70">Real-time Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiShield className="text-gold" />
                    <span className="text-brown/70">Safe Packaging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiTruck className="text-olive" />
                    <span className="text-brown/70">Free Delivery ₹499+</span>
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
