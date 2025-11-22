export type IncidentStatus =
  | 'Reported'
  | 'Verified'
  | 'Team Dispatched'
  | 'In Progress'
  | 'Resolved';

export type Priority = 'Low' | 'Medium' | 'High';

export type Reporter = {
  name: string;
  contact?: string;
};

export type Incident = {
  id: string;
  title: string;
  description: string;
  location: string;
  status: IncidentStatus;
  priority: Priority;
  dateReported: string;
  reporter?: Reporter;
  media: string[];
};
