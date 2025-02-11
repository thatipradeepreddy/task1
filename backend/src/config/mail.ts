import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS
	}
})

export const sendVerificationEmail = async (email: string, token: string) => {
	const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: "Verify Your Email",
		html: `<p>Click the link below to verify your email:</p>
			<a href="${verificationUrl}">${verificationUrl}</a>`
	}

	await transporter.sendMail(mailOptions)
}
