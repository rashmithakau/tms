import { CREATED } from '../constants/http';
import { registerSchema } from '../schemas/user.schema';
import catchErrors from '../utils/catchErrors';
import { createUser } from '../services/user.service';

export const registerHandler = catchErrors(async (req, res) => {
  const request = registerSchema.parse({
    ...req.body,
    userAgent: req.headers['user-agent'],
  });

  //save data in db
  const user = await createUser(request);

  return res.status(CREATED).json(user);
});
