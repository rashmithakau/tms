import { Box } from '@mui/material';
import TableWindowLayout from '../../templates/layout/TableWindowLayout';
import TeamTable from '../../organisms/table/TeamTable';
import { TeamRow } from '../../templates/layout/TableWindowLayout';
import BaseBtn from '../../atoms/button/BaseBtn';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ErrorAlert from '../../atoms/feedback/ErrorAlert';
import PageLoading from '../loading/PageLoading';

interface TeamsSectionProps {
  error?: string;
  isLoading: boolean;
  onAddTeam: () => void;
  rows?: TeamRow[];
}

const TeamsSection: React.FC<TeamsSectionProps> = ({
  error,
  isLoading,
  onAddTeam,
  rows,
}) => {
  if (error) {
    return <ErrorAlert error={error} />;
  }

  if (isLoading) return <PageLoading variant="inline" message="Loading teams..." />;

  return (
    <Box sx={{ padding: 2, height: '93%' }}>
      <TableWindowLayout
        title="Teams"
        filter={null}
        buttons={[
          <Box sx={{ mt: 2, ml: 2 }}>
            <BaseBtn
              onClick={onAddTeam}
              variant="contained"
              startIcon={<AddOutlinedIcon />}
            >
              Teams
            </BaseBtn>
          </Box>,
        ]}
        table={<TeamTable rows={rows} />}
      />
    </Box>
  );
};

export default TeamsSection;


