import express from 'express';
import userController from '../controller/userController.js';

const router = express.Router();

router.post('/signup', userController.signUp);
router.post('/login', userController.login);

export default router; 