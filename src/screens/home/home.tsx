import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { UserDetails } from "../../types/localStorage.types"
import { CircularProgress, Button, Box, Typography, Paper } from "@mui/material"

export function Home() {
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()

	const storedUserDetails = localStorage.getItem("userDetails")
	const userDetails: UserDetails | null = storedUserDetails ? JSON.parse(storedUserDetails) : null

	const handleLogout = () => {
		setLoading(true)
		setTimeout(() => {
			localStorage.removeItem("userDetails")
			setLoading(false)
			navigate("/")
		}, 2000)
	}

	return (
		<Box display='flex' justifyContent='center' alignItems='center' height='100vh'>
			<Paper elevation={3} sx={{ padding: 4, textAlign: "center", minWidth: 300 }}>
				{userDetails ? (
					<>
						<Typography variant='h5' gutterBottom>
							Welcome, {userDetails.name}
						</Typography>
						<Typography variant='body1' color='textSecondary' gutterBottom>
							{userDetails.email}
						</Typography>
						<Button
							variant='contained'
							color='primary'
							onClick={handleLogout}
							disabled={loading}
							sx={{ marginTop: 2 }}
						>
							{loading ? <CircularProgress size={24} color='inherit' /> : "Logout"}
						</Button>
					</>
				) : (
					<Typography variant='body1' color='error'>
						No user details found
					</Typography>
				)}
			</Paper>
		</Box>
	)
}
