import { Box } from '@mui/material';
import TableWindowLayout from '../templates/TableWindowLayout';
import ProjectTable from '../organisms/ProjectTable';
import ProjectTableToolbar from './ProjectTableToolbar';
import BaseBtn from '../atoms/buttons/BaseBtn';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ErrorAlert from '../atoms/ErrorAlert';
import LoadingSpinner from '../atoms/LoadingSpinner';
import { ProjectRow } from '../templates/TableWindowLayout';

interface ProjectsSectionProps {
  error?: string;
  isLoading: boolean;
  rows: ProjectRow[];
  billable: 'all' | 'Yes' | 'No';
  onBillableChange: (billable: 'all' | 'Yes' | 'No') => void;
  onAddProject: () => void;
  onRefresh: () => Promise<void>;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ padding: 2, height: '100%' }}>
      <TableWindowLayout
        title="Projects"
        filter={
          <ProjectTableToolbar
            billable={billable}
            onBillableChange={onBillableChange}
          />
        }
        buttons={[
          <Box sx={{ mt: 2, ml: 2 }}>
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
    </Box>
  );
};

export default ProjectsSection;


