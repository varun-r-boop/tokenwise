import express from 'express';
import projectController from '../controller/projectController.js';

const router = express.Router();

router.get('/:projectId', projectController.getProjectDetails);

export default router; 