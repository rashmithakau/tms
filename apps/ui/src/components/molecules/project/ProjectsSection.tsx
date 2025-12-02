import { Box } from '@mui/material';
import TableWindowLayout from '../../templates/layout/TableWindowLayout';
import ProjectTable from '../../organisms/table/ProjectTable';
import ProjectTableToolbar from './ProjectTableToolbar';
import BaseBtn from '../../atoms/common/button/BaseBtn';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ErrorAlert from '../../atoms/common/feedback/ErrorAlert';
import PageLoading from '../../molecules/common/loading/PageLoading';
import { IProjectsSectionProps } from '../../../interfaces/component/project';

const ProjectsSection: React.FC<IProjectsSectionProps> = ({
  error,
  isLoading,
  rows,
  billable,
  onBillableChange,
  onAddProject,
  onRefresh,
}) => {
  if (error) {
    return <ErrorAlert error={error} />;
  }

  if (isLoading) return <PageLoading variant="inline" message="Loading projects..." />;

  return (
    <TableWindowLayout
      title="Projects"
      filter={null}
      buttons={[
        <Box sx={{ mt: 2 }}>
          <ProjectTableToolbar
            billable={billable}
            onBillableChange={onBillableChange}
          />
        </Box>,
        <Box sx={{ mt: 2 }}>
          <BaseBtn
            onClick={onAddProject}
            variant="contained"
            startIcon={<AddOutlinedIcon />}
          >
            Project
          </BaseBtn>
        </Box>,
      ]}
      table={
        <ProjectTable
          rows={rows}
          billableFilter={billable}
          onRefresh={onRefresh}
        />
      }
    />
  );
};

export default ProjectsSection;


