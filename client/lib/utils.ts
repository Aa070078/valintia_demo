import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(err: unknown, _isRTL?: boolean): string | undefined {
  if (!err) return undefined;
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null) {
    const obj = err as Record<string, unknown>;
    
    // Check axios response data first
    const resData = (obj.response as Record<string, unknown> | undefined)?.data;
    if (resData && typeof resData === "object") {
      const resMsg = (resData as Record<string, unknown>).message;
      if (typeof resMsg === "string") return resMsg;
      if (Array.isArray(resMsg)) return resMsg.join(", ");
      const resErr = (resData as Record<string, unknown>).error;
      if (typeof resErr === "string") return resErr;
    }

    const candidate = obj.message;
    if (typeof candidate === "string") return candidate;
    if (Array.isArray(candidate)) return candidate.join(", ");

    const errorProp = obj.error;
    if (typeof errorProp === "string") return errorProp;
  }
  return undefined;
}
