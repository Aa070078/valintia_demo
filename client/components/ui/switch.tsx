"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      dir="ltr"
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 outline-none p-0.5",
        "focus-visible:ring-2 focus-visible:ring-[#B88460]/40 focus-visible:ring-offset-1",
        "data-[size=default]:h-5 data-[size=default]:w-9",
        "data-[size=sm]:h-4 data-[size=sm]:w-7",
        "data-checked:bg-[#503C2C] data-unchecked:bg-[#E7DFD5] border data-checked:border-[#503C2C] data-unchecked:border-[#D8CDC0]",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-xs transition-transform duration-200",
          "group-data-[size=default]/switch:size-3.5 group-data-[size=default]/switch:data-checked:translate-x-4 group-data-[size=default]/switch:data-unchecked:translate-x-0",
          "group-data-[size=sm]/switch:size-3 group-data-[size=sm]/switch:data-checked:translate-x-3 group-data-[size=sm]/switch:data-unchecked:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
