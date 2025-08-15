import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onEdit, onDelete }) => (
  <>
    <IconButton onClick={onEdit} color="primary">
      <EditIcon />
    </IconButton>
    <IconButton onClick={onDelete} color="error">
      <DeleteIcon />
    </IconButton>
  </>
);

export default ActionButtons;
