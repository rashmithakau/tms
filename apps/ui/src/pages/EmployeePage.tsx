import React, { useState } from "react"
import { Box, CircularProgress, Menu, MenuItem } from "@mui/material"
import SecondaryLayout from "../components/templates/SecondaryLayout"
import TableWindowLayout from "../components/templates/TableWindowLayout"
import BaseBtn from "../components/atoms/buttons/BaseBtn"
import TimeSheetTable from "../components/organisms/TimeSheetTable"
import { useTimesheets } from "../hooks/useTimesheets"
import { deleteMyTimesheet } from "../api/timesheet"
import TimesheetFormPopup from "../components/organisms/TimesheetFormPopup"
import ConfirmDialog from "../components/molecules/ConfirmDialog"
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
 


const EmployeePage = () => {
  const { rows, isLoading, refresh } = useTimesheets();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>( { open: false } );
  const [editing, setEditing] = useState<{ open: boolean; id?: string }>( { open: false } );
  const handleOpenPopup = () => setOpen(true);
  const handleClosePopup = () => setOpen(false);

  // State for the filter menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <SecondaryLayout>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableWindowLayout
                rows={[]}
                title="Time Sheets"
                buttons={[
                  <Box
                    sx={{
                      mt: 2,
                      ml: 2,
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 2,
                    }}
                  >
                    <BaseBtn onClick={handleFilterClick} variant="text" startIcon={<FilterAltOutlinedIcon />}> 
                      Filter
                    </BaseBtn>
                    <BaseBtn onClick={handleOpenPopup} variant="contained" startIcon={<AddOutlinedIcon />}>Add new</BaseBtn>
                  </Box>,
                ]}
                table={<TimeSheetTable
                  rows={rows}
                  onDelete={(row) => setConfirm({ open: true, id: row._id })}
                  onEdit={(row) => setEditing({ open: true, id: row._id })}
                />}
              />
            )}
            {/* Filter Menu */}
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <MenuItem onClick={handleMenuClose}>Filter by Date</MenuItem>
              <MenuItem onClick={handleMenuClose}>Filter by Project</MenuItem>
              <MenuItem onClick={handleMenuClose}>Filter by Task</MenuItem>
            </Menu>

            <TimesheetFormPopup open={open} mode="create" onClose={handleClosePopup} onSuccess={refresh} />
            <ConfirmDialog
              open={confirm.open}
              title="Delete timesheet"
              message="Are you sure you want to delete this timesheet? This action cannot be undone."
              onCancel={() => setConfirm({ open: false })}
              onConfirm={async () => {
                if (confirm.id) {
                  await deleteMyTimesheet(confirm.id);
                  await refresh();
                }
                setConfirm({ open: false });
              }}
            />
            {editing.open && (() => {
              const row = rows.find(r => r._id === editing.id);
              if (!row) return null;
              return (
                <TimesheetFormPopup
                  open={editing.open}
                  mode="edit"
                  id={editing.id}
                  onClose={() => setEditing({ open: false })}
                  onSuccess={async () => { setEditing({ open: false }); await refresh(); }}
                  initial={{
                    date: row.date,
                    projectName: row.project,
                    taskTitle: row.task,
                    description: row.description,
                    plannedHours: row.plannedHours !== undefined ? String(row.plannedHours) : undefined,
                    hoursSpent: row.hoursSpent !== undefined ? String(row.hoursSpent) : undefined,
                    billableType: row.billableType,
                  }}
                />
              );
            })()}
    </SecondaryLayout>
  )
}

export default EmployeePage
