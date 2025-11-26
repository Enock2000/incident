
export type IncidentStatus =
  | 'Reported'
  | 'Verified'
  | 'Team Dispatched'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected';

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export type UserRole =
  | 'citizen'
  | 'admin'
  | 'regionalAuthority'
  | 'responseUnit'
  | 'dataAnalyst';

export type Reporter = {
  userId: string | null;
  name?: string; 
};

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: UserRole;
  departmentId?: string;
  branchId?: string;
  nrc?: string;
  province?: string;
  district?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  occupation?: string;
  photoURL?: string;
};

export type InvestigationNote = {
    id: string;
    note: string;
    authorId: string;
    authorName: string;
    timestamp: any; 
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
  location: IncidentLocation | any;
  status: IncidentStatus;
  priority: Priority;
  dateReported: any; 
  reporter?: Reporter;
  media: string[];
  category: string;
  departmentId?: string | null;
  investigationNotes?: Record<string, InvestigationNote>;
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

export type Branch = {
    id: string;
    name: string;
    province: string;
    district: string;
    address?: string;
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
    accessibleModules?: string[];
    branches?: Record<string, Branch>;
    assets?: Record<string, Asset>;
    created_at?: any;
    updated_at?: any;
}

export type IncidentType = {
    id: string;
    name: string;
    parentId?: string | null;
    isEnabled: boolean;
    defaultSeverity?: Priority;
    order?: number;
};

export type Severity = {
    id: string;
    name: string;
    level: number;
    color: string;
}

export type DepartmentRule = {
    id: string;
    incidentTypeId: string;
    departmentId: string;
    priority: number;
}

export type Escalation = {
    id: string;
    name: string;
    waitMinutes: number;
}

export type Status = {
    id: string;
    name: string;
    order: number;
}

export type Location = {
    id: string;
    name: string;
    type: 'province' | 'district' | 'ward' | 'village';
    parentId?: string | null;
}

export type Sla = {
    id: string;
    incidentTypeId: string;
    severityId: string;
    responseMinutes: number;
}

export type NotificationRule = {
    id: string;
    name: string;
    channels: string[];
    incidentTypes: string[];
}

export type CustomField = {
    id: string;
    name: string;
    type: 'text' | 'number' | 'select' | 'checkbox' | 'date' | 'file';
    options?: string[];
}

export type Role = {
    id: string;
    name: string;
    permissions: string[];
}

export type AuditEntry = {
    id: string;
    timestamp: any;
    user: string;
    action: string;
    details: string;
}

export type IntegrationSettings = {
    smsGateway?: string;
    emailServer?: string;
    mapProvider?: string;
}

export type ElectionMode = {
    enabled: boolean;
}
