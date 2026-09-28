import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(err: unknown): string | undefined {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null) {
    const candidate = (err as Record<string, unknown>).message;
    if (typeof candidate === "string") return candidate;
    const errorProp = (err as Record<string, unknown>).error;
    if (typeof errorProp === "string") return errorProp;
  }
  return undefined;
}
