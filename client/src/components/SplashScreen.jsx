import { useEffect, useState } from "react";
import logo from "../../../logo/logo.png";

const SplashScreen = ({ onComplete, duration = 900 }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, duration - 200);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-ivory transition-opacity duration-200 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center animate-pulse">
        <img
          src={logo}
          alt="UrbanKisan"
          className="w-28 h-28 sm:w-36 sm:h-36 object-contain"
        />
        <p className="mt-4 text-olive font-display font-bold text-xl sm:text-2xl">
          UrbanKisan
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
