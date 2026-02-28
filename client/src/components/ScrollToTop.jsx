import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FiArrowUp } from "react-icons/fi";

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { pathname } = useLocation();

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    // Show button on scroll
    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.scrollY > 400);
        };
        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-50 w-12 h-12 bg-olive text-ivory rounded-full shadow-lg flex items-center justify-center hover:bg-olive/90 transition-all duration-300 animate-fadeIn"
            aria-label="Scroll to top"
        >
            <FiArrowUp size={20} />
        </button>
    );
};

export default ScrollToTop;
