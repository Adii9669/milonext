import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base — uses CSS --radius so light=pill, dark=rounded-xl automatically
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-sm font-bold uppercase tracking-widest transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-[var(--radius,9999px)]",
  {
    variants: {
      variant: {
        /** Solid primary-color button */
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover hover:shadow-[0_6px_20px_color-mix(in_srgb,var(--primary)_30%,transparent)] active:scale-[0.98]",

        destructive:
          "bg-destructive text-primary-foreground hover:bg-destructive/90",

        /** Outlined pill — "Learn More" style */
        outline:
          "border-2 border-foreground text-foreground bg-transparent hover:bg-foreground hover:text-background active:scale-[0.98]",

        secondary:
          "bg-surface-elevated text-foreground border border-border hover:bg-surface-hover",

        ghost:
          "text-text-primary hover:bg-surface-hover hover:text-text-primary",

        link: "text-primary underline-offset-4 hover:underline rounded-none",

        chat: "bg-primary text-primary-foreground hover:bg-primary-hover rounded-xl",

        /** Solid dark CTA — "Register Your Interest" style */
        retro: "btn-retro",

        /** Outlined ghost with accent-brand border */
        type2: "btn-type2",

        /** Neobrutalist */
        brutal: "btn-brutal",
      },

      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 text-xs",
        md: "h-10 px-6 py-2",
        lg: "h-12 px-8",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
        full: "w-full h-12 px-6",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
