import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateTreeAge(datePlanted: string): string {
  const plantedDate = new Date(datePlanted);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - plantedDate.getTime());
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (totalDays < 30) {
    return `${totalDays} days old`;
  } else if (totalDays < 365) {
    const months = Math.floor(totalDays / 30);
    return `${months} months old`;
  } else {
    const years = Math.floor(totalDays / 365);
    const remainingMonths = Math.floor((totalDays % 365) / 30);
    return `${years} years, ${remainingMonths} months old`;
  }
}

export function getTreeIcon(age: string): string {
  if (age.includes('days old') || (age.includes('months old') && parseInt(age) < 6)) {
    return '/icons/tree-icon-sprout.png'; // Sprout for very young trees
  } else if (age.includes('months old') || (age.includes('years old') && parseInt(age) < 5)) {
    return '/icons/tree-icon-sapling.png'; // Sapling for young trees
  } else {
    return '/icons/tree-icon-mature.png'; // Mature for older trees
  }
}