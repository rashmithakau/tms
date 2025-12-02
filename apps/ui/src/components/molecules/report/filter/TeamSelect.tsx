import React, { useState, useMemo } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip, 
  OutlinedInput, 
  Checkbox, 
  ListItemText, 
  Box, 
  TextField,
  InputAdornment,
  Typography,
  useTheme 
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { TeamSelectProps } from '../../../../interfaces/report/filter';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const TeamSelect: React.FC<TeamSelectProps> = ({ teams, selectedTeamIds, onChange, disabled }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  
  // Filter teams based on search term
  const filteredTeams = useMemo(() => {
    if (!searchTerm.trim()) return teams;
    
    return teams.filter(team => {
      const teamName = team.teamName.toLowerCase();
      const search = searchTerm.toLowerCase();
      
      return teamName.includes(search);
    });
  }, [teams, searchTerm]);

  // Function to highlight matching text
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} style={{ backgroundColor: theme.palette.background.paper, fontWeight: 'bold' }}>
          {part}
        </span>
      ) : part
    );
  };
  
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 300,
        backgroundColor: theme.palette.background.default,
      },
    },
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectChange = (event: any) => {
    onChange(typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value);
  };

  return (
    <FormControl fullWidth size="small" disabled={disabled}>
      <InputLabel>Teams</InputLabel>
      <Select
        multiple
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => {
          setOpen(false);
          setSearchTerm(''); 
        }}
        value={selectedTeamIds}
        onChange={handleSelectChange}
        input={<OutlinedInput label="Teams" />}
        renderValue={selected => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {(selected as string[]).map(teamId => {
              const team = teams.find(t => t._id === teamId);
              return (
                <Chip
                  key={teamId}
                  label={team ? team.teamName : teamId}
                  size="small"
                />
              );
            })}
          </Box>
        )}
        MenuProps={MenuProps}
      >
        {/* Search Input */}
        <Box sx={{ p: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search teams..."
            value={searchTerm}
            onChange={handleSearchChange}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.875rem',
              },
            }}
          />
        </Box>

        {/* Search Results Header */}
        {searchTerm.trim() && (
          <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">
              Results for "{searchTerm}" ({filteredTeams.length} found)
            </Typography>
          </Box>
        )}

        {/* Team List */}
        {filteredTeams.length > 0 ? (
          filteredTeams.map(team => {
            const supervisorName = team.supervisor 
              ? `${team.supervisor.firstName} ${team.supervisor.lastName}`
              : 'No supervisor';
            
            return (
              <MenuItem 
                key={team._id} 
                value={team._id}
                sx={{
                  bgcolor: theme.palette.background.default,
                  '&:hover': {
                    bgcolor: theme.palette.action.hover,
                  },
                }}
              >
                <Checkbox 
                  checked={selectedTeamIds.indexOf(team._id) > -1} 
                />
                <ListItemText 
                  primary={highlightText(team.teamName, searchTerm)}
                  secondary={
                    <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                      <Typography variant="caption" component="span">
                        {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                      </Typography>
                      <Typography variant="caption" component="span" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        Supervisor: {supervisorName}
                      </Typography>
                    </Box>
                  }
                />
              </MenuItem>
            );
          })
        ) : searchTerm.trim() ? (
          <MenuItem disabled>
            <ListItemText 
              primary={`No teams found for "${searchTerm}"`}
              secondary="Try a different search term"
            />
          </MenuItem>
        ) : (
          <MenuItem disabled>
            <ListItemText primary="No teams available" />
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default TeamSelect;

