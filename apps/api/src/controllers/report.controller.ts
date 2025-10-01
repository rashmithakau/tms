import { RequestHandler } from 'express';
import { Timesheet } from '../models/timesheet.model';
import TeamModel from '../models/team.model';
import UserModel from '../models/user.model';
import ProjectModel from '../models/project.model';
import { appAssert } from '../utils/validation';
import { BAD_REQUEST, FORBIDDEN } from '../constants/http';
import { UserRole, TimesheetStatus, REPORT_METADATA } from '@tms/shared';
import { SubmissionStatusExcel, ApprovalStatusExcel, DetailedTimesheetExcel } from '../utils/report/excel';
import { 
  ProfessionalSubmissionStatusReport,
  ProfessionalApprovalStatusReport,
  ProfessionalDetailedTimesheetReport
} from '../utils/report/pdf';
import { getSupervisedUserIds } from '../utils/data/assignmentUtils';

type ReportFormat = 'pdf' | 'excel';

const parseDate = (value?: string) => (value ? new Date(value) : undefined);

const formatDateForDisplay = (date: Date | string): string => {
  const d = new Date(date);
  return d.toISOString().slice(0, 10); 
};

const getSupervisedEmployeeIds = async (supervisorId: string): Promise<string[]> => {
  // Get all supervised user IDs 
  const supervisedIds = await getSupervisedUserIds(supervisorId);
  
  // Ensure supervisor's own ID is never included
  return supervisedIds.filter(id => id !== supervisorId);
};

export const getReportMetadataHandler: RequestHandler = async (req, res) => {
  res.json(REPORT_METADATA);
};

export const getSupervisedEmployeesHandler: RequestHandler = async (req, res) => {
  const userRole = req.userRole as UserRole;
  const supervisorId = req.userId as string;
  appAssert(
    [UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin, UserRole.SuperAdmin].includes(userRole),
    FORBIDDEN,
    'Access denied'
  );

  let employees;
  
  if (userRole === UserRole.Admin || userRole === UserRole.SupervisorAdmin || userRole === UserRole.SuperAdmin) {
    // Admin, SupervisorAdmin, and SuperAdmin can see all users except SuperAdmin
    employees = await UserModel.find({ 
      role: { $in: [UserRole.Emp, UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin] }
    })
      .select('_id firstName lastName email')
      .lean();
  } else {
    // Supervisor can only see their supervised employees
    const memberIds = await getSupervisedEmployeeIds(supervisorId);
    employees = await UserModel.find({ _id: { $in: memberIds } })
      .select('_id firstName lastName email')
      .lean();
  }
  
  res.json({ employees });
};

const buildTimesheetQuery = (supervisorId: string, userRole: UserRole, params: any) => {
  const { startDate, endDate, employeeIds, approvalStatus, projectIds, teamIds } = params as {
    startDate?: string;
    endDate?: string;
    employeeIds?: string[] | string;
    approvalStatus?: string[] | string;
    projectIds?: string[] | string;
    teamIds?: string[] | string;
  };

  const memberFilter = { $in: [] as any[] };
  if (employeeIds) {
    const list = Array.isArray(employeeIds) ? employeeIds : [employeeIds];
    memberFilter.$in = list;
  }

  const query: any = {};
  if (startDate || endDate) {
    query.weekStartDate = {};
    if (startDate) query.weekStartDate.$gte = parseDate(startDate);
    if (endDate) query.weekStartDate.$lte = parseDate(endDate);
  }

  if (approvalStatus) {
    const list = Array.isArray(approvalStatus) ? approvalStatus : [approvalStatus];
    query.status = { $in: list.filter(Boolean) };
  }

  if (projectIds) {
    const list = Array.isArray(projectIds) ? projectIds : [projectIds];
    if (list.length) {
      query['data.items.projectId'] = { $in: list };
    }
  }

  if (teamIds) {
    const list = Array.isArray(teamIds) ? teamIds : [teamIds];
    if (list.length) {
      query['data.items.teamId'] = { $in: list };
    }
  }

  return { query, memberFilter };
};

const ensureSupervisorScope = async (supervisorId: string, userRole: UserRole, memberFilter: any) => {
  if (userRole === UserRole.Admin || userRole === UserRole.SupervisorAdmin || userRole === UserRole.SuperAdmin) {
    // Admin, SupervisorAdmin, and SuperAdmin can access all employees except SuperAdmin
    if (memberFilter?.$in?.length) {
      // If specific employees are selected, use those
      return memberFilter.$in;
    } else {
      // If no specific employees selected, get all employees except SuperAdmin
      const allEmployees = await UserModel.find({ 
        role: { $in: [UserRole.Emp, UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin] }
      }).select('_id').lean();
      return allEmployees.map((emp: any) => String(emp._id));
    }
  } else {
    // Supervisor can only access their supervised employees
    const memberIds = await getSupervisedEmployeeIds(supervisorId);
    const scoped = memberFilter?.$in?.length ? memberFilter.$in.filter((id: string) => memberIds.includes(id)) : memberIds;
    return scoped;
  }
};

// Helpers to emit files
const sendExcel = async (res: any, filename: string, build: (gen: any) => void) => {
  await build;
  await (build as any);
};

export const generateSubmissionStatusReportHandler: RequestHandler = async (req, res) => {
  const userRole = req.userRole as UserRole;
  appAssert(
    [UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin, UserRole.SuperAdmin].includes(userRole),
    FORBIDDEN,
    'Access denied'
  );

  const supervisorId = req.userId as string;
  const { format = 'excel', startDate, endDate, employeeIds, submissionStatus, projectIds, teamIds } = req.query as any;

  const { query, memberFilter } = buildTimesheetQuery(supervisorId, userRole, { startDate, endDate, employeeIds, projectIds, teamIds });
  const scopedIds = await ensureSupervisorScope(supervisorId, userRole, memberFilter);

  const timesheets = await Timesheet.find({ ...query, userId: { $in: scopedIds } }).lean();

  // Resolve user info
  const users = await UserModel.find({ _id: { $in: scopedIds } }).select('_id firstName lastName email').lean();
  const userMap = new Map<string, { name: string; email: string }>();
  users.forEach((u: any) => userMap.set(String(u._id), { name: `${u.firstName} ${u.lastName}`, email: u.email }));

  const data = timesheets.map((t: any) => {
    const u = userMap.get(String(t.userId));
    const status: 'Submitted' | 'Missing' = t.status === TimesheetStatus.Draft ? 'Missing' : 'Submitted';
    const projectIdSet = new Set<string>();
    const teamIdSet = new Set<string>();
    
    // Calculate total hours from timesheet data
    let totalHours = 0;
    (t.data || []).forEach((cat: any) => {
      (cat.items || []).forEach((it: any) => {
        if (it.projectId) projectIdSet.add(String(it.projectId));
        if (it.teamId) teamIdSet.add(String(it.teamId));
        // Sum up daily hours
        if (Array.isArray(it.hours)) {
          totalHours += it.hours.reduce((sum: number, hours: number) => sum + (hours || 0), 0);
        }
      });
    });
    
    // Calculate days late if applicable
    const submissionDate = t.submittedAt || t.updatedAt;
    const weekStart = new Date(t.weekStartDate);
    const expectedSubmissionDate = new Date(weekStart);
    expectedSubmissionDate.setDate(weekStart.getDate() + 7); // Due 1 week after week start
    
    let daysLate = 0;
    if (submissionDate && status === 'Submitted') {
      const actualSubmission = new Date(submissionDate);
      if (actualSubmission > expectedSubmissionDate) {
        daysLate = Math.ceil((actualSubmission.getTime() - expectedSubmissionDate.getTime()) / (1000 * 60 * 60 * 24));
      }
    }

    // Ensure submissionStatus is typed correctly
    let submissionStatus: 'Submitted' | 'Late' | 'Missing';
    if (status === 'Missing') {
      submissionStatus = 'Missing';
    } else if (daysLate > 0) {
      submissionStatus = 'Late';
    } else {
      submissionStatus = 'Submitted';
    }
    
    return {
      employeeId: String(t.userId),
      employeeName: u?.name || 'Unknown',
      employeeEmail: u?.email || '',
      weekStartDate: formatDateForDisplay(t.weekStartDate),
      submissionStatus,
      submissionDate: submissionDate ? formatDateForDisplay(submissionDate) : null,
      daysLate: daysLate,
      totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
      projectIds: Array.from(projectIdSet),
      teamIds: Array.from(teamIdSet),
    };
  });

  const statusFilter = submissionStatus ? (Array.isArray(submissionStatus) ? submissionStatus : [submissionStatus]) : [];
  const filtered = statusFilter.length ? data.filter((r) => statusFilter.includes(r.submissionStatus)) : data;

  // Map ids to names for preview
  if (format === 'json') {
    const allProjectIds = Array.from(new Set(filtered.flatMap((r: any) => r.projectIds)));
    const allTeamIds = Array.from(new Set(filtered.flatMap((r: any) => r.teamIds)));
    const [projects, teams] = await Promise.all([
      allProjectIds.length ? ProjectModel.find({ _id: { $in: allProjectIds } }).select('_id projectName').lean() : [],
      allTeamIds.length ? TeamModel.find({ _id: { $in: allTeamIds } }).select('_id teamName').lean() : [],
    ]);
    const projectMap = new Map<string, string>(projects.map((p: any) => [String(p._id), p.projectName] as [string, string]));
    const teamMap = new Map<string, string>(teams.map((t: any) => [String(t._id), t.teamName] as [string, string]));
    const withNames = filtered.map((r: any) => ({
      ...r,
      projects: (r.projectIds || []).map((id: string) => projectMap.get(id) || id),
      teams: (r.teamIds || []).map((id: string) => teamMap.get(id) || id),
    }));
    return res.json({ data: withNames });
  }

  if (format === 'json') {
    return res.json({ data: filtered });
  }
  if (format === 'pdf') {
    const pdf = new ProfessionalSubmissionStatusReport();
    const doc = pdf.generate(filtered, { startDate, endDate });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=submission-status-report.pdf');
    doc.pipe(res);
    doc.end();
    return;
  }

  const excel = new SubmissionStatusExcel();
  excel.build(filtered, { startDate, endDate });
  await excel.write(res, 'submission-status-report');
};

export const generateApprovalStatusReportHandler: RequestHandler = async (req, res) => {
  const supervisorId = req.userId as string;
  const userRole = req.userRole as UserRole;
  const { format = 'excel', startDate, endDate, employeeIds, approvalStatus, projectIds, teamIds } = req.query as any;

  const { query, memberFilter } = buildTimesheetQuery(supervisorId, userRole, { startDate, endDate, employeeIds, approvalStatus, projectIds, teamIds });
  const scopedIds = await ensureSupervisorScope(supervisorId, userRole, memberFilter);

  const timesheets = await Timesheet.find({ ...query, userId: { $in: scopedIds } }).lean();
  const users = await UserModel.find({ _id: { $in: scopedIds } }).select('_id firstName lastName email').lean();
  const userMap = new Map<string, { name: string; email: string }>();
  users.forEach((u: any) => userMap.set(String(u._id), { name: `${u.firstName} ${u.lastName}`, email: u.email }));

  const data = timesheets.map((t: any) => {
    // Calculate total hours from timesheet data
    let totalHours = 0;
    (t.data || []).forEach((cat: any) => {
      (cat.items || []).forEach((it: any) => {
        if (Array.isArray(it.hours)) {
          totalHours += it.hours.reduce((sum: number, hours: number) => sum + (hours || 0), 0);
        }
      });
    });

    return {
      employeeId: String(t.userId),
      employeeName: userMap.get(String(t.userId))?.name || 'Unknown',
      employeeEmail: userMap.get(String(t.userId))?.email || '',
      weekStartDate: formatDateForDisplay(t.weekStartDate),
      timesheetId: String(t._id),
      submissionDate: t.submittedAt ? formatDateForDisplay(t.submittedAt) : null,
      approvalStatus: t.status,
      approvalDate: t.approvedAt ? formatDateForDisplay(t.approvedAt) : null,
      totalHours: Math.round(totalHours * 100) / 100,
      rejectionReason: t.rejectionReason,
      projectIds: Array.from(new Set((t.data || []).flatMap((c: any) => (c.items || []).map((it: any) => String(it.projectId || ''))).filter(Boolean))),
      teamIds: Array.from(new Set((t.data || []).flatMap((c: any) => (c.items || []).map((it: any) => String(it.teamId || ''))).filter(Boolean))),
    };
  });

  if (format === 'json') {
    const allProjectIds = Array.from(new Set(data.flatMap((r: any) => r.projectIds)));
    const allTeamIds = Array.from(new Set(data.flatMap((r: any) => r.teamIds)));
    const [projects, teams] = await Promise.all([
      allProjectIds.length ? ProjectModel.find({ _id: { $in: allProjectIds } }).select('_id projectName').lean() : [],
      allTeamIds.length ? TeamModel.find({ _id: { $in: allTeamIds } }).select('_id teamName').lean() : [],
    ]);
    const projectMap = new Map<string, string>(projects.map((p: any) => [String(p._id), p.projectName] as [string, string]));
    const teamMap = new Map<string, string>(teams.map((t: any) => [String(t._id), t.teamName] as [string, string]));
    const withNames = data.map((r: any) => ({
      ...r,
      projects: (r.projectIds || []).map((id: string) => projectMap.get(id) || id),
      teams: (r.teamIds || []).map((id: string) => teamMap.get(id) || id),
    }));
    return res.json({ data: withNames });
  }
  if (format === 'pdf') {
    const pdf = new ProfessionalApprovalStatusReport();
    const doc = pdf.generate(data, { startDate, endDate });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=approval-status-report.pdf');
    doc.pipe(res);
    doc.end();
    return;
  }

  const excel = new ApprovalStatusExcel();
  excel.build(data, { startDate, endDate });
  await excel.write(res, 'approval-status-report');
};

export const generateDetailedTimesheetReportHandler: RequestHandler = async (req, res) => {
  const supervisorId = req.userId as string;
  const userRole = req.userRole as UserRole;
  const { format = 'excel', startDate, endDate, employeeIds, projectIds, teamIds } = req.query as any;

  const { query, memberFilter } = buildTimesheetQuery(supervisorId, userRole, { startDate, endDate, employeeIds, projectIds, teamIds });
  const scopedIds = await ensureSupervisorScope(supervisorId, userRole, memberFilter);

  const timesheets = await Timesheet.find({ ...query, userId: { $in: scopedIds } }).lean();
  const users = await UserModel.find({ _id: { $in: scopedIds } }).select('_id firstName lastName email').lean();
  const userMap = new Map<string, { name: string; email: string }>();
  users.forEach((u: any) => userMap.set(String(u._id), { name: `${u.firstName} ${u.lastName}`, email: u.email }));

  // Get all unique project and team IDs
  const allProjectIds = Array.from(new Set(timesheets.flatMap((t: any) => 
    (t.data || []).flatMap((cat: any) => 
      (cat.items || []).map((item: any) => item.projectId).filter(Boolean)
    )
  )));
  const allTeamIds = Array.from(new Set(timesheets.flatMap((t: any) => 
    (t.data || []).flatMap((cat: any) => 
      (cat.items || []).map((item: any) => item.teamId).filter(Boolean)
    )
  )));

  // Fetch project and team names
  const [projects, teams] = await Promise.all([
    allProjectIds.length ? ProjectModel.find({ _id: { $in: allProjectIds } }).select('_id projectName').lean() : [],
    allTeamIds.length ? TeamModel.find({ _id: { $in: allTeamIds } }).select('_id teamName').lean() : [],
  ]);
  
  const projectMap = new Map<string, string>(projects.map((p: any) => [String(p._id), p.projectName] as [string, string]));
  const teamMap = new Map<string, string>(teams.map((t: any) => [String(t._id), t.teamName] as [string, string]));

  const data = timesheets.map((t: any) => {
    const user = userMap.get(String(t.userId));
    let totalTimesheetHours = 0;
    
    const categories = (t.data || []).map((cat: any) => ({
      category: cat.category,
      items: (cat.items || []).map((item: any) => {
        // Calculate total hours for this item
        const dailyHours = Array.isArray(item.hours) ? item.hours : [];
        const itemTotalHours = dailyHours.reduce((sum: number, hours: number) => sum + (hours || 0), 0);
        totalTimesheetHours += itemTotalHours;
        
        return {
          work: item.work,
          projectId: item.projectId,
          projectName: item.projectId ? projectMap.get(String(item.projectId)) || item.projectId : '',
          teamId: item.teamId,
          teamName: item.teamId ? teamMap.get(String(item.teamId)) || item.teamId : '',
          dailyHours: dailyHours,
          dailyDescriptions: Array.isArray(item.descriptions) ? item.descriptions : [],
          dailyStatus: Array.isArray(item.dailyStatus) ? item.dailyStatus : [],
          totalHours: Math.round(itemTotalHours * 100) / 100,
        };
      }),
    }));
    
    return {
      employeeId: String(t.userId),
      employeeName: user?.name || 'Unknown',
      employeeEmail: user?.email || '',
      weekStartDate: formatDateForDisplay(t.weekStartDate),
      timesheetId: String(t._id),
      status: t.status,
      submissionDate: t.submittedAt ? formatDateForDisplay(t.submittedAt) : null,
      approvalDate: t.approvedAt ? formatDateForDisplay(t.approvedAt) : null,
      rejectionReason: t.rejectionReason,
      totalHours: Math.round(totalTimesheetHours * 100) / 100,
      categories: categories,
    };
  });

  if (format === 'json') {
    return res.json({ data });
  }
  if (format === 'pdf') {
    const pdf = new ProfessionalDetailedTimesheetReport();
    const doc = pdf.generate(data, { startDate, endDate });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=detailed-timesheet-report.pdf');
    doc.pipe(res);
    doc.end();
    return;
  }

  const excel = new DetailedTimesheetExcel();
  excel.build(data, { startDate, endDate });
  await excel.write(res, 'detailed-timesheet-report');
};


export const previewSubmissionStatusHandler: RequestHandler = async (req, res) => {
  (req.query as any).format = 'json';
  
  res.status(400).json({ message: 'Preview endpoint not implemented' });
};



