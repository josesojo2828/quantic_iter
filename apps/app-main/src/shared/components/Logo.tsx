import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo = ({ className = '', size = 48 }: LogoProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Gear Ring */}
      <path
        d="M50 10L55 18H45L50 10ZM80 20L78 30L68 25L80 20ZM90 50L82 45V55L90 50ZM80 80L82 70L72 75L80 80ZM50 90L45 82H55L50 90ZM20 80L22 70L32 75L20 80ZM10 50L18 55V45L10 50ZM20 20L22 30L32 25L20 20Z"
        fill="currentColor"
        className="text-primary"
      />
      
      {/* Main Q Circle / Gear Body */}
      <circle
        cx="50"
        cy="50"
        r="32"
        stroke="currentColor"
        strokeWidth="8"
        className="text-primary"
      />
      
      {/* The Piston / Q Tail */}
      <path
        d="M72 72L88 88M82 72L88 78M72 82L78 88"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        className="text-primary"
      />
      
      {/* Inner Detail - Mechanical Nut */}
      <path
        d="M50 38L60.3923 44V56L50 62L39.6077 56V44L50 38Z"
        fill="currentColor"
        className="text-primary/20"
      />
    </svg>
  );
};
