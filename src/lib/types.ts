
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
  | 'communityLeader'
  | 'responder';

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
  departmentId?: string;
};

export type InvestigationNote = {
    note: string;
    authorId: string;
    authorName: string;
    timestamp: any; // Firebase Timestamp
}

export type Responder = 'Police' | 'Fire' | 'Ambulance';

export type IncidentLocation = {
  latitude: number;
  longitude: number;
  address: string;
}

export type Incident = {
  id: string;
  title: string;
  description: string;
  location: IncidentLocation | any; // Use object for structured location
  status: IncidentStatus;
  priority: Priority;
  dateReported: any; // Using `any` for Firebase Timestamp
  reporter?: Reporter;
  media: string[];
  category: string;
  investigationNotes?: Record<string, InvestigationNote>; // RTDB uses objects for lists
  aiMetadata?: {
    suggestedCategories?: string[];
    isDuplicate?: boolean;
    isSuspicious?: boolean;
  };
  assignedTo?: Responder | null;
  dateVerified?: any;
  dateDispatched?: any;
  dateResolved?: any;
};

export type PollingStationStatus = 'Open' | 'Closed' | 'Delayed' | 'Interrupted';

export type PollingStation = {
    id: string;
    name: string;
    province: string;
    district: string;
    status: PollingStationStatus;
    queueLength: number;
    hasMissingMaterials: boolean;
    staffAttendance: {
        present: number;
        absent: number;
    };
    hasPowerOutage: boolean;
    hasTamperingReport: boolean;
    registeredVoters: number;
    lastCheckin: number;
    location: {
        latitude: number;
        longitude: number;
    };
};

    