
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
  departmentId?: string;
  branchId?: string; // Add branchId to user profile
  nrc?: string;
  province?: string;
  district?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  occupation?: string;
  photoURL?: string;
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
  departmentId?: string | null;
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
    lastCheckin: number; // as timestamp
    location: {
        latitude: number;
        longitude: number;
    };
};

export type Branch = {
    id: string;
    name: string;
    province: string;
    district: string;
    address: string;
    accessibleModules?: string[];
}

export type Asset = {
    id: string;
    name: string;
    assetType: 'Vehicle' | 'Equipment' | string;
    status: 'Active' | 'Inactive' | 'Maintenance';
    departmentId: string;
};

export type Department = {
    id: string;
    name: string;
    category: string;
    province: string;
    district: string;
    officeAddress?: string;
    contactNumbers?: { landline?: string; responders?: string[] };
    operatingHours?: string;
    escalationRules?: string;
    priorityAssignmentRules?: string;
    incidentTypesHandled?: string[];
    branches?: Record<string, Branch>;
    assets?: Record<string, Asset>;
    created_at?: any;
    updated_at?: any;
}

export type IncidentType = {
    id: string;
    name: string;
    // The 'category' field now links to a parent IncidentType
    // to form a hierarchy. If it's a top-level category, it won't have a parentId.
    parentId?: string | null;
    isEnabled: boolean;
    defaultSeverity: Priority;
    order: number; // For custom sorting
};
