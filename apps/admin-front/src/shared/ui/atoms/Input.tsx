import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => {
  return (
    <div className="flex flex-col gap-2 w-full group">
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral/40 ml-1 group-focus-within:text-primary transition-colors">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`
            w-full bg-neutral-50/50 backdrop-blur-sm 
            border-[0.5px] border-neutral-200 rounded-2xl 
            px-5 py-4 text-sm text-neutral 
            placeholder:text-neutral/30 outline-none
            transition-all duration-300
            focus:border-primary/50 focus:bg-white focus:shadow-[0_10px_20px_rgba(0,0,0,0.03)]
            hover:border-neutral-300
            ${error ? 'border-red-500/50 bg-red-500/5' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
            {error}
          </span>
        )}
      </div>
    </div>
  );
};
