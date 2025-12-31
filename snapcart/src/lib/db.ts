//express
//step-1 connectDb function
//step2  mongoose.connect('mongodburl')

import { connect } from "mongoose"

const mongodbUrl = process.env.MONGODB_URL!
if (!mongodbUrl) {
  console.log("mongo db not found")
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

const connectDb = async () => {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    // Add connection options for better reliability on serverless
    cached.promise = connect(mongodbUrl, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    }).then((c) => c.connection)
  }

  try {
    cached.conn = await cached.promise
  } catch (error) {
    cached.promise = null // Reset promise on error so it can retry
    throw error
  }

  return cached.conn
}

export default connectDb