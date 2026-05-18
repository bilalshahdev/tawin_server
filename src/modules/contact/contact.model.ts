import { Schema, model } from 'mongoose';

const contactSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

export const Contact = model('Contact', contactSchema);