import express, { Request, Response } from "express"
import Busboy from "busboy"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import UploadModel from "../models/uploadModel"

const s3Client = new S3Client({
	region: process.env.AWS_REGION || "",
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
	}
})

const router = express.Router()
const BUCKET_NAME = "file-upload-aws-testing"
const MAX_FILE_SIZE = 10 * 1024 * 1024

router.post("/upload", (req: Request, res: Response) => {
	const bb = Busboy({ headers: req.headers, limits: { fileSize: MAX_FILE_SIZE } })
	let totalSize = 0
	let totalUploaded = 0
	const files: { filename: string; size: number; key: string }[] = []
	const startTime = Date.now()

	res.set({
		"Content-Type": "text/plain; charset=utf-8",
		"Transfer-Encoding": "chunked",
		Connection: "keep-alive"
	})

	bb.on("file", (name, file, info) => {
		if (name !== "files") return file.resume()

		const { filename, mimeType } = info
		const key = `uploads/${Date.now()}_${filename}`
		let fileSize = 0
		const chunks: Buffer[] = []

		file.on("data", (chunk: Buffer) => {
			fileSize += chunk.length
			totalUploaded += chunk.length
			chunks.push(chunk)

			if (totalSize > 0) {
				const elapsedTime = (Date.now() - startTime) / 1000
				const percentage = ((totalUploaded / totalSize) * 100).toFixed(2)
				const bytesPerSecond = elapsedTime > 0 ? totalUploaded / elapsedTime : 0
				const remainingBytes = totalSize - totalUploaded
				const timeRemaining = bytesPerSecond > 0 ? Math.max(0, remainingBytes / bytesPerSecond).toFixed(2) : "0"

				res.write(`data: ${JSON.stringify({ percentage, timeRemaining })}\n\n`)
			}
		})

		file.on("end", async () => {
			try {
				const fileBuffer = Buffer.concat(chunks)

				const command = new PutObjectCommand({
					Bucket: BUCKET_NAME,
					Key: key,
					Body: fileBuffer,
					ContentType: mimeType
				})

				await s3Client.send(command)

				await UploadModel.create({
					filename,
					s3Key: key,
					size: fileSize,
					mimetype: mimeType
				})

				files.push({ filename, size: fileSize, key })
			} catch (error) {
				res.write(`data: ${JSON.stringify({ error: "Upload failed" })}\n\n`)
				res.end()
			}
		})

		file.on("limit", () => {
			res.status(400).write(`data: ${JSON.stringify({ error: "File size limit exceeded" })}\n\n`)
			res.end()
		})
	})

	bb.on("field", (name, value) => {
		if (name === "totalSize") {
			totalSize = Number(value)
		}
	})

	bb.on("finish", () => {
		res.write(`data: ${JSON.stringify({ message: "Uploaded successfully", files })}\n\n`)
		res.end()
	})

	bb.on("error", (error: Error) => {
		res.status(500).write(`data: ${JSON.stringify({ error: "Upload failed" })}\n\n`)
		res.end()
	})

	req.pipe(bb)
})

export default router
