import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[var(--radius)] border border-transparent bg-clip-padding font-sans text-[13px] font-semibold whitespace-nowrap transition-all outline-none select-none cursor-pointer hover:brightness-96 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:pointer-events-none disabled:opacity-55 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[var(--accent)] text-[var(--primary-foreground)] border-[var(--accent)] shadow-accent",
        primary: "bg-[var(--accent)] text-[var(--primary-foreground)] border-[var(--accent)] shadow-accent",
        outline:
          "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--active-bg)] hover:text-[var(--text)]",
        secondary:
          "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--active-bg)] hover:text-[var(--text)]",
        ghost:
          "hover:bg-[var(--active-bg)] hover:text-[var(--text)] text-[var(--muted)]",
        destructive:
          "bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger)] hover:brightness-95",
        danger:
          "bg-[var(--danger)] text-white border-[var(--danger)] hover:brightness-95",
        link: "text-[var(--accent)] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "py-[11px] px-[20px] gap-2",
        xs: "h-7 gap-1 rounded-[var(--radius)] px-2.5 text-xs",
        sm: "py-2 px-3.5 gap-1.5 rounded-[var(--radius)] text-xs",
        lg: "py-3 px-6 gap-2 rounded-[var(--radius)] text-sm",
        icon: "size-9",
        "icon-xs": "size-6 rounded-[var(--radius)]",
        "icon-sm": "size-8 rounded-[var(--radius)]",
        "icon-lg": "size-10 rounded-[var(--radius)]",
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
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
