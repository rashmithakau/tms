import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { IActionButtonsProps } from "../../../../interfaces/component";

const ActionButtons: React.FC<IActionButtonsProps> = ({ onEdit, onDelete, disabled }) => (
  <>
    <IconButton onClick={onEdit} color="primary" disabled={disabled}>
      <EditIcon />
    </IconButton>
    <IconButton onClick={onDelete} color="error" disabled={disabled}>
      <DeleteIcon />
    </IconButton>
  </>
);

export default ActionButtons;
