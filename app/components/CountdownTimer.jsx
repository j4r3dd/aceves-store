'use client';

import { useState, useEffect } from 'react';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const difference = endOfDay - now;

      if (difference > 0) {
        return {
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }

      return { hours: 0, minutes: 0, seconds: 0 };
    };

    // Set initial time
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      <div className="flex flex-col items-center">
        <span className="text-2xl sm:text-4xl font-bold bg-white/20 rounded-lg px-3 py-2 min-w-[60px] sm:min-w-[80px] text-center">
          {formatNumber(timeLeft.hours)}
        </span>
        <span className="text-xs mt-1 opacity-80">Horas</span>
      </div>
      <span className="text-2xl sm:text-4xl font-bold">:</span>
      <div className="flex flex-col items-center">
        <span className="text-2xl sm:text-4xl font-bold bg-white/20 rounded-lg px-3 py-2 min-w-[60px] sm:min-w-[80px] text-center">
          {formatNumber(timeLeft.minutes)}
        </span>
        <span className="text-xs mt-1 opacity-80">Minutos</span>
      </div>
      <span className="text-2xl sm:text-4xl font-bold">:</span>
      <div className="flex flex-col items-center">
        <span className="text-2xl sm:text-4xl font-bold bg-white/20 rounded-lg px-3 py-2 min-w-[60px] sm:min-w-[80px] text-center">
          {formatNumber(timeLeft.seconds)}
        </span>
        <span className="text-xs mt-1 opacity-80">Segundos</span>
      </div>
    </div>
  );
}
