import React, { useEffect, useMemo, useState } from 'react';
import { listTeams, TeamListItem } from '../../api/team';
import BaseBtn from '../atoms/buttons/BaseBtn';
import ViewTeamMembers from './ViewTeamMembers';
import { TeamRow } from '../templates/TableWindowLayout';
import DataTable, { DataTableColumn } from './DataTable';
import { useTheme } from '@mui/material/styles';

const TeamTable: React.FC<{ rows?: TeamRow[] }> = ({ rows: externalRows }) => {
  const [teams, setTeams] = useState<TeamListItem[]>([]);
  const [viewTeam, setViewTeam] = useState<null | {
    teamName: string;
    supervisor: {
      id: string;
      name: string;
      email?: string;
      designation?: string;
    } | null;
    members: {
      id: string;
      name: string;
      email?: string;
      designation?: string;
    }[];
  }>(null);

  useEffect(() => {
    if (externalRows) return;
    const run = async () => {
      try {
        const resp = await listTeams();
        const arr = resp.data?.teams as TeamListItem[] | undefined;
        setTeams(arr ?? []);
      } catch {
        setTeams([]);
      }
    };
    run();
  }, [externalRows]);

  const rows = useMemo(
    () => (externalRows ? externalRows : (teams as any)),
    [externalRows, teams]
  );
  const theme = useTheme();
  const columns: DataTableColumn<TeamRow>[] = [
    { label: '', key: 'empty', render: () => null },
    { label: 'Team Name', key: 'teamName', render: (row) => row.teamName },
    {
      label: 'Supervisor',
      key: 'supervisorName',
      render: (row: TeamRow) =>
        row.supervisor
          ? row.supervisor.name
            ? row.supervisor.name
            : <span style={{ color: theme.palette.text.secondary }}>No supervisor assigned</span>
          : <span style={{ color: theme.palette.text.secondary }}>No supervisor assigned</span>,
    },
    {
      label: 'Supervisor Email',
      key: 'supervisorEmail',
      render: (row) => row.supervisor?.email || (
        <span style={{ color: theme.palette.text.secondary }}>No supervisor assigned</span>
      ),
    },
    {
      label: 'Team Members',
      key: 'teamMembers',
      render: (row) => (
        <BaseBtn
          variant="outlined"
          size="small"
          onClick={() => setViewTeam(row)}
        >
          View Team
        </BaseBtn>
      ),
    },
    {
      label: 'Created At',
      key: 'createdAt',
      render: (row) => (
        <span>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}
        </span>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id ?? row.teamName}
      />
      <ViewTeamMembers
        open={!!viewTeam}
        onClose={() => setViewTeam(null)}
        team={viewTeam}
      />
    </>
  );
};

export default TeamTable;
