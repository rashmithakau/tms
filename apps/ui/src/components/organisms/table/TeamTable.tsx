import React, { useEffect,  useState } from 'react';
import { listTeams, deleteTeam } from '../../../api/team';
import { TeamListItem, DataTableColumn } from '../../../interfaces';
import BaseBtn from '../../atoms/common/button/BaseBtn';
import ViewTeamMembers from '../../organisms/popup/ViewTeamMembers';
import TeamStaffManager from '../../organisms/popup/TeamStaffManager';
import { TeamRow } from '../../../interfaces/component/table/ITableRowTypes';
import DataTable from './DataTable';
import { useTheme } from '@mui/material/styles';
import ActionButtons from '../../molecules/common/other/ActionButtons';
import ConfirmDialog from '../../molecules/common/dialog/ConfirmDialog';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useToast } from '../../../contexts/ToastContext';

const TeamTable: React.FC<{ rows?: TeamRow[] }> = ({ rows: externalRows }) => {
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [displayRows, setDisplayRows] = useState<TeamRow[]>([]);
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
 const toast = useToast();

  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({
    open: false,
  });

  const [staffManagerTeam, setStaffManagerTeam] = useState<TeamRow | null>(null);

  useEffect(() => {
    if (externalRows) return;
    const run = async () => {
      try {
        const resp = await listTeams();
        const arr = resp.data?.teams as TeamListItem[] | undefined;
        const mapped: TeamRow[] = (arr ?? []).map((t) => ({
          id: t._id,
          teamName: t.teamName,
          createdAt: t.createdAt,
          members: (t.members ?? []).map((m) => ({
            id: m._id,
            name: `${m.firstName} ${m.lastName}`.trim(),
            email: m.email,
            designation: m.designation,
          })),
          supervisor: t.supervisor
            ? {
                id: t.supervisor._id,
                name: `${t.supervisor.firstName} ${t.supervisor.lastName}`.trim(),
                email: t.supervisor.email,
                designation: t.supervisor.designation,
              }
            : null,
        }));
        setTeams(mapped);
      } catch {
        setTeams([]);
      }
    };
    run();
  }, [externalRows]);

  
  useEffect(() => {
    if (externalRows) {
      setDisplayRows(externalRows as TeamRow[]);
    } else {
      setDisplayRows(teams);
    }
  }, [externalRows, teams]);
  const theme = useTheme();
  const columns: DataTableColumn<TeamRow>[] = [
    { label: '', key: 'empty', render: () => null },
    { label: 'Team Name', key: 'teamName', render: (row) => row.teamName },
    {
      label: 'Supervisor',
      key: 'supervisorName',
      render: (row: TeamRow) =>
        row.supervisor ? (
          row.supervisor.name ? (
            row.supervisor.name
          ) : (
            <span style={{ color: theme.palette.text.secondary }}>
              No supervisor assigned
            </span>
          )
        ) : (
          <span style={{ color: theme.palette.text.secondary }}>
            No supervisor assigned
          </span>
        ),
    },
    {
      label: 'Supervisor Email',
      key: 'supervisorEmail',
      render: (row) =>
        row.supervisor?.email || (
          <span style={{ color: theme.palette.text.secondary }}>
            No supervisor assigned
          </span>
        ),
    },
    {
      label: 'Designation',
      key: 'designation',
      render: (row) =>
        row.supervisor?.designation || (
          <span style={{ color: theme.palette.text.secondary }}>
            No supervisor assigned
          </span>
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
    {
      label: 'Actions',
      key: 'actions',
      render: (row) => (
        <ActionButtons
          onEdit={() => setStaffManagerTeam(row)}
          onDelete={() => setConfirm({ open: true, id: row.id })}
        />
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={displayRows}
        getRowKey={(row) => row.id ?? row.teamName}
      />
      <ViewTeamMembers
        open={!!viewTeam}
        onClose={() => setViewTeam(null)}
        team={viewTeam}
      />

      {/* TeamStaffManager Popup */}
      <TeamStaffManager
        open={!!staffManagerTeam}
        onClose={() => setStaffManagerTeam(null)}
        teamId={staffManagerTeam?.id || ''}
        initialMembers={staffManagerTeam?.members || []}
        initialSupervisor={staffManagerTeam?.supervisor || null}
        onSaved={() => {
        
          const run = async () => {
            try {
              const resp = await listTeams();
              const arr = resp.data?.teams as TeamListItem[] | undefined;
              const mapped: TeamRow[] = (arr ?? []).map((t) => ({
                id: t._id,
                teamName: t.teamName,
                createdAt: t.createdAt,
                members: (t.members ?? []).map((m) => ({
                  id: m._id,
                  name: `${m.firstName} ${m.lastName}`.trim(),
                  email: m.email,
                  designation: m.designation,
                })),
                supervisor: t.supervisor
                  ? {
                      id: t.supervisor._id,
                      name: `${t.supervisor.firstName} ${t.supervisor.lastName}`.trim(),
                      email: t.supervisor.email,
                      designation: t.supervisor.designation,
                    }
                  : null,
              }));
              if (externalRows) {
                setDisplayRows(mapped);
              } else {
                setTeams(mapped);
              }
            } catch {
              if (externalRows) {
                setDisplayRows([]);
              } else {
                setTeams([]);
              }
            }
          };
          run();
        }}
      />

      <ConfirmDialog
        open={confirm.open}
        title="Delete Team"
        message="Are you sure you want to delete this team? This action cannot be undone."
        icon={<DeleteRoundedIcon />}
        confirmText="Delete"
        onCancel={() => setConfirm({ open: false })}
        onConfirm={async () => {
          if (confirm.id) {
            try {
              await deleteTeam(confirm.id);
              toast.success('Team deleted');
             
              const run = async () => {
                try {
                  const resp = await listTeams();
                  const arr = resp.data?.teams as TeamListItem[] | undefined;
                  const mapped: TeamRow[] = (arr ?? []).map((t) => ({
                    id: t._id,
                    teamName: t.teamName,
                    createdAt: t.createdAt,
                    members: (t.members ?? []).map((m) => ({
                      id: m._id,
                      name: `${m.firstName} ${m.lastName}`.trim(),
                      email: m.email,
                      designation: m.designation,
                    })),
                    supervisor: t.supervisor
                      ? {
                          id: t.supervisor._id,
                          name: `${t.supervisor.firstName} ${t.supervisor.lastName}`.trim(),
                          email: t.supervisor.email,
                          designation: t.supervisor.designation,
                        }
                      : null,
                  }));
                  if (externalRows) {
                    setDisplayRows(mapped);
                  } else {
                    setTeams(mapped);
                  }
                } catch {
                  if (externalRows) {
                    setDisplayRows([]);
                  } else {
                    setTeams([]);
                  }
                }
              };
              run();
            } catch (e) {
              toast.error('Failed to delete team');
            }
          }
          setConfirm({ open: false });
        }}
      />
    </>
  );
};

export default TeamTable;
