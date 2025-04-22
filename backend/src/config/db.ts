import mongoose from "mongoose"
import dotenv from "dotenv"
import { Db } from "mongodb"

dotenv.config()

const connectDB = async (): Promise<Db> => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI as string)
		console.log("MongoDB Connected")
		return conn.connection.db!
	} catch (error) {
		console.error("MongoDB Connection Failed", error)
		process.exit(1)
	}
}

export default connectDB
