export type IncidentStatus =
  | 'Reported'
  | 'Verified'
  | 'Team Dispatched'
  | 'In Progress'
  | 'Resolved';

export type Priority = 'Low' | 'Medium' | 'High';

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
};
