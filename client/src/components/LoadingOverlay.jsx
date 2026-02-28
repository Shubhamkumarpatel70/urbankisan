import logo from "../../../logo/logo.png";

const LoadingOverlay = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ivory/95 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
          <img
            src={logo}
            alt="UrbanKisan"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain z-10"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-olive/20 border-t-olive rounded-full animate-spin"></div>
          </div>
        </div>
        {/* <p className="mt-4 text-brown/60 text-sm font-medium">Loading...</p> */}
      </div>
    </div>
  );
};

export default LoadingOverlay;
