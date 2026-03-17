import ctrl from '../controllers/userController.js';
import friend from '../controllers/friendController.js';
// import post from '../controllers/postController.js';

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/registerUser', ctrl.registerUser);
router.get('/users', ctrl.allUsers);
router.post('/login', ctrl.loginUser);
router.get('/user',authMiddleware, ctrl.getUser);
router.get('/users/search', authMiddleware, ctrl.searchUser);

router.post('/friends', authMiddleware, friend.addFriend);
router.get('/friends', authMiddleware, friend.getFriends);
router.put('/friends/:id', authMiddleware, friend.acceptFriend);
router.delete('/friends/:id', authMiddleware, friend.deleteFriend);
router.get('/friends/requests', authMiddleware, friend.getFriendRequests);




export default router;