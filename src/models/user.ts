import mongoose from 'mongoose';

export interface IUser{
    _id : string;
    email: string;
    password: string;
}
const userSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
});


export default mongoose.model<IUser>('User', userSchema); 

