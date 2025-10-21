import React from 'react';
import { Box } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useReportFilters, useUserFilterType } from '../../../hooks/report';
import { IReportFilterForm } from '../../../interfaces/report/filter';
import {
  UserFilterTypeSelector,
  FilterRow,
  FilterColumn,
  FilterActions,
  UserSelectionField,
} from '../../molecules/report/filter';
import DateRangePicker from '../../molecules/report/filter/DateRangePicker';
import ReportTypeSelect from '../../molecules/report/filter/ReportTypeSelect';
import ReportLayout from '../../templates/report/ReportLayout';
import ReportGenerationPanel from '../../molecules/report/generationpanel/ReportGenerationPanel';
import { useAuth } from '../../../contexts/AuthContext';
import { UserRole } from '@tms/shared';

const ReportFilterForm: React.FC<IReportFilterForm> = ({
  supervisedEmployees,
  onFilterChange,
  reportType = '',
  onReportTypeChange,
  disabled = false,
  resetSignal,
  isGenerating,
  reportMetadata,
  onGenerateReport,
  error,
  onResetFilters,
}) => {
  const { authState } = useAuth();
  const currentUser = authState.user;
  const userRole = currentUser?.role as UserRole;
  const canSeeAllData = userRole === UserRole.Admin || userRole === UserRole.SupervisorAdmin;

  // Report filter management
  const {
    currentFilter,
    isFilterValid,
    handleFilterChange: updateFilter,
    resetFilters,
  } = useReportFilters();

  // User filter type management 
  const {
    userFilterType,
    setUserFilterType: handleUserFilterTypeChange,
    availableFilterOptions,
    teams,
    selectedTeamId,
    setSelectedTeamId,
    isLoadingTeams,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    isLoadingProjects,
    resetFilterType,
  } = useUserFilterType({ userRole, canSeeAllData });

  // Propagate filter changes to parent
  React.useEffect(() => {
    onFilterChange(currentFilter);
  }, [currentFilter, onFilterChange]);

  // Handle external reset signal
  React.useEffect(() => {
    if (resetSignal !== undefined) {
      resetFilters();
      resetFilterType();
      onReportTypeChange?.('' as any);
    }
  }, [resetSignal]);

  // Date range handlers
  const handleStartDateChange = (date: Dayjs | null) => {
    updateFilter({
      ...currentFilter,
      startDate: date ? date.format('YYYY-MM-DD') : undefined,
    });
  };

  const handleEndDateChange = (date: Dayjs | null) => {
    updateFilter({
      ...currentFilter,
      endDate: date ? date.format('YYYY-MM-DD') : undefined,
    });
  };

  const handleDateRangeSelect = (start: Dayjs, end: Dayjs) => {
    updateFilter({
      ...currentFilter,
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD'),
    });
  };

  // Employee selection handler
  const handleEmployeeChange = (ids: string[]) => {
    updateFilter({
      ...currentFilter,
      employeeIds: ids,
    });
  };

  // User filter type change handler
  const handleFilterTypeChange = (type: string) => {
    handleUserFilterTypeChange(type as any);
    updateFilter({
      ...currentFilter,
      employeeIds: type === 'individual' ? currentFilter.employeeIds : [],
      teamId: type === 'team' ? currentFilter.teamId : '',
      projectId: type === 'project' ? currentFilter.projectId : '',
    });
  };

  // Team selection handler
  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
    updateFilter({
      ...currentFilter,
      teamId: teamId,
      employeeIds: [],
    });
  };

  // Project selection handler
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    updateFilter({
      ...currentFilter,
      projectId: projectId,
      employeeIds: [],
    });
  };

  // Reset handler
  const handleResetClick = () => {
    resetFilterType();
    onReportTypeChange?.('' as any);
    if (onResetFilters) {
      onResetFilters();
    } else {
      resetFilters();
    }
  };


  // Transform data for UserSelectionField
  const teamItems = teams.map(team => ({
    _id: team._id,
    name: team.teamName,
    userCount: team.members.length,
    supervisor: team.supervisor 
      ? `${team.supervisor.firstName} ${team.supervisor.lastName}`
      : undefined,
  }));

  const projectItems = projects.map(project => ({
    _id: project._id,
    name: project.projectName,
    userCount: project.employees.length,
    supervisor: project.supervisor 
      ? `${project.supervisor.firstName} ${project.supervisor.lastName}`
      : undefined,
  }));

  return (
    <ReportLayout
      title="Report Filters"
      disabled={disabled}
      noBorder
      action={
        <FilterActions
          onReset={handleResetClick}
          onDateRangeSelect={handleDateRangeSelect}
          disabled={disabled}
        />
      }
    >
      <Box display="flex" flexDirection="column" gap={2}>
        {/* First Row: Date Range & Filter Type */}
        <FilterRow>
          <FilterColumn>
            <DateRangePicker
              startDate={currentFilter.startDate}
              endDate={currentFilter.endDate}
              onStartDateChange={handleStartDateChange}
              onEndDateChange={handleEndDateChange}
              disabled={disabled}
            />
          </FilterColumn>
          <FilterColumn>
            <UserFilterTypeSelector
              filterType={userFilterType}
              onChange={handleFilterTypeChange}
              disabled={disabled}
              availableOptions={availableFilterOptions}
            />
          </FilterColumn>
        </FilterRow>

        {/* Second Row: User Selection & Report Type */}
        <FilterRow>
          <FilterColumn>
            <UserSelectionField
              filterType={userFilterType}
              employees={supervisedEmployees}
              selectedEmployeeIds={currentFilter.employeeIds || []}
              onEmployeeChange={handleEmployeeChange}
              teams={teamItems}
              selectedTeamId={selectedTeamId}
              onTeamChange={handleTeamChange}
              isLoadingTeams={isLoadingTeams}
              projects={projectItems}
              selectedProjectId={selectedProjectId}
              onProjectChange={handleProjectChange}
              isLoadingProjects={isLoadingProjects}
              disabled={disabled}
              showHelperText={true}
            />
          </FilterColumn>
          <FilterColumn>
            <ReportTypeSelect
              reportType={reportType}
              onReportTypeChange={onReportTypeChange}
              disabled={disabled}
            />
          </FilterColumn>
        </FilterRow>

        {/* Report Generation Panel */}
        {reportMetadata && (
          <ReportGenerationPanel
            reportMetadata={reportMetadata}
            isFilterValid={isFilterValid}
            isGenerating={Boolean(isGenerating)}
            onGenerateReport={(fmt) => onGenerateReport && onGenerateReport(fmt)}
            error={error}
          />
        )}
      </Box>
    </ReportLayout>
  );
};

export default ReportFilterForm;
