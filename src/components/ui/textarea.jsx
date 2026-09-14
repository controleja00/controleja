import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<textarea
      className={cn(
        "flex min-h-[116px] w-full rounded-xl border border-[#cbd4e3] bg-gradient-to-b from-white to-[#f6f8fc] px-4 py-3 text-base font-medium leading-relaxed text-[#172441] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_1px_2px_rgba(23,36,65,0.04)] placeholder:font-medium placeholder:text-[#778096] transition-[border-color,box-shadow,background-color] hover:border-[#8096bc] focus-visible:border-[#1f3258] focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#8096bc]/20 disabled:cursor-not-allowed disabled:bg-[#edf0f6] disabled:text-[#778096] disabled:opacity-70 md:text-sm",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Textarea.displayName = "Textarea"

export { Textarea }
