import mongoose from 'mongoose';



const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        const connect = await mongoose.connect(process.env.DB, {
            serverSelectionTimeoutMS: 20000,
        });
        console.log(`MongoDB Connected: ${connect.connection.host}`);
    } catch (error) {
        console.log("Error Connect to Database");
    }
}


export default connectDB