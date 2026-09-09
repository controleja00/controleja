import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<textarea
      className={cn(
        "flex min-h-[88px] w-full rounded-lg border border-[#efefef] bg-[#fbfaf8] px-3 py-2 text-base text-[#0f161e] placeholder:text-[#6f7073] transition-colors focus-visible:outline-none focus-visible:border-[#004038] focus-visible:ring-2 focus-visible:ring-[#004038]/10 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Textarea.displayName = "Textarea"

export { Textarea }
