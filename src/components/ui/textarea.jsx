import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<textarea
      className={cn(
        "flex min-h-[88px] w-full rounded-lg border border-[#e1e5ed] bg-[#f6f8fc] px-3 py-2 text-base text-[#172441] placeholder:text-[#778096] transition-colors focus-visible:outline-none focus-visible:border-[#1f3258] focus-visible:ring-2 focus-visible:ring-[#1f3258]/10 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Textarea.displayName = "Textarea"

export { Textarea }
