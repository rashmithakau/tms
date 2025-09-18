import { TeamMember } from '../../component/ComponentTypes';

export interface ViewTeamMembersProps {
  open: boolean;
  onClose: () => void;
  team: {
    teamName: string;
    supervisor: TeamMember | null;
    members: TeamMember[];
  } | null;
}
