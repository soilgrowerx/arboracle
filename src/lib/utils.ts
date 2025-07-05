import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Tree } from "@/types/tree"

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

  if (isNaN(plantedDate.getTime())) {
    return {
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      displayText: 'Unknown age'
    };
  }
  
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

export function generatePlusCode(lat: number, lng: number): { global: string; local: string } {
  try {
    const { encode } = require('open-location-code');
    const global = encode(lat, lng);
    const local = encode(lat, lng, 10); // 10-character code for local precision
    
    return {
      global,
      local: local.substring(4) // Remove the area code for local
    };
  } catch (error) {
    console.error('Error generating Plus Code:', error);
    return {
      global: '',
      local: ''
    };
  }
}

export function getTreeIcon(tree: Tree): string {
  const age = calculateTreeAge(tree.date_planted);

  // Define icon based on health status and age
  let iconColor = 'green'; // Default for healthy, mature trees

  if (tree.health_status === 'Poor' || tree.health_status === 'Dead') {
    iconColor = 'red';
  } else if (tree.health_status === 'Fair') {
    iconColor = 'orange';
  } else if (age.years < 1) {
    iconColor = 'blue'; // Sprout/young tree
  } else if (age.years < 5) {
    iconColor = 'purple'; // Sapling
  }

  // Using Google Maps default marker colors for simplicity. 
  // In a real app, you'd use custom SVG or PNG icons.
  // For example: `http://maps.google.com/mapfiles/ms/icons/${iconColor}-dot.png`
  return `http://maps.google.com/mapfiles/ms/icons/${iconColor}-dot.png`;
}
