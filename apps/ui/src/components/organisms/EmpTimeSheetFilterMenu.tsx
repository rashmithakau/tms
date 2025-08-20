import React, { useState } from 'react';
import { Dayjs } from 'dayjs';
import {
	Box,
	Popover,
	Typography,
	ToggleButtonGroup,
	ToggleButton,
	Divider,
	Chip,
	Stack,
} from '@mui/material';
import BaseBtn from '../atoms/buttons/BaseBtn';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { TimesheetStatus } from '@tms/shared';
import DatePickerField from '../atoms/inputFields/DatePickerField';

export type DateRange = 'All' | 'Today' | 'This Week' | 'This Month';

interface FilterMenuProps {
	selectedDateRange: DateRange;
	selectedStatus: TimesheetStatus | 'All';
	onFilterByDate: (range: DateRange) => void;
	onFilterByStatus: (status: TimesheetStatus | 'All') => void;
	selectedDay: Dayjs | null;
	selectedMonth: Dayjs | null;
	selectedYear: Dayjs | null;
	onChangeDay: (value: Dayjs | null) => void;
	onChangeMonth: (value: Dayjs | null) => void;
	onChangeYear: (value: Dayjs | null) => void;
	onClear: () => void;
  statusOptions?: Array<TimesheetStatus | 'All'>;
}

const DEFAULT_STATUS_OPTIONS: Array<TimesheetStatus | 'All'> = [
	'All',
	TimesheetStatus.Draft,
	TimesheetStatus.Pending,
	TimesheetStatus.Approved,
	TimesheetStatus.Rejected,
];

const DATE_RANGE_OPTIONS: DateRange[] = ['All', 'Today', 'This Week', 'This Month'];

const FilterMenu: React.FC<FilterMenuProps> = ({ selectedDateRange, selectedStatus, onFilterByDate, onFilterByStatus, selectedDay, selectedMonth, selectedYear, onChangeDay, onChangeMonth, onChangeYear, onClear, statusOptions }) => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const STATUS_OPTIONS = statusOptions && statusOptions.length > 0 ? statusOptions : DEFAULT_STATUS_OPTIONS;
	const activeCount =
		(selectedStatus !== 'All' ? 1 : 0) +
		(selectedDateRange !== 'All' ? 1 : 0) +
		(selectedDay ? 1 : 0) +
		(selectedMonth ? 1 : 0) +
		(selectedYear ? 1 : 0);

	const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<Box>
				<BaseBtn
					startIcon={<FilterAltOutlinedIcon />}
					onClick={handleOpen}
					variant="text"
					aria-label="Open filter menu"
					aria-controls={open ? 'filter-popover' : undefined}
				>
					Filter
				</BaseBtn>
		

			<Popover
				id="filter-popover"
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				transformOrigin={{ vertical: 'top', horizontal: 'left' }}
				PaperProps={{ sx: { p: 2, width: 500 } }}
			>
				<Box>
					{activeCount > 0 && (
						<Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
							{selectedStatus !== 'All' && (
								<Chip size="small" label={`Status: ${selectedStatus}`} onDelete={() => onFilterByStatus('All')} />
							)}
							{selectedDateRange !== 'All' && (
								<Chip size="small" label={`Range: ${selectedDateRange}`} onDelete={() => onFilterByDate('All')} />
							)}
							{selectedDay && (
								<Chip size="small" label={`Day: ${selectedDay.format('YYYY-MM-DD')}`} onDelete={() => onChangeDay(null)} />
							)}
							{selectedMonth && (
								<Chip size="small" label={`Month: ${selectedMonth.format('YYYY-MM')}`} onDelete={() => onChangeMonth(null)} />
							)}
							{selectedYear && (
								<Chip size="small" label={`Year: ${selectedYear.format('YYYY')}`} onDelete={() => onChangeYear(null)} />
							)}
						</Stack>
					)}

					<Typography variant="subtitle2" sx={{ mb: 1 }}>
						Date range
					</Typography>
					<ToggleButtonGroup
						exclusive
						size="small"
						value={selectedDateRange}
						onChange={(_, value) => {
							if (value) {
								onFilterByDate(value);
								if (value !== 'All') {
									onChangeDay(null);
									onChangeMonth(null);
									onChangeYear(null);
								}
							}
						}}
						aria-label="Date range filter"
						sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}
					>
						{DATE_RANGE_OPTIONS.map((range) => (
							<ToggleButton key={range} value={range} aria-label={range}>
								{range}
							</ToggleButton>
						))}
					</ToggleButtonGroup>

					<Divider sx={{ my: 1 }} />

					<Typography variant="subtitle2" sx={{ mb: 1 }}>
						Status
					</Typography>
					<ToggleButtonGroup
						exclusive
						size="small"
						value={selectedStatus}
						onChange={(_, value) => value && onFilterByStatus(value)}
						aria-label="Status filter"
						sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}
					>
						{STATUS_OPTIONS.map((status) => (
							<ToggleButton key={status} value={status} aria-label={status} >
								{status}
							</ToggleButton>
						))}
					</ToggleButtonGroup>

					<Divider sx={{ my: 1 }} />

					<Typography variant="subtitle2" sx={{ mb: 1 }}>
						Specific day
					</Typography>
					<DatePickerField
						label="Day"
						value={selectedDay}
						onChange={(v: Dayjs | null) => {
							onChangeDay(v);
							if (v) {
								onFilterByDate('All');
								onChangeMonth(null);
								onChangeYear(null);
							}
						}}
						format="YYYY-MM-DD"
						slotProps={{ textField: { fullWidth: true, size: "small" } }}
					/>

					<Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
						<Box sx={{ flex: 1 }}>
							<Typography variant="subtitle2" sx={{ mb: 1 }}>
								Specific month
							</Typography>
							<DatePickerField
								label="Month"
								value={selectedMonth}
								onChange={(v: Dayjs | null) => {
									onChangeMonth(v);
									if (v) {
										onFilterByDate('All');
										onChangeDay(null);
										onChangeYear(null);
									}
								}}
								views={["year", "month"] as any}
								openTo={"month" as any}
								format="YYYY-MM"
								slotProps={{ textField: { fullWidth: true, size: "small" } }}
							/>
						</Box>
						<Box sx={{ flex: 1 }}>
							<Typography variant="subtitle2" sx={{ mb: 1 }}>
								Specific year
							</Typography>
							<DatePickerField
								label="Year"
								value={selectedYear}
								onChange={(v: Dayjs | null) => {
									onChangeYear(v);
									if (v) {
										onFilterByDate('All');
										onChangeDay(null);
										onChangeMonth(null);
									}
								}}
								views={["year"] as any}
								openTo={"year" as any}
								format="YYYY"
								slotProps={{ textField: { fullWidth: true, size: "small" } }}
							/>
						</Box>
					</Box>

					<Box sx={{ display: 'flex', justifyContent: 'right', padding:2,gap:2}}>
						<BaseBtn
							size="small"
							variant="outlined"
							onClick={() => {
								onClear();
							}}
						>
							Clear
						</BaseBtn>
						<BaseBtn size="small" variant="contained" onClick={handleClose}>
							Done
						</BaseBtn>
					</Box>
				</Box>
			</Popover>
		</Box>
	);
};

export default FilterMenu;