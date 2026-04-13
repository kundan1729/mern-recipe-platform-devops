import express from 'express';
import { signup, signin, getProfile, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
