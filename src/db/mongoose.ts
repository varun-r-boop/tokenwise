import dotenv from 'dotenv';
import { MongoClient, Db } from 'mongodb';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB || undefined;

let client: MongoClient;
let db: Db;

export const connectDB = async (): Promise<void> => {
  try {
    if (!client ) {
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      db = dbName ? client.db(dbName) : client.db();
      console.log('MongoDB connected');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export function getDB() {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
}