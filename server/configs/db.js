import mongoose from 'mongoose';

const connectDB = async () =>{
    try {
        mongoose.connection.on('connected', ()=> console.log('Database connected'));
        
        // Use environment variable or fallback to local connection
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zinema';
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000
        });
        
        console.log(`✅ Connected to MongoDB: ${mongoose.connection.db.databaseName}`);
    } catch (error) {
        console.log('❌ Database connection error:', error.message);
        throw error;
    }
}

export default connectDB;