import express from 'express';
import projectController from '../controller/projectController';

const router = express.Router();

router.get('/:projectId', projectController.getProjectDetails);

export default router; 