import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongo: MongoMemoryServer;
let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) return;

  try {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();

    await mongoose.connect(uri, {
      dbName: "testDB",
    });

    if (global.mongoose) {
      global.mongoose.conn = mongoose;
      global.mongoose.promise = Promise.resolve(mongoose);
    }

    isConnected = true;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (!isConnected) return;

  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();

    if (mongo) {
      await mongo.stop();
    }

    if (global.mongoose) {
      global.mongoose.conn = null;
      global.mongoose.promise = null;
    }

    isConnected = false;
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
  }
};

export const clearDB = async (): Promise<void> => {
  if (!isConnected) {
    throw new Error("MongoDB is not connected");
  }

  try {
    await mongoose.connection.dropDatabase();
  } catch (error) {
    console.error("Error clearing MongoDB:", error);
  }
};

export const isDBConnected = (): boolean => {
  return isConnected && mongoose.connection.readyState === 1;
};
