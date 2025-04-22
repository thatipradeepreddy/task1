import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import User from "../models/userModel"
import { generateToken } from "../utils/generateToken"
import { sendVerificationEmail } from "../config/mail"
import jwt from "jsonwebtoken"

export const signup = async (req: Request, res: Response): Promise<void> => {
	try {
		const { name, email, password } = req.body

		const existingUser = await User.findOne({ email })
		if (existingUser) {
			res.status(400).json({ error: "Email already in use" })
			return
		}

		const hashedPassword = await bcrypt.hash(password, 10)

		const newUser = await User.create({
			name,
			email,
			password: hashedPassword,
			isVerified: false
		})

		const token = generateToken(email)

		await sendVerificationEmail(email, token)

		res.status(201).json({ message: "Signup successful! Check your email for verification." })
	} catch (error) {
		res.status(500).json({ error: "Signup failed" })
	}
}

export const login = async (req: Request, res: Response): Promise<void> => {
	try {
		const { email, password } = req.body

		const user = await User.findOne({ email })
		if (!user) {
			res.status(400).json({ error: "Invalid email or password" })
			return
		}

		if (!user.isVerified) {
			res.status(400).json({ error: "Email is not verified. Please check your email." })
			return
		}

		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) {
			res.status(400).json({ error: "Invalid email or password" })
			return
		}

		const token = generateToken(user.email)

		res.status(200).json({
			message: "Login successful",
			token,
			email: user.email,
			name: user.name
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Login failed" })
	}
}

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
	try {
		const { token } = req.query
		if (!token) {
			res.status(400).json({ error: "Token is required" })
			return
		}

		const decoded: any = jwt.verify(token as string, process.env.JWT_SECRET as string)
		const user = await User.findOne({ email: decoded.email })

		if (!user) {
			res.status(400).json({ error: "Invalid token" })
			return
		}

		user.isVerified = true
		await user.save()

		res.status(200).json({ message: "Email verified successfully!" })
	} catch (error) {
		res.status(400).json({ error: "Invalid or expired token" })
	}
}
