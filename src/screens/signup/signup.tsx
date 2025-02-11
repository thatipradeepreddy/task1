import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Button, TextField, Typography, InputAdornment, IconButton, Link, Divider } from "@mui/material"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelope, faUser } from "@fortawesome/free-solid-svg-icons"
import styles from "./signup.module.css"

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
	const [sigup, setSignup] = useState<SignupState>(initialSignupState)
	const [name, setName] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [errors, setErrors] = useState({ name: "", email: "", password: "", confirmPassword: "" })
	const navigate = useNavigate()

	const handleTogglePassword = () => {
		setShowPassword(!showPassword)
	}

	const handleSignup = () => {
		let newErrors = { name: "", email: "", password: "", confirmPassword: "" }

		if (!name) newErrors.name = "Name is required"

		if (!email) newErrors.email = "Email is required"
		else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email"

		if (!password) newErrors.password = "Password is required"
		else if (password.length < 6) newErrors.password = "Password must be at least 6 characters"

		if (!confirmPassword) newErrors.confirmPassword = "Confirm password is required"
		else if (confirmPassword !== password) newErrors.confirmPassword = "Passwords do not match"

		setErrors(newErrors)

		if (!newErrors.name && !newErrors.email && !newErrors.password && !newErrors.confirmPassword) {
			alert("Signup Successful!")
			navigate("/welcome")
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
					value={name}
					onChange={e => setName(e.target.value)}
					error={!!errors.name}
					helperText={errors.name}
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
					value={email}
					onChange={e => setEmail(e.target.value)}
					error={!!errors.email}
					helperText={errors.email}
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
					value={password}
					onChange={e => setPassword(e.target.value)}
					error={!!errors.password}
					helperText={errors.password}
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
					value={confirmPassword}
					onChange={e => setConfirmPassword(e.target.value)}
					error={!!errors.confirmPassword}
					helperText={errors.confirmPassword}
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
					<Link href='#' variant='body2' sx={{ textDecoration: "none" }}>
						Already have an account? Login
					</Link>
				</Box>

				<Button variant='contained' color='primary' fullWidth onClick={handleSignup}>
					Sign Up
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
