import { Request, Response } from 'express';
import { getDB } from '../db/mongoose';
import { IProject } from '../models/customerProjects';

const getProjectDetails = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const _mongoDbContext = getDB();
        const projectEntity = _mongoDbContext.collection<IProject>('customerProjects');

        const project = await projectEntity.findOne({ _id: projectId });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        return res.status(200).json(project);
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: "Error fetching project details" });
    }
};

export default { getProjectDetails };
