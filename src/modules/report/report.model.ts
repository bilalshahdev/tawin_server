import { Schema, model } from 'mongoose';

const reportSchema = new Schema({
    message: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true, toJSON: { virtuals: true },
    toObject: { virtuals: true },
});


export const Report = model('Report', reportSchema);