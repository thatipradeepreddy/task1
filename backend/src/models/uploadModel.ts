import mongoose, { Document, Schema } from "mongoose"

export interface IUpload extends Document {
	filename: string
	path: string
	size: number
	mimetype: string
}

const UploadSchema = new Schema<IUpload>(
	{
		filename: { type: String, required: true },
		path: { type: String, required: true },
		size: { type: Number, required: true },
		mimetype: { type: String, required: true }
	},
	{ timestamps: true }
)

export default mongoose.model<IUpload>("Upload", UploadSchema)
