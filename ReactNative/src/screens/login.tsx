import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { StackNavigationProp } from "@react-navigation/stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { login } from "./api"

type RootStackParamList = {
	Home: undefined
	Login: undefined
	Signup: undefined
}

export function Login() {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [loading, setLoading] = useState(false)

	const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

	const handleLogin = async () => {
		if (!email) return Alert.alert("Error", "Email is required")
		if (!/\S+@\S+\.\S+/.test(email)) return Alert.alert("Error", "Enter a valid email")
		if (!password) return Alert.alert("Error", "Password is required")
		if (password.length < 6) return Alert.alert("Error", "Password must be at least 6 characters")

		setLoading(true)
		try {
			const data = await login(email, password)
			await AsyncStorage.setItem(data, "userDetails")
			Alert.alert("Success", data.message || "Login Successful!")
			navigation.navigate("Home")
		} catch (error: any) {
			Alert.alert("Error", error.message || "Login Failed")
		} finally {
			setLoading(false)
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Login</Text>
			<TextInput
				style={styles.input}
				placeholder='Email'
				value={email}
				onChangeText={setEmail}
				keyboardType='email-address'
				autoCapitalize='none'
			/>
			<View style={styles.passwordContainer}>
				<TextInput
					style={styles.passwordInput}
					placeholder='Password'
					secureTextEntry={!showPassword}
					value={password}
					onChangeText={setPassword}
				/>
				<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
					<MaterialIcons name={showPassword ? "visibility-off" : "visibility"} size={24} />
				</TouchableOpacity>
			</View>
			<TouchableOpacity onPress={handleLogin} style={styles.button} disabled={loading}>
				{loading ? <ActivityIndicator color='white' /> : <Text style={styles.buttonText}>Login</Text>}
			</TouchableOpacity>
			<TouchableOpacity onPress={() => navigation.navigate("Signup")}>
				<Text style={styles.link}>New User? Sign Up</Text>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
		backgroundColor: "#fff"
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20
	},
	input: {
		width: "100%",
		height: 50,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		paddingHorizontal: 10,
		marginBottom: 10
	},
	passwordContainer: {
		flexDirection: "row",
		alignItems: "center",
		width: "100%",
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		paddingHorizontal: 10,
		marginBottom: 10
	},
	passwordInput: {
		flex: 1,
		height: 50
	},
	button: {
		backgroundColor: "blue",
		padding: 15,
		borderRadius: 8,
		alignItems: "center",
		width: "100%"
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold"
	},
	link: {
		marginTop: 10,
		color: "blue",
		textDecorationLine: "underline"
	}
})
