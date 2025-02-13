import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native"
import { Snackbar, Button, IconButton } from "react-native-paper"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import FontAwesome from "react-native-vector-icons/FontAwesome"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"

interface SignupData {
	name: string
	email: string
	password: string
	confirmPassword: string
}

interface SignupErrors {
	name: string
	email: string
	password: string
	confirmPassword: string
}

type RootStackParamList = {
	Login: undefined
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">

const Signup: React.FC = () => {
	const [showPassword, setShowPassword] = useState<boolean>(false)
	const [signupData, setSignupData] = useState<SignupData>({
		name: "",
		email: "",
		password: "",
		confirmPassword: ""
	})
	const [errors, setErrors] = useState<SignupErrors>({
		name: "",
		email: "",
		password: "",
		confirmPassword: ""
	})
	const [loading, setLoading] = useState<boolean>(false)
	const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false)
	const [snackbarMessage, setSnackbarMessage] = useState<string>("")
	const navigation = useNavigation<NavigationProp>()

	const handleTogglePassword = () => setShowPassword(!showPassword)

	const handleChange = (name: keyof SignupData, value: string) => {
		setSignupData(prev => ({ ...prev, [name]: value }))
		setErrors(prev => ({ ...prev, [name]: "" }))
	}

	const validateFields = (): boolean => {
		const { name, email, password, confirmPassword } = signupData
		let newErrors: SignupErrors = { name: "", email: "", password: "", confirmPassword: "" }

		if (!name) newErrors.name = "Name is required"
		if (!email) newErrors.email = "Email is required"
		else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email"
		if (!password) newErrors.password = "Password is required"
		else if (password.length < 6) newErrors.password = "Password must be at least 6 characters"
		if (!confirmPassword) newErrors.confirmPassword = "Confirm password is required"
		else if (confirmPassword !== password) newErrors.confirmPassword = "Passwords do not match"

		setErrors(newErrors)
		return !Object.values(newErrors).some(error => error)
	}

	const handleSignup = async () => {
		if (!validateFields()) return

		try {
			setLoading(true)
			setTimeout(() => {
				setSnackbarMessage("Signup Successful!")
				setSnackbarVisible(true)
				setLoading(false)
			}, 1500)
		} catch (error) {
			setSnackbarMessage("Signup Failed!")
			setSnackbarVisible(true)
			setLoading(false)
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Sign Up</Text>

			<View style={styles.inputContainer}>
				<FontAwesome name='user' size={20} style={styles.icon} />
				<TextInput
					placeholder='Name'
					style={styles.input}
					value={signupData.name}
					onChangeText={text => handleChange("name", text)}
				/>
			</View>
			{errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

			<View style={styles.inputContainer}>
				<FontAwesome name='envelope' size={20} style={styles.icon} />
				<TextInput
					placeholder='Email'
					style={styles.input}
					value={signupData.email}
					onChangeText={text => handleChange("email", text)}
					keyboardType='email-address'
					autoCapitalize='none'
				/>
			</View>
			{errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

			<View style={styles.inputContainer}>
				<MaterialIcons name='lock' size={20} style={styles.icon} />
				<TextInput
					placeholder='Password'
					style={styles.input}
					secureTextEntry={!showPassword}
					value={signupData.password}
					onChangeText={text => handleChange("password", text)}
				/>
				<IconButton icon={showPassword ? "eye-off" : "eye"} onPress={handleTogglePassword} />
			</View>
			{errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

			<View style={styles.inputContainer}>
				<MaterialIcons name='lock' size={20} style={styles.icon} />
				<TextInput
					placeholder='Confirm Password'
					style={styles.input}
					secureTextEntry={!showPassword}
					value={signupData.confirmPassword}
					onChangeText={text => handleChange("confirmPassword", text)}
				/>
				<IconButton icon={showPassword ? "eye-off" : "eye"} onPress={handleTogglePassword} />
			</View>
			{errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

			<TouchableOpacity onPress={() => navigation.navigate("Login")}>
				<Text style={styles.link}>Already have an account? Login</Text>
			</TouchableOpacity>

			<Button mode='contained' onPress={handleSignup} loading={loading} style={styles.signupButton}>
				{loading ? "Signing up..." : "Sign Up"}
			</Button>

			<Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}>
				{snackbarMessage}
			</Snackbar>
		</View>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#fff" },
	title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 5,
		marginBottom: 10,
		paddingHorizontal: 10
	},
	input: { flex: 1, height: 40, paddingHorizontal: 10 },
	icon: { marginRight: 10 },
	errorText: { color: "red", fontSize: 12, marginBottom: 5 },
	link: { textAlign: "center", color: "#007BFF", marginBottom: 15 },
	signupButton: { marginTop: 10, backgroundColor: "#007BFF" }
})

export default Signup
