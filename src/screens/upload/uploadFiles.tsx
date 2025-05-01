import React, { useState, useEffect } from "react"
import axios from "axios"
import { Button, LinearProgress, Typography, Box, TextField } from "@mui/material"

interface UploadProgress {
	percent: number
	speed: number // in KB/s
	estimatedTime: number // in seconds
}

const FileUpload: React.FC = () => {
	const [file, setFile] = useState<File | null>(null)
	const [progress, setProgress] = useState<UploadProgress>({ percent: 0, speed: 0, estimatedTime: 0 })
	const [uploading, setUploading] = useState<boolean>(false)
	const [email, setEmail] = useState<string>("")
	const [ws, setWs] = useState<WebSocket | null>(null)

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFile(e.target.files[0])
		}
	}

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value)
	}

	// Initialize WebSocket connection
	const initializeWebSocket = () => {
		const websocket = new WebSocket("ws://localhost:8000/ws/upload-progress")
		websocket.onopen = () => {
			console.log("WebSocket connected")
		}
		websocket.onmessage = event => {
			const data = JSON.parse(event.data)
			if (data.status === "complete") {
				setProgress({ percent: 100, speed: 0, estimatedTime: 0 })
				setUploading(false)
				websocket.close()
				alert("File uploaded successfully!")
			} else {
				setProgress({
					percent: data.percent,
					speed: data.speed,
					estimatedTime: data.estimated_time
				})
			}
		}
		websocket.onclose = () => {
			console.log("WebSocket closed")
		}
		websocket.onerror = error => {
			console.error("WebSocket error:", error)
			setUploading(false)
		}
		setWs(websocket)
	}

	const uploadFile = async () => {
		if (!file || !email) {
			alert("Please select a file and enter an email.")
			return
		}

		setUploading(true)
		initializeWebSocket()

		const formData = new FormData()
		formData.append("file", file)
		formData.append("email", email)

		try {
			const response = await axios.post("http://localhost:8000/upload", formData, {
				headers: {
					"Content-Type": "multipart/form-data"
				}
			})
			console.log("Response from API:", response.data)
		} catch (error) {
			console.error("Error uploading file:", error)
			setUploading(false)
			if (ws) ws.close()
			alert("Failed to upload file")
		}
	}

	// Cleanup WebSocket on component unmount
	useEffect(() => {
		return () => {
			if (ws) {
				ws.close()
			}
		}
	}, [ws])

	return (
		<Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: 2 }}>
			<Typography variant='h6'>Upload a File</Typography>
			<TextField
				label='Email'
				type='email'
				value={email}
				onChange={handleEmailChange}
				variant='outlined'
				sx={{ marginBottom: 2 }}
			/>
			<input
				type='file'
				onChange={handleFileChange}
				accept='application/pdf, .doc, .docx, .txt, .jpg, .png'
				disabled={uploading}
			/>
			{uploading && (
				<>
					<LinearProgress variant='determinate' value={progress.percent} sx={{ width: "100%", marginTop: 2 }} />
					<Typography variant='body2'>{progress.percent}% Uploaded</Typography>
					<Typography variant='body2'>Speed: {progress.speed} KB/s</Typography>
					<Typography variant='body2'>Estimated Time: {progress.estimatedTime} seconds</Typography>
				</>
			)}
			<Button variant='contained' onClick={uploadFile} disabled={uploading || !file || !email} sx={{ marginTop: 2 }}>
				{uploading ? "Uploading..." : "Upload"}
			</Button>
		</Box>
	)
}

export default FileUpload
