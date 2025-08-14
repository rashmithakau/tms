import { CREATED } from '../constants/http';
import { registerSchema } from '../schemas/user.schema';
import catchErrors from '../utils/catchErrors';
import { createUser } from '../services/user.service';
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

    // Save data in the database
    const user = await createUser(requestWithRole);

    // Return the created user with a 201 status
    return res.status(CREATED).json(user);
  });