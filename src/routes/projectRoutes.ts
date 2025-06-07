import express from 'express';
import projectController from '../controller/projectController.js';
import { clearCacheByProjectId } from './proxy.js';

const router = express.Router();

router.get('/:projectId', projectController.getProjectDetails);
router.delete('/:projectId/cache', clearCacheByProjectId);

export default router; 