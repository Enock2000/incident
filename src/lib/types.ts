export type IncidentStatus =
  | 'Reported'
  | 'Verified'
  | 'Team Dispatched'
  | 'In Progress'
  | 'Resolved';

export type Priority = 'Low' | 'Medium' | 'High';

export type Role =
  | 'Citizen'
  | 'Admin'
  | 'RegionalAuthority'
  | 'ResponseUnit'
  | 'DataAnalyst';

export type Reporter = {
  name: string;
  contact?: string;
};

export type UserProfile = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role: Role;
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
