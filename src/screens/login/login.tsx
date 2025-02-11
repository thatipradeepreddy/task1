import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
	Box,
	Button,
	TextField,
	Typography,
	InputAdornment,
	IconButton,
	Link,
	Divider,
	CircularProgress,
	Snackbar,
	Alert
} from "@mui/material"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import styles from "./login.module.css"
import { login } from "../api"

export function Login() {
	const [showPassword, setShowPassword] = useState(false)
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [errors, setErrors] = useState({ email: "", password: "" })
	const [apiError, setApiError] = useState("")
	const [loading, setLoading] = useState(false)
	const [snackbarOpen, setSnackbarOpen] = useState(false)
	const navigate = useNavigate()

	const handleTogglePassword = () => {
		setShowPassword(!showPassword)
	}

	const handleLogin = async () => {
		setLoading(true)
		let newErrors = { email: "", password: "" }

		if (!email) newErrors.email = "Email is required"
		else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email"

		if (!password) newErrors.password = "Password is required"
		else if (password.length < 6) newErrors.password = "Password must be at least 6 characters"

		setErrors(newErrors)

		if (!newErrors.email && !newErrors.password) {
			try {
				const data = await login(email, password)
				localStorage.setItem("userDetails", data)
				setSnackbarOpen(true)
				setTimeout(() => {
					navigate("/home")
				}, 2000)
			} catch (error: any) {
				setApiError(error.message || "Login failed")
			} finally {
				setLoading(false)
			}
		}
	}

	return (
		<Box className={styles.container}>
			<Box className={styles.loginBox}>
				<Typography variant='h4' className={styles.title}>
					Login
				</Typography>

				{apiError && <Typography color='error'>{apiError}</Typography>}

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

				<Box className={styles.links}>
					<Link href='#' variant='body2' sx={{ textDecoration: "none" }}>
						Forgot Password?
					</Link>
					<Link href='#' variant='body2' sx={{ textDecoration: "none" }}>
						New User? Sign Up
					</Link>
				</Box>

				<Button variant='contained' color='primary' fullWidth onClick={handleLogin} disabled={loading}>
					{loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Login"}
				</Button>

				<Divider sx={{ width: "100%", my: 2 }}>OR</Divider>

				<Button
					variant='outlined'
					fullWidth
					className={styles.socialButton}
					startIcon={<img src='./google.png' alt='Google' style={{ width: 25, height: 25 }} />}
				>
					Login with Google
				</Button>

				<Button
					variant='outlined'
					fullWidth
					className={styles.socialButton}
					startIcon={<img src='./microsoft.png' alt='Microsoft' style={{ width: 25, height: 25 }} />}
				>
					Login with Microsoft
				</Button>
			</Box>

			<Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
				<Alert onClose={() => setSnackbarOpen(false)} severity='success' sx={{ width: "100%" }}>
					Login Successful!
				</Alert>
			</Snackbar>
		</Box>
	)
}
