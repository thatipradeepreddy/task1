import { Request, Response, NextFunction } from "express"
import Joi from "joi"

const signupSchema = Joi.object({
	name: Joi.string().min(3).required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required()
})

export const validateSignup = (req: Request, res: Response, next: NextFunction): void => {
	const { error } = signupSchema.validate(req.body)
	if (error) {
		res.status(400).json({ error: error.details[0].message })
	} else {
		next()
	}
}
