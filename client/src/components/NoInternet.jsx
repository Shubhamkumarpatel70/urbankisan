import { FiWifiOff, FiRefreshCw } from "react-icons/fi";
import logo from "../../../logo/logo.png";

const NoInternet = ({ onRetry }) => {
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-ivory">
      <div className="flex flex-col items-center text-center px-6 max-w-sm">
        <img
          src={logo}
          alt="UrbanKisan"
          className="w-24 h-24 sm:w-28 sm:h-28 object-contain opacity-50"
        />
        <div className="mt-6 w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <FiWifiOff className="text-red-500" size={28} />
        </div>
        <h2 className="mt-5 font-display text-xl sm:text-2xl font-bold text-brown">
          No Internet Connection
        </h2>
        <p className="mt-2 text-brown/60 text-sm sm:text-base">
          Please check your network connection and try again.
        </p>
        <button
          onClick={onRetry}
          className="mt-6 flex items-center gap-2 px-6 py-3 bg-olive text-ivory font-medium rounded-xl hover:bg-olive/90 transition-colors"
        >
          <FiRefreshCw size={18} />
          Try Again
        </button>
      </div>
    </div>
  );
};

export default NoInternet;
