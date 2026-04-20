import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-[0.2em] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-primary text-white shadow-[0_10px_20px_rgba(96,138,37,0.2)] hover:shadow-[0_15px_30px_rgba(96,138,37,0.3)] hover:-translate-y-0.5',
    secondary: 'bg-secondary text-neutral bg-gradient-to-br from-secondary to-secondary/80',
    outline: 'bg-transparent border-[0.5px] border-primary/40 text-primary hover:bg-primary/5',
    ghost: 'bg-transparent text-neutral/60 hover:text-neutral hover:bg-white/5',
  };

  const sizes = {
    sm: 'px-4 py-2 text-[10px] rounded-lg',
    md: 'px-8 py-4 text-xs rounded-xl',
    lg: 'px-10 py-5 text-sm rounded-2xl',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Procesando...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};
