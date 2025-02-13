import React, { useEffect, useState } from "react"
import { View, ActivityIndicator } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { StackScreenProps } from "@react-navigation/stack"
import { Login } from "./src/screens/login"
import Home from "./src/screens/home"

const Stack = createStackNavigator()

interface ProtectedRouteProps extends StackScreenProps<any> {
	component: React.ComponentType<any>
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, ...rest }) => {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

	useEffect(() => {
		const checkLoginStatus = async () => {
			try {
				const userData = await AsyncStorage.getItem("userDetails")
				setIsAuthenticated(!!userData)
			} catch (error) {
				console.error("Error checking login status:", error)
				setIsAuthenticated(false)
			}
		}

		checkLoginStatus()
	}, [])

	if (isAuthenticated === null) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size='large' color='#0000ff' />
			</View>
		)
	}

	return isAuthenticated ? <Component {...rest} /> : <Login />
}

const App = () => {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

	useEffect(() => {
		const checkLoginStatus = async () => {
			try {
				const userData = await AsyncStorage.getItem("userData")
				setIsAuthenticated(!!userData)
			} catch (error) {
				console.error("Error checking login status:", error)
				setIsAuthenticated(false)
			}
		}

		checkLoginStatus()
	}, [])

	if (isAuthenticated === null) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size='large' color='#0000ff' />
			</View>
		)
	}

	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName={isAuthenticated ? "homepage" : "landing"}>
				<Stack.Screen
					name='login'
					component={Login}
					options={{
						headerShown: true,
						headerTitle: "Login to Continue",
						headerTitleAlign: "center"
					}}
				/>
				<Stack.Screen
					name='homepage'
					options={{
						headerShown: true,
						headerTitle: "task1",
						headerTitleAlign: "center"
					}}
				>
					{props => <ProtectedRoute {...props} component={Home} />}
				</Stack.Screen>
			</Stack.Navigator>
		</NavigationContainer>
	)
}

export default App
