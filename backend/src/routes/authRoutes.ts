import express from "express"
import { login, signup, verifyEmail } from "../controllers/authController"
import { validateSignup } from "../middlewares/validateSignup"

const router = express.Router()

router.post("/signup", validateSignup, signup)
router.get("/verify-email", verifyEmail)
router.post("/login", login)

export default router