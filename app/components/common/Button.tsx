import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-semibold rounded-xl transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F7B980]/50 cursor-pointer";

  const variants = {
    primary:
      "bg-gradient-to-r from-[#F7B980] to-[#F0A060] text-[#57595B] shadow-lg shadow-[#F7B980]/20 hover:shadow-[#F7B980]/30 hover:-translate-y-0.5",
    secondary: "bg-[#57595B] text-white shadow-lg shadow-[#57595B]/10 hover:shadow-[#57595B]/20 hover:-translate-y-0.5",
    outline:
      "border border-[#E0E4E3] text-[#57595B] bg-white/50 backdrop-blur-sm hover:border-[#F7B980] hover:text-[#F7B980] hover:bg-white/80",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
