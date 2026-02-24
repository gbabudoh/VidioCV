import React from "react";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "light" | "dark" | "default";
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ children, className = "", variant = "default", ...props }, ref) => {
    const baseClasses = "rounded-2xl border transition-all duration-300";

    const variantClasses = {
      default: "glass-panel",
      light: "glass",
      dark: "glass-dark",
    };

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

GlassPanel.displayName = "GlassPanel";
