import { Box } from '@mui/material';
import TableWindowLayout from '../templates/TableWindowLayout';
import TeamTable from '../organisms/TeamTable';
import { TeamRow } from '../templates/TableWindowLayout';
import BaseBtn from '../atoms/buttons/BaseBtn';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ErrorAlert from '../atoms/ErrorAlert';
import LoadingSpinner from '../atoms/LoadingSpinner';

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

  if (isLoading) {
    return <LoadingSpinner />;
  }

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


