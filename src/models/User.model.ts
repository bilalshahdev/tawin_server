import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        avatar: {
            type: String
        },

        images: [
            {
                type: String
            }
        ],

        resume: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

export const User = mongoose.model("User", userSchema);