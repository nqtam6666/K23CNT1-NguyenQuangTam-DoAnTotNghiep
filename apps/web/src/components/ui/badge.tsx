import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[var(--radius)] border px-2 py-0.5 font-mono text-[11px] font-semibold whitespace-nowrap transition-all [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/25",
        secondary:
          "bg-[var(--active-bg)] text-[var(--muted)] border-[var(--border)]",
        destructive:
          "bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger)]/25",
        outline:
          "border-[var(--border)] text-[var(--text)] bg-[var(--surface)]",
        ghost:
          "border-transparent bg-transparent text-[var(--muted)]",
        link: "border-transparent text-[var(--accent)] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
