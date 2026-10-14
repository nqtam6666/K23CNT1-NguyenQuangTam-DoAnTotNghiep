import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text)] transition-colors outline-none placeholder:text-[var(--muted)]/75 focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/25 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55 aria-invalid:border-[var(--danger)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
