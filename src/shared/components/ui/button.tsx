import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        default: "bg-button text-button-foreground hover:opacity-90",

        destructive:
          "bg-destructive text-primary-foreground hover:bg-destructive/90",

        outline:
          "border border-border  text-foreground hover:bg-accent",

        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",

        ghost: "text-text-primary hover:bg-surface-hover hover:text-text-primary",

        link: "text-primary underline-offset-4 hover:underline",

        chat: "bg-button text-foreground hover:opacity-90 rounded-xl",

        retro: "btn-retro",

        type2: "btn-type2",

        brutal: "btn-brutal",
      },

      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3",
        md: "h-9 px-4 py-2",
        lg: "h-10 px-6",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
        full: "w-full h-14 px-6",
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


