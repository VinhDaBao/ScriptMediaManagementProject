import mongoose from 'mongoose';
import 'dotenv/config'; 

const connectDB = async () => {
    try {
        const dbURI = process.env.MONGO_URI; 
        if (!dbURI) {
            throw new Error("MONGO_URI is not defined in the .env file.");
        }
    
        await mongoose.connect(dbURI);
        console.log('>>> MongoDB Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1); 
    }
}

export default connectDB;

