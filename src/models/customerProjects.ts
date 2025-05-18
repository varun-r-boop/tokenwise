import mongoose from 'mongoose';
export interface IProject {
    _id: string;
    projectName: string;
    usersEmail : string[];
    createdAt : Date;
  }

const customerProjectSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    projectName: { type: String, required: true },
    usersEmail: { type: [String], required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IProject>('CustomerProject', customerProjectSchema); 
