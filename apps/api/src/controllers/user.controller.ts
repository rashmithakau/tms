import { CREATED, OK } from '../constants/http';
import { registerSchema } from '../schemas/user.schema';
import { catchErrors } from '../utils/error';
import { createUser, getUsersByRole, deleteUser, getAllActiveUsers, getAllUsersIncludingInactive } from '../services/user.service';
import { UserRole } from '@tms/shared';
import { Request, Response } from 'express';

export const registerHandler = (role: UserRole) =>
  catchErrors(async (req: Request, res: Response) => {
    const parsedRequest = registerSchema.parse({
      ...req.body,
      userAgent: req.headers['user-agent'],
    });

    const requestWithRole = {
      ...parsedRequest,
      role,
    };

    const user = await createUser(requestWithRole);

    return res.status(CREATED).json(user);
  });


  export const getUserHandler = (role: UserRole | UserRole[]) =>
    catchErrors(async (req: Request, res: Response) => {

      const user = await getUsersByRole(role);
  
      return res.status(OK).json(user);
    });

export const deleteUserHandler = () =>
  catchErrors(async (req: Request, res: Response) => {
    const { id } = req.params;

    await deleteUser(id);

    return res.status(OK).json({ message: 'User deleted successfully' });
  });

export const getAllActiveUsersHandler = () =>
  catchErrors(async (req: Request, res: Response) => {
    const users = await getAllActiveUsers();
    return res.status(OK).json(users);
  });

export const getAllUsersIncludingInactiveHandler = () =>
  catchErrors(async (req: Request, res: Response) => {
    const { roles } = req.query;
    const roleArray = Array.isArray(roles) ? roles : [roles].filter(Boolean);
    const users = await getAllUsersIncludingInactive(roleArray as UserRole[]);
    return res.status(OK).json(users);
  });
