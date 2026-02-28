import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const userId = user?._id || "guest";

    const [wishlistItems, setWishlistItems] = useState(() => {
        const saved = localStorage.getItem(`wishlistItems_${userId}`);
        return saved ? JSON.parse(saved) : [];
    });

    // Reload wishlist when user changes
    useEffect(() => {
        const saved = localStorage.getItem(`wishlistItems_${userId}`);
        setWishlistItems(saved ? JSON.parse(saved) : []);
    }, [userId]);

    useEffect(() => {
        localStorage.setItem(`wishlistItems_${userId}`, JSON.stringify(wishlistItems));
    }, [wishlistItems, userId]);

    const addToWishlist = (product) => {
        setWishlistItems((prev) => {
            if (prev.find((item) => item._id === product._id)) return prev;
            return [...prev, product];
        });
    };

    const removeFromWishlist = (productId) => {
        setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
    };

    const toggleWishlist = (product) => {
        if (isInWishlist(product._id)) {
            removeFromWishlist(product._id);
            return false;
        } else {
            addToWishlist(product);
            return true;
        }
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some((item) => item._id === productId);
    };

    const getWishlistCount = () => wishlistItems.length;

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                addToWishlist,
                removeFromWishlist,
                toggleWishlist,
                isInWishlist,
                getWishlistCount,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};
