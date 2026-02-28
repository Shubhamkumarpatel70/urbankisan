import { createContext, useContext, useState, useCallback } from "react";
import { FiCheck, FiX, FiInfo, FiAlertTriangle } from "react-icons/fi";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const ICONS = {
    success: FiCheck,
    error: FiX,
    info: FiInfo,
    warning: FiAlertTriangle,
};

const COLORS = {
    success: "bg-olive text-ivory",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
    warning: "bg-gold text-brown",
};

let toastId = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "success", duration = 3000) => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-[90vw] sm:max-w-sm">
                {toasts.map((toast) => {
                    const Icon = ICONS[toast.type];
                    return (
                        <div
                            key={toast.id}
                            className={`${COLORS[toast.type]} px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slideIn`}
                        >
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                <Icon size={14} />
                            </div>
                            <p className="text-sm font-medium flex-1">{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
                            >
                                <FiX size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};
