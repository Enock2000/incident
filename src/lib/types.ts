export type IncidentStatus =
  | 'Reported'
  | 'Verified'
  | 'Team Dispatched'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected'; // Added Rejected status

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical'; // Added Critical

export type UserRole =
  | 'citizen'
  | 'admin'
  | 'regionalAuthority'
  | 'responseUnit'
  | 'dataAnalyst';

export type Reporter = {
  isAnonymous: boolean;
  userId: string | null;
  name?: string; // This can be populated later from the user profile
};

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: UserRole;
  agencyId?: string;
};

export type InvestigationNote = {
    note: string;
    authorId: string;
    authorName: string;
    timestamp: any; // Firebase Timestamp
}

export type Incident = {
  id: string;
  title: string;
  description: string;
  location: string;
  status: IncidentStatus;
  priority: Priority;
  dateReported: any; // Using `any` for Firebase Timestamp
  reporter?: Reporter;
  media: string[];
  category: string;
  investigationNotes?: InvestigationNote[]; // Added investigation notes
  aiMetadata?: {
    suggestedCategories?: string[];
    isDuplicate?: boolean;
    isSuspicious?: boolean;
  };
};
