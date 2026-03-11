import ctrl from '../controllers/controller.js';
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/registerUser', ctrl.registerUser);
router.get('/users', ctrl.allUsers);
router.post('/login', ctrl.loginUser);
router.get('/user',authMiddleware, ctrl.getUser);
// router.get('/profil', ctrl.profilUser);

export default router;