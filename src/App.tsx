import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Signup } from "./screens/signup/signup"
import { Login } from "./screens/login/login"
import { Home } from "./screens/home/home"
import { UserDetails } from "./types/localStorage.types"
import { JSX } from "react"
import "leaflet/dist/leaflet.css"

import FileUpload from "./screens/upload/uploadFiles"
import MapView from "./screens/maps/map"

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
	const storedUserDetails = localStorage.getItem("userDetails")
	const userDetails: UserDetails | null = storedUserDetails ? JSON.parse(storedUserDetails) : null

	return userDetails ? children : <Navigate to='/' replace />
}

function App() {
	return (
		<Router>
			<Routes>
				<Route path='/' element={<Login />} />
				<Route path='/signup' element={<Signup />} />
				<Route path='/maps' element={<MapView />} />
				<Route path='/fileupload' element={<FileUpload />} />
				<Route
					path='/home'
					element={
						<ProtectedRoute>
							<Home />
							{/* </FileUpload> */}
						</ProtectedRoute>
					}
				/>
			</Routes>
		</Router>
	)
}

export default App
