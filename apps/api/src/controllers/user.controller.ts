import { CREATED, OK } from '../constants/http';
import { registerSchema } from '../schemas/user.schema';
import catchErrors from '../utils/catchErrors';
import { createUser, getUsersByRole } from '../services/user.service';
import { UserRole } from '@tms/shared';
import { Request, Response } from 'express';

export const registerHandler = (role: UserRole) =>
  catchErrors(async (req: Request, res: Response) => {
    // Validate and parse the request body
    const parsedRequest = registerSchema.parse({
      ...req.body,
      userAgent: req.headers['user-agent'],
    });

    // Assign the role to the parsed request
    const requestWithRole = {
      ...parsedRequest,
      role,
    };

    const user = await createUser(requestWithRole);

    return res.status(CREATED).json(user);
  });

<<<<<<< HEAD
export const getUserHandler = (role: UserRole) =>
  catchErrors(async (req: Request, res: Response) => {
    const user = await getUsersByRole(role);
    return res.status(OK).json(user);
  });
=======
  export const getUserHandler = (role: UserRole | UserRole[]) =>
    catchErrors(async (req: Request, res: Response) => {

      const user = await getUsersByRole(role);
  
      // Return the created user with a 201 status
      return res.status(OK).json(user);
    });
>>>>>>> db7c329 (chore:employee account)
