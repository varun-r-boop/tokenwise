import { getDB } from '../db/mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import  { IUser } from '../models/user';
import  { IProject } from '../models/customerProjects';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';

const signUp = async (req: Request, res: Response) => {
  try {
    const _mongoDbContext = getDB();
    const userEntity = _mongoDbContext.collection<IUser>('users');
    const projectEntity = _mongoDbContext.collection<IProject>('customerProjects');
    const { email, password, customerAppName } = req.body;

    // Check If The Input Fields are Valid
    if (!email || !password || !customerAppName) {
      return res
        .status(400)
        .json({ message: "Please Input Email, Password and Customer App Name" });
    }

    // Check If User Exists In The Database
    const query = { email: email };
    const existingUser = await userEntity.findOne(query);

    if (existingUser) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    // Hash The User's Password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser: IUser = {
      _id: uuidv4(),
      email: email,
      password: hashedPassword,
    }
    // Save The User To The Database
    await userEntity.insertOne(newUser)

    const newProject = {
      _id: uuidv4(),
      projectName: customerAppName,
      usersEmail: [email],
      createdAt: new Date()
    }
    // Create Customer Project
    await projectEntity.insertOne(newProject);

    return res
      .status(201)
      .json({ 
        message: "User and Project Created Successfully", 
        user: newUser,
        project: newProject 
      });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: "Error creating user and project" });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const _mongoDbContext = getDB();
    const userEntity = _mongoDbContext.collection<IUser>('users');
    const projectEntity = _mongoDbContext.collection<IProject>('customerProjects');
    const { email, password } = req.body;

    // Check If The Input Fields are Valid
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please Input email and Password" });
    }

    // Check If User Exists In The Database
    const query = { email: email };
    const user =  await userEntity.findOne(query);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare Passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Find the customer project associated with the user's email
    const customerProject = await projectEntity.findOne({ usersEmail: email });

    if (!customerProject) {
      return res.status(404).json({ message: "No project found for this user" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, email: user.email, projectId : customerProject._id },
      process.env.SECRET_KEY || "1234!@#%<{*&)",
      { expiresIn: "1h" }
    );

    return res
      .status(200)
      .json({ 
        message: "Login Successful", 
        data: {
          project: customerProject,
          user: {
            email: user.email,
            id: user._id
          }
        }, 
        token 
      });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: "Error during login" });
  }
};

export default { signUp, login };