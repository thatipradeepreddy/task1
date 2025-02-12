import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import session from "express-session"
import passport from "./config/passport"
import connectDB from "./config/db"
import authRoutes from "./routes/authRoutes"

dotenv.config()
connectDB()

const app = express()

app.use(cors({ origin: "http://localhost:5173", credentials: true }))
app.use(express.json())

app.use(
	session({
		secret: process.env.SESSION_SECRET as string,
		resave: false,
		saveUninitialized: false
	})
)

app.use(passport.initialize())
app.use(passport.session())

app.use("/api/auth", authRoutes)

export default app
