import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-tight transition-all duration-200 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/65 aria-invalid:ring-destructive/30 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_12px_20px_-15px_rgba(17,17,17,0.9)] hover:-translate-y-0.5 hover:bg-black",
        destructive:
          "bg-destructive text-white shadow-[0_12px_20px_-15px_rgba(229,72,77,0.95)] hover:-translate-y-0.5 hover:bg-destructive/90",
        outline:
          "border border-border bg-card text-foreground shadow-sm hover:-translate-y-0.5 hover:border-black/35 hover:bg-white",
        secondary:
          "bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:bg-secondary/80",
        ghost:
          "text-foreground hover:bg-black/5",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 rounded-xl px-6 text-[0.95rem] has-[>svg]:px-4",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
