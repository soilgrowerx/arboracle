import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface TreeAge {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  displayText: string;
}

export function calculateTreeAge(datePlanted: string): TreeAge {
  const plantedDate = new Date(datePlanted);
  const currentDate = new Date();
  
  // Calculate the difference in milliseconds
  const diffInMs = currentDate.getTime() - plantedDate.getTime();
  const totalDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  // Calculate years, months, and remaining days
  let years = 0;
  let months = 0;
  let days = totalDays;
  
  // Calculate years
  years = Math.floor(days / 365);
  days = days % 365;
  
  // Calculate months (approximation)
  months = Math.floor(days / 30);
  days = days % 30;
  
  // Generate display text
  let displayText = '';
  if (years > 0) {
    displayText = `${years} year${years !== 1 ? 's' : ''}`;
    if (months > 0) {
      displayText += ` ${months} month${months !== 1 ? 's' : ''}`;
    }
  } else if (months > 0) {
    displayText = `${months} month${months !== 1 ? 's' : ''}`;
    if (days > 0) {
      displayText += ` ${days} day${days !== 1 ? 's' : ''}`;
    }
  } else {
    displayText = `${totalDays} day${totalDays !== 1 ? 's' : ''}`;
  }
  
  displayText += ' old';
  
  return {
    years,
    months,
    days,
    totalDays,
    displayText
  };
}
