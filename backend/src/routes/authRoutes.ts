import express from "express"
import { login, signup, verifyEmail } from "../controllers/authController"
import { validateSignup } from "../middlewares/validateSignup"
import passport from "passport"

const router = express.Router()

router.post("/signup", validateSignup, signup)
router.get("/verify-email", verifyEmail)
router.post("/login", login)

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))

router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
	res.redirect("/home")
})

router.get("/logout", (req, res) => {
	req.logout(err => {
		if (err) return res.status(500).json({ error: "Logout failed" })
		res.redirect("/")
	})
})

export default router
