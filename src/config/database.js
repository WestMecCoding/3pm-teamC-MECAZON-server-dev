import mongoose from "mongoose";

export const connectServerDB = async () => {
    try {
        const serverDB = await mongoose.createConnection(process.env.MONGO_SERVER_URI);
        console.log('Server database connected');
        return serverDB;
    } catch (error) {
        console.error('Server database connection error:', error);
        process.exit(1);
    }
};
export const connectClientDB = async () => {
    try {
        const clientDB = await mongoose.createConnection(process.env.MONGO_CLIENT_URI);
        console.log('Client database connected');
        return clientDB;
    } catch (error) {
        console.error('Client database connection error:', error);
        process.exit(1);
    }
};