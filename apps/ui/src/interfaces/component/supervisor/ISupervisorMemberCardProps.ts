export interface ISupervisorMemberCardProps {
  supervisor: {
    name: string;
    designation?: string;
    email?: string;
  } | null;
}