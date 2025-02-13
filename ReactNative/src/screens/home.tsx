import React, { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"

interface UserDetails {
	name: string
	email: string
}

type RootStackParamList = {
	Login: undefined
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">

const Home: React.FC = () => {
	const [loading, setLoading] = useState<boolean>(false)
	const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
	const navigation = useNavigation<NavigationProp>()

	useEffect(() => {
		const getUserDetails = async () => {
			const storedUser = await AsyncStorage.getItem("userDetails")
			if (storedUser) {
				setUserDetails(JSON.parse(storedUser))
			}
		}
		getUserDetails()
	}, [])

	const handleLogout = async () => {
		setLoading(true)
		setTimeout(async () => {
			await AsyncStorage.removeItem("userDetails")
			setLoading(false)
			navigation.replace("Login")
		}, 2000)
	}

	return (
		<View style={styles.container}>
			<View style={styles.card}>
				{userDetails ? (
					<>
						<Text style={styles.title}>Welcome, {userDetails.name}</Text>
						<Text style={styles.email}>{userDetails.email}</Text>
						<TouchableOpacity style={styles.button} onPress={handleLogout} disabled={loading}>
							{loading ? (
								<ActivityIndicator size='small' color='#fff' />
							) : (
								<Text style={styles.buttonText}>Logout</Text>
							)}
						</TouchableOpacity>
					</>
				) : (
					<Text style={styles.errorText}>No user details found</Text>
				)}
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" },
	card: { backgroundColor: "#fff", padding: 20, borderRadius: 10, elevation: 3, width: 300, alignItems: "center" },
	title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
	email: { fontSize: 14, color: "#666", marginBottom: 20 },
	button: { backgroundColor: "#007BFF", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
	buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
	errorText: { color: "red", fontSize: 16 }
})

export default Home
