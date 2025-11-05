export type ProjectType = {
  ID: number;
  pid: string;
  name: string;
  sdesc: string;
  ldesc: string;
  tags: string[];
  isActive: boolean | string;
  uid: string;
  user: {
    name: string;
    email: string;
    type: string;
  };
  fieldOfStudy?: string;
  specialization?: string;
  duration?: string;
  positionType?: string[];
  deadline?: string;
};

export type ApplicationType = {
  ID: number;
  PID: string;
  status: string;
  timeCreated: string;
  availability?: string;
  motivation?: string;
  priorProjects?: string;
  cvLink?: string;
  publicationsLink?: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewDetails?: string;
  Project?: {
    project_name: string;
    project_id: string;
  };
};
