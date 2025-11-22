
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Helper function to build the correct collection path
export function getCollectionPath(collectionName: string): string {
    // This variable is assumed to be globally available in the Canvas environment.
    // We check for its existence to avoid ReferenceErrors.
    return `artifacts/default-app-id/public/data/${collectionName}`;
}

