import { useState } from "react";
import { FiX, FiCopy, FiCheck } from "react-icons/fi";

const ShareModal = ({ isOpen, onClose, product }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !product) return null;

    const url = window.location.origin + `/product/${product._id}`;
    const text = `Check out ${product.name} on UrbanKisan - ₹${product.price}!`;

    const shareOptions = [
        {
            name: "WhatsApp",
            icon: "💬",
            color: "bg-green-500",
            onClick: () =>
                window.open(
                    `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
                    "_blank"
                ),
        },
        {
            name: "Facebook",
            icon: "📘",
            color: "bg-blue-600",
            onClick: () =>
                window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                    "_blank"
                ),
        },
        {
            name: "Twitter",
            icon: "🐦",
            color: "bg-sky-500",
            onClick: () =>
                window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
                    "_blank"
                ),
        },
        {
            name: "Email",
            icon: "📧",
            color: "bg-gray-600",
            onClick: () =>
                window.open(
                    `mailto:?subject=${encodeURIComponent(product.name + " - UrbanKisan")}&body=${encodeURIComponent(text + "\n\n" + url)}`,
                    "_blank"
                ),
        },
    ];

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const input = document.createElement("input");
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: product.name, text, url });
            } catch {
                // User cancelled
            }
        }
    };

    return (
        <div
            className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div
                className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 animate-slideIn"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-xl font-semibold text-brown">
                        Share Product
                    </h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-wheat flex items-center justify-center text-brown hover:bg-wheat/80"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* Product Preview */}
                <div className="flex items-center gap-3 p-3 bg-ivory rounded-xl mb-6">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-brown text-sm truncate">
                            {product.name}
                        </p>
                        <p className="text-olive font-semibold text-sm">
                            ₹{product.price}
                        </p>
                    </div>
                </div>

                {/* Native Share (mobile) */}
                {navigator.share && (
                    <button
                        onClick={handleNativeShare}
                        className="w-full mb-4 py-3 bg-olive text-ivory rounded-xl font-medium hover:bg-olive/90 transition-colors"
                    >
                        Share via...
                    </button>
                )}

                {/* Share Options */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                    {shareOptions.map((option) => (
                        <button
                            key={option.name}
                            onClick={option.onClick}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-ivory transition-colors"
                        >
                            <div
                                className={`w-12 h-12 ${option.color} rounded-full flex items-center justify-center text-xl`}
                            >
                                {option.icon}
                            </div>
                            <span className="text-xs text-brown/70">{option.name}</span>
                        </button>
                    ))}
                </div>

                {/* Copy Link */}
                <div className="flex items-center gap-2 p-3 bg-ivory rounded-xl">
                    <input
                        type="text"
                        value={url}
                        readOnly
                        className="flex-1 bg-transparent text-sm text-brown/70 outline-none truncate"
                    />
                    <button
                        onClick={handleCopy}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${copied
                                ? "bg-olive text-ivory"
                                : "bg-gold text-brown hover:bg-gold/80"
                            }`}
                    >
                        {copied ? (
                            <>
                                <FiCheck size={14} /> Copied
                            </>
                        ) : (
                            <>
                                <FiCopy size={14} /> Copy
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
