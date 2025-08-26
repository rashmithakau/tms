import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import { UserRole } from '@tms/shared';
import {createAbsenceHandler} from '../controllers/absence.controller';

const absenceRoutes = Router();

absenceRoutes.post('/', authenticate([UserRole.Emp,UserRole.Supervisor]), createAbsenceHandler);

export default absenceRoutes;



