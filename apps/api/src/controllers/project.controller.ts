import { CREATED, OK } from '../constants/http';
import {
  createProjectFromUiSchema,
  createProjectNormalizedSchema,
} from '../schemas/project.schema';
import catchErrors from '../utils/catchErrors';
import {
  createProject,
  listProjects,
  updateProjectStaff,
  softDeleteProject,
} from '../services/project.service';
import { UserRole } from '@tms/shared';

export const createHandler = catchErrors(async (req, res) => {
  const parsedUi = createProjectFromUiSchema.parse(req.body);
  const normalized = createProjectNormalizedSchema.parse({
    projectName: parsedUi.projectName,
    billable: parsedUi.billable === 'yes',
    employees: parsedUi.employees,
    supervisor: parsedUi.supervisor ?? null,
  });

  const project = await createProject(normalized);

  return res.status(CREATED).json(project);
});

export const listHandler = catchErrors(async (req, res) => {
  const userId = req.userId as string;
  const userRole = req.userRole as UserRole;
  const result = await listProjects(userId, userRole);
  return res.status(OK).json(result);
});

export const updateStaffHandler = catchErrors(async (req, res) => {
  const { id } = req.params as { id: string };
  const { employees, supervisor } = req.body as {
    employees?: string[];
    supervisor?: string | null;
  };
  const result = await updateProjectStaff(id, { employees, supervisor });
  return res.status(OK).json(result);
});

export const deleteHandler = catchErrors(async (req, res) => {
  const { id } = req.params as { id: string };
  const result = await softDeleteProject(id);
  return res.status(OK).json(result);
});
