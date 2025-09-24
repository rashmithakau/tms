import React from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Person, Work, DateRange, Error } from '@mui/icons-material';
import { IRejectedTimesheetsProps } from '../../../interfaces/dashboard';

const RejectedTimesheets: React.FC<IRejectedTimesheetsProps> = ({ 
  rejectedTimesheets, 
  onViewTimesheet,
  maxItems = 3
}) => {
  if (!rejectedTimesheets || rejectedTimesheets.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Error color="error" />
          <Typography variant="h6" color="error">
            Rejected Timesheets
          </Typography>
        </Box>
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center"
          minHeight={200}
        >
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No rejected timesheets found
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ 
      p: 3, 
      border: '1px solid', 
      borderColor: 'divider',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box mb={2}>
        <Typography variant="h6" component="h3" fontWeight="bold">
          Rejected Timesheets
        </Typography>
      </Box>

      <Box 
        sx={{ 
          maxHeight: 300,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '3px',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.3)',
            },
          },
        }}
      >
        <List disablePadding>
          {rejectedTimesheets.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItem
                disablePadding
                sx={{
                  py: 1.5,
                  px: 0,
                  display: 'flex',
                  alignItems: 'flex-start'
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="subtitle2" fontWeight="medium">
                        {item.employeeName}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Work fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {item.workName}
                          {item.projectName && ` - ${item.projectName}`}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <DateRange fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(item.rejectedDate).toLocaleDateString()}
                        </Typography>
                      </Box>

                      <Box 
                        sx={{ 
                          backgroundColor: 'error.light',
                          borderRadius: 1,
                          p: 1,
                          mt: 1
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          color="error.contrastText"
                          sx={{ fontStyle: 'italic' }}
                        >
                          "{item.reason}"
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              {index < rejectedTimesheets.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Box>

      {rejectedTimesheets.length > maxItems && (
        <Box mt={2} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Scroll to see all {rejectedTimesheets.length} rejected timesheets
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default RejectedTimesheets;
