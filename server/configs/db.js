import mongoose from 'mongoose';

const connectDB = async () =>{
    // Use environment variable or fallback to local connection
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://Deepak:123@cluster0.5pdgn48.mongodb.net';
    
    try {
        mongoose.connection.on('connected', ()=> console.log('Database connected'));
        mongoose.connection.on('error', (err)=> console.log('Database error:', err.message));
        mongoose.connection.on('disconnected', ()=> console.log('Database disconnected'));
        
        // Try to connect with better timeout settings
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 30000, // Increased timeout
            connectTimeoutMS: 30000,        // Increased timeout
            socketTimeoutMS: 45000,         // Added socket timeout
            maxPoolSize: 10,                // Maintain up to 10 socket connections
            minPoolSize: 5,                 // Maintain a minimum of 5 socket connections
            maxIdleTimeMS: 30000,           // Close connections after 30 seconds of inactivity
        });
        
        console.log(`✅ Connected to MongoDB: ${mongoose.connection.db.databaseName}`);
    } catch (error) {
        console.log('❌ Database connection error:', error.message);
        
        // Try local MongoDB as fallback
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
                throw error; // Throw original error
            }
        } else {
            throw error;
        }
    }
}

export default connectDB;