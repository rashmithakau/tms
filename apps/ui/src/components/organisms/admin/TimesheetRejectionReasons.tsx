import React from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import { Report, Warning, InfoOutlined } from '@mui/icons-material';
import { ITimesheetRejectionReasonsProps } from '../../../interfaces/dashboard';
import PageLoading from '../../molecules/common/loading/PageLoading';

const TimesheetRejectionReasons: React.FC<ITimesheetRejectionReasonsProps> = ({ 
  rejectionReasons,
  maxItems = 5,
  loading = false,
  error = null
}) => {
  // Loading state
  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3, height: '100%', position: 'relative' }}>
        <PageLoading 
          variant="overlay" 
          message="Loading rejection reasons..." 
          size="medium"
        />
      </Paper>
    );
  }

  // Error state
  if (error) {
    return (
      <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Report color="primary" />
          <Typography variant="h6" color="primary">
            Timesheet Rejection Reasons
          </Typography>
        </Box>
        <Alert 
          severity="error" 
          icon={<Warning />}
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-message': { 
              width: '100%' 
            }
          }}
        >
          <Typography variant="body2">
            {error || 'Failed to load rejection reasons'}
          </Typography>
        </Alert>
      </Paper>
    );
  }

  // Empty state
  if (!rejectionReasons || rejectionReasons.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Report color="primary" />
          <Typography variant="h6" color="primary">
            Timesheet Rejection Reasons
          </Typography>
        </Box>
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center"
          minHeight={200}
          sx={{
            backgroundColor: 'grey.50',
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'grey.300'
          }}
        >
          <InfoOutlined 
            sx={{ 
              fontSize: 48, 
              color: 'grey.400', 
              mb: 2 
            }} 
          />
          <Typography 
            variant="body1" 
            color="text.secondary" 
            textAlign="center"
            fontWeight="medium"
          >
            No rejection reasons found
          </Typography>
          <Typography 
            variant="body2" 
            color="text.disabled" 
            textAlign="center"
            mt={1}
          >
            Rejection reasons will appear here when timesheets are rejected
          </Typography>
        </Box>
      </Paper>
    );
  }

  const displayReasons = rejectionReasons.slice(0, maxItems);

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        border: '1px solid', 
        borderColor: 'divider',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: 3
        }
      }}
    >
      {/* Header */}
      <Box mb={3} display="flex" alignItems="center" justifyContent="center" gap={1}>
        <Report color="primary" />
        <Typography 
          variant="h6" 
          component="h3" 
          fontWeight="600"
          color="text.primary"
          textAlign="center"
        >
          Timesheet Rejection Reasons
        </Typography>
      </Box>

      {/* Scrollable Content */}
      <Box 
        flex={1}
        sx={{ 
          maxHeight: 320,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'grey.100',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'grey.300',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'grey.400',
            },
          },
        }}
      >
        <List disablePadding>
          {displayReasons.map((reason, index) => (
            <React.Fragment key={index}>
              <ListItem
                disablePadding
                sx={{
                  py: 1,
                  px: 0,
                  display: 'flex',
                  alignItems: 'flex-start'
                }}
              >
                <ListItemText
                  primary={
                    <Box 
                      sx={{ 
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        p: 2,
                        border: '1px solid',
                        borderColor: 'grey.300',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        cursor: 'default',
                        '&:hover': {
                          backgroundColor: 'grey.50',
                          transform: 'translateY(-1px)',
                          boxShadow: 2,
                          borderColor: 'grey.400'
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: '4px',
                          backgroundColor: 'error.main',
                          borderRadius: '2px 0 0 2px'
                        }
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        color="text.primary"
                        sx={{ 
                          fontWeight: '500',
                          lineHeight: 1.5,
                          wordBreak: 'break-word'
                        }}
                      >
                        {reason}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < displayReasons.length - 1 && (
                <Divider 
                  sx={{ 
                    my: 1.5,
                    borderColor: 'grey.200'
                  }} 
                />
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>


    </Paper>
  );
};

export default TimesheetRejectionReasons;
