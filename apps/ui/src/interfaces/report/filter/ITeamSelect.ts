export interface TeamSelectProps {
  teams: TeamOption[];
  selectedTeamIds: string[];
  onChange: (teamIds: string[]) => void;
  disabled?: boolean;
}

export interface TeamOption {
  _id: string;
  teamName: string;
  members: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    designation?: string;
  }>;
  supervisor?: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    designation?: string;
  } | null;
}

