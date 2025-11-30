
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
    username?: string;
    createdAt?: string;
    createdBy?: string;
};

export type InvestigationNote = {
    id: string;
    note: string;
    authorId: string;
    authorName: string;
    timestamp: any;
};

export type Coordinates = {
    latitude: number;
    longitude: number;
    geocoded: boolean;
    geocodedAt?: string;
};

export type Address = {
    province: string;
    district: string;
    constituency?: string;
    address?: string;
};

export type IncidentEscalation = {
    id: string;
    fromBranchId?: string;
    toBranchId?: string;
    fromDepartmentId?: string;
    toDepartmentId?: string;
    reason: string;
    escalatedBy: {
        userId: string;
        name: string;
    };
    escalatedAt: string;
};

export type InternalNote = {
    author: string;
    authorId: string;
    content: string;
    timestamp: number;
    visibility: 'department' | 'admin';
}

export type IncidentResolution = {
    resolvedBy: {
        userId: string;
        name: string;
    };
    resolvedAt: string;
    resolutionType: 'Resolved' | 'Closed - No Action' | 'Closed - Duplicate' | 'Escalated';
    resolutionNotes: string;
    actionsTaken: string[];
    preventiveMeasures?: string;
    followUpRequired: boolean;
    followUpDate?: string;
}

export type Responder = 'Police' | 'Fire' | 'Ambulance';

export type Incident = {
    id: string;
    title: string;
    description: string;
    category: string; // Using string as IncidentCategory is not explicitly defined as a type alias in this file
    location: string | Address;
    status: IncidentStatus;
    priority: Priority;
    images?: string[];
    video?: string;
    audio?: string;
    reporter?: Reporter;
    departmentId?: string;
    branchId?: string;
    dateReported: number;
    updatedAt?: string;
    escalations?: Record<string, IncidentEscalation>;
    resolution?: IncidentResolution;
    internalNotes?: Record<string, InternalNote>;
    assignedTo?: {
        userId: string;
        name: string;
        assignedAt: string;
    };
    aiMetadata?: {
        suggestedCategories?: string[];
        isDuplicate?: boolean;
        isSuspicious?: boolean;
    };
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
    votesCast: number;
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
    constituency?: string;
    address?: string;
    coordinates?: Coordinates;
    contactNumber?: string;
    responsibleStaff?: string[];
    accessibleModules?: string[];
};

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
    constituency?: string;
    officeAddress?: string;
    coordinates?: Coordinates;
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
};

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
