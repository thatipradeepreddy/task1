const API_BASE_URL = "http://localhost:5000/api/auth"

export const signup = async (name: string, email: string, password: string) => {
	try {
		const response = await fetch(`${API_BASE_URL}/signup`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ name, email, password })
		})
		const data = await response.json()
		if (!response.ok) throw new Error(data.error || "Signup failed")
		return data
	} catch (error: any) {
		throw error.message || "Signup failed"
	}
}

export const login = async (email: string, password: string) => {
	try {
		const response = await fetch(`${API_BASE_URL}/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ email, password })
		})
		const data = await response.json()
		if (!response.ok) throw new Error(data.error || "Login failed")
		return data
	} catch (error: any) {
		throw error.message || "Login failed"
	}
}
