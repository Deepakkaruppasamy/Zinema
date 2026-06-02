import mongoose from 'mongoose';

const connectDB = async () =>{
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://Deepak:123@cluster0.5pdgn48.mongodb.net';
    
    try {
        mongoose.connection.on('connected', ()=> console.log('Database connected'));
        mongoose.connection.on('error', (err)=> console.log('Database error:', err.message));
        mongoose.connection.on('disconnected', ()=> console.log('Database disconnected'));
        
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 30000,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 5,
            maxIdleTimeMS: 30000,
        });
        
        console.log(`✅ Connected to MongoDB: ${mongoose.connection.db.databaseName}`);
    } catch (error) {
        console.log('❌ Database connection error:', error.message);
        
        if (mongoUri.includes('mongodb.net')) {
            console.log('🔄 Trying local MongoDB as fallback...');
            try {
                await mongoose.connect('mongodb+srv://Deepak:123@cluster0.5pdgn48.mongodb.net', {
                    serverSelectionTimeoutMS: 5000,
                    connectTimeoutMS: 5000
                });
                console.log('✅ Connected to local MongoDB fallback');
            } catch (fallbackError) {
                console.log('❌ Local MongoDB fallback failed:', fallbackError.message);
                throw error;
            }
        } else {
            throw error;
        }
    }
}

export default connectDB;