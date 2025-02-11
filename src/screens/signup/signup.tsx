import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Button, TextField, Typography, InputAdornment, IconButton, Link, Divider } from "@mui/material"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelope, faUser } from "@fortawesome/free-solid-svg-icons"
import styles from "./signup.module.css"
import { signup } from "../api"

interface SignupState {
	name: string
	email: string
	password: string
	confirmPassword: string
}

const initialSignupState: SignupState = {
	name: "",
	email: "",
	password: "",
	confirmPassword: ""
}

export function Signup() {
	const [showPassword, setShowPassword] = useState(false)
	const [signupData, setSignupData] = useState(initialSignupState)
	const [errors, setErrors] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: ""
	})
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()

	const handleTogglePassword = () => {
		setShowPassword(!showPassword)
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setSignupData(prev => ({ ...prev, [name]: value }))
		setErrors(prev => ({ ...prev, [name]: "" }))
	}

	const handleSignup = async () => {
		const { name, email, password, confirmPassword } = signupData
		let newErrors = { name: "", email: "", password: "", confirmPassword: "" }

		if (!name) newErrors.name = "Name is required"
		if (!email) newErrors.email = "Email is required"
		else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email"
		if (!password) newErrors.password = "Password is required"
		else if (password.length < 6) newErrors.password = "Password must be at least 6 characters"
		if (!confirmPassword) newErrors.confirmPassword = "Confirm password is required"
		else if (confirmPassword !== password) newErrors.confirmPassword = "Passwords do not match"

		setErrors(newErrors)
		if (Object.values(newErrors).some(error => error)) return

		try {
			setLoading(true)
			const data = await signup(name, email, password)
		} catch (error) {
			alert(error)
		} finally {
			setLoading(false)
		}
	}

	return (
		<Box className={styles.container}>
			<Box className={styles.signupBox}>
				<Typography variant='h4' className={styles.title}>
					Sign Up
				</Typography>

				<TextField
					label='Name'
					variant='outlined'
					fullWidth
					name='name'
					value={signupData.name}
					onChange={handleChange}
					error={!!errors.name}
					helperText={errors.name}
					sx={{
						"& .MuiInputBase-root": {
							height: "40px"
						},
						"& .MuiOutlinedInput-input": {
							padding: "8px"
						}
					}}
					InputProps={{
						startAdornment: (
							<InputAdornment position='start'>
								<FontAwesomeIcon icon={faUser} />
							</InputAdornment>
						)
					}}
				/>

				<TextField
					label='Email'
					variant='outlined'
					fullWidth
					name='email'
					value={signupData.email}
					onChange={handleChange}
					error={!!errors.email}
					helperText={errors.email}
					sx={{
						"& .MuiInputBase-root": {
							height: "40px"
						},
						"& .MuiOutlinedInput-input": {
							padding: "8px"
						}
					}}
					InputProps={{
						startAdornment: (
							<InputAdornment position='start'>
								<FontAwesomeIcon icon={faEnvelope} />
							</InputAdornment>
						)
					}}
				/>

				<TextField
					label='Password'
					variant='outlined'
					fullWidth
					type={showPassword ? "text" : "password"}
					name='password'
					value={signupData.password}
					onChange={handleChange}
					error={!!errors.password}
					helperText={errors.password}
					sx={{
						"& .MuiInputBase-root": {
							height: "40px"
						},
						"& .MuiOutlinedInput-input": {
							padding: "8px"
						}
					}}
					InputProps={{
						endAdornment: (
							<InputAdornment position='end'>
								<IconButton onClick={handleTogglePassword} edge='end'>
									{showPassword ? <VisibilityOff /> : <Visibility />}
								</IconButton>
							</InputAdornment>
						)
					}}
				/>

				<TextField
					label='Confirm Password'
					variant='outlined'
					fullWidth
					type={showPassword ? "text" : "password"}
					name='confirmPassword'
					value={signupData.confirmPassword}
					onChange={handleChange}
					error={!!errors.confirmPassword}
					helperText={errors.confirmPassword}
					sx={{
						"& .MuiInputBase-root": {
							height: "40px"
						},
						"& .MuiOutlinedInput-input": {
							padding: "8px"
						}
					}}
					InputProps={{
						endAdornment: (
							<InputAdornment position='end'>
								<IconButton onClick={handleTogglePassword} edge='end'>
									{showPassword ? <VisibilityOff /> : <Visibility />}
								</IconButton>
							</InputAdornment>
						)
					}}
				/>

				<Box className={styles.links}>
					<Link href='/login' variant='body2' sx={{ textDecoration: "none" }}>
						Already have an account? Login
					</Link>
				</Box>

				<Button variant='contained' color='primary' fullWidth onClick={handleSignup} disabled={loading}>
					{loading ? "Signing up..." : "Sign Up"}
				</Button>

				<Divider sx={{ width: "100%", my: 2 }}>OR</Divider>

				<Button
					variant='outlined'
					fullWidth
					className={styles.socialButton}
					startIcon={<img src='./google.png' alt='Google' style={{ width: 25, height: 25 }} />}
				>
					Sign Up with Google
				</Button>

				<Button
					variant='outlined'
					fullWidth
					className={styles.socialButton}
					startIcon={<img src='./microsoft.png' alt='Microsoft' style={{ width: 25, height: 25 }} />}
				>
					Sign Up with Microsoft
				</Button>
			</Box>
		</Box>
	)
}
