import express from "express"
import { signup, verifyEmail } from "../controllers/authController"
import { validateSignup } from "../middlewares/validateSignup"

const router = express.Router()

router.post("/signup", validateSignup, signup)
router.get("/verify-email", verifyEmail)

export default router
