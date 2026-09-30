import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
      throw new Error(
        "MONGODB_URI is not set. Add your MongoDB Atlas connection string in Vercel Environment Variables."
      );
    }
    return "mongodb://127.0.0.1:27017/department-cms";
  }

  // Prevent accidental localhost URI on Vercel
  if (
    (process.env.VERCEL || process.env.NODE_ENV === "production") &&
    (uri.includes("127.0.0.1") || uri.includes("localhost"))
  ) {
    throw new Error(
      "MONGODB_URI points to localhost, which cannot work on Vercel. Use a MongoDB Atlas connection string."
    );
  }

  return uri;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  const MONGODB_URI = getMongoUri();

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
