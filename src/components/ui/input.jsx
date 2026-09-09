import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    (<input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg border border-[#e1e5ed] bg-[#f6f8fc] px-3 py-2 text-base text-[#172441] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#172441] placeholder:text-[#778096] focus-visible:outline-none focus-visible:border-[#1f3258] focus-visible:ring-2 focus-visible:ring-[#1f3258]/10 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Input.displayName = "Input"

export { Input }
