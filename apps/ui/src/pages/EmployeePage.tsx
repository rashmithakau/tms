import { Box, CircularProgress } from "@mui/material"
import SecondaryLayout from "../components/templates/SecondaryLayout"
import TableWindowLayout from "../components/templates/TableWindowLayout"
import BaseBtn from "../components/atoms/buttons/BaseBtn"
import TimeSheetTable from "../components/organisms/TimeSheetTable"
import { useTimesheets } from "../hooks/useTimesheets"
import { useState } from "react"
import { deleteMyTimesheet, updateMyTimesheet } from "../api/timesheet"
import TimesheetFormPopup from "../components/organisms/TimesheetFormPopup"
import ConfirmDialog from "../components/molecules/ConfirmDialog"
 


const EmployeePage = () => {
  const { rows, isLoading, refresh } = useTimesheets();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>( { open: false } );
  const [editing, setEditing] = useState<{ open: boolean; id?: string }>( { open: false } );
  const handleOpenPopup = () => setOpen(true);
  const handleClosePopup = () => setOpen(false);

 

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
                  <Box sx={{ mt: 2, ml: 2 }}>
                    <BaseBtn onClick={handleOpenPopup} variant="contained">Add new</BaseBtn>
                  </Box>,
                ]}
                table={<TimeSheetTable
                  rows={rows}
                  onDelete={(row) => setConfirm({ open: true, id: row._id })}
                  onEdit={(row) => setEditing({ open: true, id: row._id })}
                />}
              />
            )}
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
                    plannedHours: row.plannedHours,
                    hoursSpent: row.hoursSpent,
                    billableType: row.billableType,
                  }}
                />
              );
            })()}
    </SecondaryLayout>
  )
}

export default EmployeePage
