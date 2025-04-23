import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility to merge Tailwind classes with conditional logic
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fetch EKS clusters from AWS API Gateway endpoint
export async function fetchClusters() {
  const response = await fetch('https://buds86mpe8.execute-api.us-east-1.amazonaws.com/default/AIFlexListEKS');
  if (!response.ok) throw new Error('Failed to fetch clusters');
  
  const data = await response.json();
  return data.List_of_clusters_clusters;
}
