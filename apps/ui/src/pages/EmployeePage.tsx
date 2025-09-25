import SecondaryLayout from '../components/templates/layout/SecondaryLayout';
import { EmpMenuItem } from '@tms/shared';
import { useSelector } from 'react-redux';
import MyTimesheetsWindow from '../components/organisms/timesheet/MyTimesheetsWindow';
import ReviewTimesheetsWindow from '../components/organisms/timesheet/ReviewTimesheetsWindow';
import { ReportDashboard } from '../components/organisms/report';
const EmployeePage = () => {
	const empSelectedMenu = useSelector((state: any) => state.empMenuNav.selectedBtn);

	return (
		<SecondaryLayout>
			{empSelectedMenu==EmpMenuItem.MyTimesheets && (
				<MyTimesheetsWindow />
			)}
			{empSelectedMenu==EmpMenuItem.ReviewTimesheets && (
				<ReviewTimesheetsWindow />
			)}
			{empSelectedMenu==EmpMenuItem.Reports && (
				<ReportDashboard />
			)}
		</SecondaryLayout>
	);
};


export default EmployeePage;
