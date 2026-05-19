import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo = ({ className = '', size = 48 }: LogoProps) => {
  return (
    <img
      src="/assets/logo_iter_vector.svg"
      alt="ITER Logo"
      width={size}
      height={size}
      className={`${className} drop-shadow-[0_10px_20px_rgba(99,102,241,0.06)]`}
    />
  );
};
