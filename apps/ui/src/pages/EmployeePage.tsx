import SecondaryLayout from '../components/templates/SecondaryLayout';
import { EmpMenuItem } from '@tms/shared';
import { useSelector } from 'react-redux';
import MyTimesheetsWindow from '../components/organisms/MyTimesheetsWindow';
import ReviewTimesheetsWindow from '../components/organisms/ReviewTimesheetsWindow';

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
		</SecondaryLayout>
	);
};


export default EmployeePage;
