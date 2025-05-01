import React, { useState } from "react"
import axios from "axios"
import { Button, LinearProgress, Typography, Box, TextField } from "@mui/material"

interface UploadProgress {
	percent: number
	estimatedTime: number // in seconds
}

const FileUpload: React.FC = () => {
	const [file, setFile] = useState<File | null>(null)
	const [progress, setProgress] = useState<UploadProgress>({ percent: 0, estimatedTime: 0 })
	const [uploading, setUploading] = useState<boolean>(false)
	const [email, setEmail] = useState<string>("")

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFile(e.target.files[0])
		}
	}

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value)
	}

	const uploadFile = async () => {
		if (!file || !email) return

		setUploading(true)

		const formData = new FormData()
		formData.append("file", file)
		formData.append("email", email)

		const config = {
			headers: {
				"Content-Type": "multipart/form-data"
			},
			onUploadProgress: (progressEvent: any) => {
				const total = progressEvent.total
				const loaded = progressEvent.loaded

				// Calculate upload percentage
				const percent = Math.round((loaded / total) * 100)

				// Estimate remaining time (simple estimate)
				const timeElapsed = loaded / progressEvent.timeStamp
				const estimatedTime = (total - loaded) / timeElapsed

				setProgress({
					percent,
					estimatedTime: Math.round(estimatedTime)
				})
			}
		}

		try {
			// Replace the URL with your FastAPI backend URL
			const response = await axios.post("http://localhost:8000/upload", formData, config)
			setUploading(false)
			alert("File uploaded successfully!")
			console.log("Response from API:", response.data)
		} catch (error) {
			console.error("Error uploading file:", error)
			setUploading(false)
			alert("Failed to upload file")
		}
	}

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
