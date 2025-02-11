import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Signup } from "./screens/signup/signup"
import { Login } from "./screens/login/login"

function App() {
	return (
		<Router>
			<Routes>
				<Route path='/' element={<Login />} />
				<Route path='/signup' element={<Signup />} />
			</Routes>
		</Router>
	)
}

export default App
