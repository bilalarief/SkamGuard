import { forwardRef, type HTMLAttributes } from "react";

type CardVariant = "default" | "elevated" | "outlined" | "ghost";

const variantStyles: Record<CardVariant, string> = {
  default: "bg-surface border border-border",
  elevated: "bg-surface border border-border shadow-sm hover:shadow-md transition-shadow duration-150",
  outlined: "bg-transparent border-2 border-primary/20",
  ghost: "bg-surface-hover/50",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", interactive = false, className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-radius-md
          ${variantStyles[variant]}
          ${interactive ? "cursor-pointer active:scale-[0.99] transition-all duration-150" : ""}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`p-4 pb-2 ${className}`} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`p-4 pt-0 ${className}`} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`p-4 pt-0 flex items-center ${className}`} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardContent, CardFooter };
