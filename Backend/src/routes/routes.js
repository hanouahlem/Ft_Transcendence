import ctrl from '../controllers/controller.js';
import { Router } from 'express';

const router = Router();

router.post('/registerUser', ctrl.registerUser);
router.get('/users', ctrl.allUsers);
router.post('/login', ctrl.loginUser);


export default router;