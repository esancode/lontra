import mongoose from "mongoose";

export const connectDB = async () => {
    try {
       const uri = "mongodb://erickvicentedeveloper_db_user:F0dBCru6xsuYKcV0@ac-mov5zhm-shard-00-00.yfman44.mongodb.net:27017,ac-mov5zhm-shard-00-01.yfman44.mongodb.net:27017,ac-mov5zhm-shard-00-02.yfman44.mongodb.net:27017/lontra?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";
       await mongoose.connect(uri, { family: 4 });
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
}