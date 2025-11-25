
// This file is no longer the single source of truth for categories.
// Categories are now managed dynamically in the database via the "Incident Types Manager".
// The "incidentTypes" collection now represents both categories (items without a parentId)
// and incident types (items with a parentId).
// This file is kept for now to avoid breaking existing imports, but new code
// should fetch categories from the database.

export const incidentCategories = [
    "Crime",
    "Fire",
    "Road Accident",
    "Medical Emergency",
    "Power Outage",
    "Water Leakage",
    "Hazardous Material",
    "Public Disturbance",
    "Election",
    "Political Violence",
    "Voter Safety",
    "Logistics Disruption",
    "Other",
];
