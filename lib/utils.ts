import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createHash } from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const getGravatarUrl = (email: string, size: number = 200): string => {
  // Trim and lowercase the email
  const trimmedEmail = email.trim().toLowerCase();

  // Create MD5 hash
  const hash = createHash("md5").update(trimmedEmail).digest("hex");


  return `https://www.gravatar.com/avatar/${hash}.jpg?d=identicon&s=${size}`;
};