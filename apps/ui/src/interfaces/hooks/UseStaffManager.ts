export interface UseStaffManagerProps {
  open: boolean;
  initialStaff: { id: string; name: string; designation?: string }[];
  initialSupervisor: { id: string; name: string; designation?: string } | null;
  onSave: (staff: string[], supervisor: string | null) => Promise<void>;
}
