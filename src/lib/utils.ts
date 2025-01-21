import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const splitSpaceOrComma = (input:string) => input.split(/[ ,]+/)

export { 
  cn,
  splitSpaceOrComma,
}