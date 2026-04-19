import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "accent" | "danger" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-text-inverse hover:bg-primary-dark shadow-sm",
  secondary: "bg-surface text-text-primary border border-border hover:bg-surface-hover",
  accent: "bg-accent text-text-inverse hover:bg-accent-dark shadow-sm",
  danger: "bg-risk-high text-text-inverse hover:brightness-90",
  ghost: "bg-transparent text-text-primary hover:bg-surface-hover",
  outline: "bg-transparent text-primary border border-primary hover:bg-primary/5",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm rounded-radius-sm gap-1.5",
  md: "h-10 px-4 text-sm rounded-radius-sm gap-2 touch-target",
  lg: "h-12 px-6 text-base rounded-radius-md gap-2 touch-target-lg",
  icon: "h-10 w-10 rounded-radius-sm touch-target",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center
          font-medium whitespace-nowrap
          transition-colors duration-150
          cursor-pointer select-none
          disabled:opacity-50 disabled:pointer-events-none
          active:scale-[0.98]
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
