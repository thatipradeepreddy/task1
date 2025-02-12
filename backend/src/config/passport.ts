import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import dotenv from "dotenv"
import User from "../models/userModel"

dotenv.config()

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			callbackURL: process.env.GOOGLE_CALLBACK_URL as string
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				let user = await User.findOne({ email: profile.emails?.[0].value })

				if (!user) {
					user = await User.create({
						name: profile.displayName,
						email: profile.emails?.[0].value,
						password: "",
						isVerified: true
					})
				}

				done(null, user)
			} catch (error) {
				done(error, undefined)
			}
		}
	)
)

passport.serializeUser((user: any, done) => {
	done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
	try {
		const user = await User.findById(id)
		done(null, user)
	} catch (error) {
		done(error, null)
	}
})

export default passport
