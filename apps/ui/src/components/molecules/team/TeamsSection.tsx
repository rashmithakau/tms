import { Box } from '@mui/material';
import TableWindowLayout from '../../templates/layout/TableWindowLayout';
import TeamTable from '../../organisms/table/TeamTable';
import BaseBtn from '../../atoms/common/button/BaseBtn';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ErrorAlert from '../../atoms/common/feedback/ErrorAlert';
import PageLoading from '../../molecules/common/loading/PageLoading';
import { TeamsSectionProps } from '../../../interfaces/molecules/team';

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
  );
};

export default TeamsSection;


