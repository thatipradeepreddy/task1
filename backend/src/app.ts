import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./config/db"
import authRoutes from "./routes/authRoutes"

dotenv.config()
connectDB()

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)

export default app
