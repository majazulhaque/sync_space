import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format the date to the desired format: March 15, 2024 - 10:00 AM
export const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString([], {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${formattedDate} - ${formattedTime}`;
};
