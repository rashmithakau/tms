import { useEffect, useMemo, useState } from 'react';
import { listMyTeams } from '../../api/team';
import { listProjects } from '../../api/project';
import { UserRole } from '@tms/shared';
import { UseSupervisorDisplayProps } from '../../interfaces/profile/hook';


export const useSupervisorDisplay = ({ user, open }: UseSupervisorDisplayProps) => {
  const [supervisors, setSupervisors] = useState<string[]>([]);
  const [supervisorEmails, setSupervisorEmails] = useState<string[]>([]);
  const targetUserId = (user as any)?._id || (user as any)?.id;

  useEffect(() => {
    let isMounted = true;
    
    const fetchSupervisors = async () => {
      try {
        const [teamRes, projectRes] = await Promise.allSettled([
          listMyTeams(),
          listProjects(),
        ]);

        const teams =
          teamRes.status === 'fulfilled'
            ? teamRes.value.data?.teams || teamRes.value.data || []
            : [];
        const projects =
          projectRes.status === 'fulfilled'
            ? projectRes.value.data?.projects || projectRes.value.data || []
            : [];

        const myTeamSupervisors = teams
          .filter((t: any) => t.members?.some((m: any) => (m._id || m.id) === targetUserId))
          .map((t: any) => t.supervisor)
          .filter(Boolean);

        const myProjectSupervisors = projects
          .filter((p: any) =>
            p.employees?.some((e: any) => (e._id || e.id) === targetUserId)
          )
          .map((p: any) => p.supervisor)
          .filter(Boolean);

        const allSupervisors = [...myTeamSupervisors, ...myProjectSupervisors];

        const uniqueNames = Array.from(
          new Set(
            allSupervisors.map((s: any) =>
              `${s.firstName} ${s.lastName}`.trim()
            )
          )
        );
        const uniqueEmails = Array.from(
          new Set(
            allSupervisors
              .map((s: any) => s.email)
              .filter((e: any) => typeof e === 'string' && e.length > 0)
          )
        );

        if (isMounted) {
          setSupervisors(uniqueNames);
          setSupervisorEmails(uniqueEmails);
        }
      } catch {
        if (isMounted) {
          setSupervisors([]);
          setSupervisorEmails([]);
        }
      }
    };

    if (open && targetUserId) fetchSupervisors();
    
    return () => {
      isMounted = false;
    };
  }, [open, targetUserId]);

  const supervisorDisplay = useMemo(() => {
    const userRole = (user as any)?.role;
    const isSupervisorEnum = userRole === UserRole.Supervisor || userRole === UserRole.SupervisorAdmin;
    const isSupervisorString = userRole === 'Supervisor' || userRole === 'Supervisor Admin';
    const isCurrentUserSupervisor = isSupervisorEnum || isSupervisorString;

    const filteredSupervisors = supervisors.filter((name) => {
      if (isCurrentUserSupervisor) {
        const currentUserName = `${user?.firstName} ${user?.lastName}`.trim();
        return name !== currentUserName;
      }
      return true;
    });

    const filteredSupervisorEmails = supervisorEmails.filter((email) => {
      if (isCurrentUserSupervisor) {
        return email !== user?.email;
      }
      return true;
    });

    if (!filteredSupervisors.length) return 'No supervisor assigned';

    if (filteredSupervisors.length === 1) {
      const name = filteredSupervisors[0];
      const email = filteredSupervisorEmails[0] || '';
      return email ? `${name}\n${email}` : name;
    }

    const supervisorList = filteredSupervisors.map((name, index) => {
      const email = filteredSupervisorEmails[index] || '';
      return email ? `${name}\n${email}` : name;
    });

    if (supervisorList.length <= 2) {
      return supervisorList.join('\n\n');
    }

    return `${supervisorList[0]}\n\n${supervisorList[1]}\n\n(+${supervisorList.length - 2} more supervisors)`;
  }, [supervisors, supervisorEmails, user]);

  return supervisorDisplay;
};
