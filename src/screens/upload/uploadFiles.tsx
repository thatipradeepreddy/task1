import React, { useState, useRef, useEffect } from "react"
import { Box, Button, LinearProgress, Typography, CircularProgress } from "@mui/material"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"

export function FileUpload() {
	const [selectedFiles, setSelectedFiles] = useState<File[]>([])
	const [progress, setProgress] = useState<number>(0)
	const [timeRemaining, setTimeRemaining] = useState<string>("")
	const [uploading, setUploading] = useState<boolean>(false)
	const abortControllerRef = useRef<AbortController | null>(null)

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const filesArray = Array.from(e.target.files)
			setSelectedFiles(filesArray)
			setProgress(0)
			setTimeRemaining("")
		}
	}

	const handleUpload = async () => {
		if (selectedFiles.length === 0) return

		const formData = new FormData()
		let totalSize = 0
		selectedFiles.forEach(file => {
			formData.append("files", file)
			totalSize += file.size
		})
		formData.append("totalSize", totalSize.toString()) 

		try {
			setUploading(true)
			abortControllerRef.current = new AbortController()

			const response = await fetch("http://localhost:4000/api/upload", {
				method: "POST",
				body: formData,
				signal: abortControllerRef.current.signal
			})

			if (!response.ok) {
				throw new Error(`Upload failed with status ${response.status}`)
			}

			if (!response.body) {
				throw new Error("Response body is not readable")
			}

			const reader = response.body.getReader()
			const decoder = new TextDecoder()
			let buffer = ""

			while (true) {
				const { done, value } = await reader.read()
				if (done) break

				buffer += decoder.decode(value, { stream: true })
				const lines = buffer.split("\n\n")
				buffer = lines.pop() || ""

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						try {
							const data = JSON.parse(line.slice(6))
							if (data.percentage && data.timeRemaining) {
								setProgress(Number(data.percentage))
								setTimeRemaining(`${Number(data.timeRemaining).toFixed(2)} seconds remaining`)
							}
							
							if (data.error) {
								throw new Error(data.error)
							}
						} catch (error) {
							console.error("Error parsing stream data:", error)
						}
					}
				}
			}
		} catch (error: any) {
			console.error("Upload error:", error)
			alert(`Upload failed: ${error.message}`)
		} finally {
			setUploading(false)
			abortControllerRef.current = null
		}
	}

	useEffect(() => {
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort()
			}
		}
	}, [])

	return (
		<Box
			sx={{
				width: "100%",
				maxWidth: 500,
				mx: "auto",
				mt: 8,
				p: 4,
				boxShadow: 3,
				borderRadius: 2,
				textAlign: "center"
			}}
		>
			<Typography variant='h5' gutterBottom>
				File Upload with Progress
			</Typography>

			<input type='file' multiple onChange={handleFileChange} style={{ display: "none" }} id='file-input' />
			<label htmlFor='file-input'>
				<Button variant='outlined' component='span' startIcon={<CloudUploadIcon />}>
					Choose Files
				</Button>
			</label>

			{selectedFiles.length > 0 && (
				<Box mt={2}>
					{selectedFiles.map((file, index) => (
						<Typography key={index}>{file.name}</Typography>
					))}
				</Box>
			)}

			<Box mt={2}>
				<Button
					variant='contained'
					color='primary'
					onClick={handleUpload}
					disabled={selectedFiles.length === 0 || uploading}
				>
					Upload
				</Button>
			</Box>

			{uploading && (
				<Box mt={4}>
					<LinearProgress variant='determinate' value={progress} />
					<Typography mt={1}>{progress}%</Typography>
					<Typography variant='caption'>{timeRemaining}</Typography>
				</Box>
			)}

			{uploading && (
				<Box mt={2}>
					<CircularProgress size={24} />
				</Box>
			)}
		</Box>
	)
}
