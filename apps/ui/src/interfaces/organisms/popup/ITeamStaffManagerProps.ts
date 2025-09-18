export interface TeamStaffManagerProps {
  open: boolean;
  onClose: () => void;
  teamId: string;
  initialMembers: { id: string; name: string; designation?: string }[];
  initialSupervisor: { id: string; name: string; designation?: string } | null;
  onSaved?: () => void;
}