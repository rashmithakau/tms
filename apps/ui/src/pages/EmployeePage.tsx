import SecondaryLayout from '../components/templates/layout/SecondaryLayout';
import { EmpMenuItem } from '@tms/shared';
import { useDispatch, useSelector } from 'react-redux';
import MyTimesheetsWindow from '../components/organisms/timesheet/MyTimesheetsWindow';
import ReviewTimesheetsWindow from '../components/organisms/timesheet/ReviewTimesheetsWindow';
import { ReportDashboard } from '../components/organisms/report';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '@tms/shared';
import MainLayout from '../components/templates/layout/MainLayout';
import { select_btn } from '../store/slices/dashboardNavSlice';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RateReviewIcon from '@mui/icons-material/RateReview';
import {  useEffect } from 'react';

const EmployeePage = () => {

	useEffect(() => {
		dispatch(select_btn('My Timesheets'));  
	}, [])
	

  const dispatch = useDispatch();
  const selectedBtn = useSelector(
    (state: any) => state.dashboardNav.selectedBtn
  );

    const items = [
    [
      { text: 'My Timesheets', icon: <AssignmentIcon /> },
    ]
  ];

    const { authState } = useAuth();
    const {  user } = authState;

    if(user?.role==UserRole.Supervisor){
      items[0].push({ text: 'Review Timesheets', icon: <RateReviewIcon /> });
	  items[0].push({ text: 'Reports', icon: <AssessmentOutlinedIcon /> });
    }

  return (
    <MainLayout items={items}>
    	{selectedBtn=='My Timesheets' && (
    		<MyTimesheetsWindow />
    	)}
    	{selectedBtn=='Review Timesheets' && (
    		<ReviewTimesheetsWindow />
    	)}
    	{selectedBtn=='Reports' && (
    		<ReportDashboard />
    	)}
    </MainLayout>
  );
};

export default EmployeePage;
