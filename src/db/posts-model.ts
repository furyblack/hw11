import mongoose from "mongoose";
import {PostMongoDbType} from "../types/posts/output";


//СХЕМА И МОДЕЛЬ ПОСТОВ
export const postSchema = new mongoose.Schema({
    title: {type: String, required: true},
    shortDescription: {type: String, required: true},
    content: {type: String, required: true},
    blogId: {type: String, required: true},
    blogName: {type: String, required: true},
    createdAt: {type: Date, required: true},
})
export const PostModel = mongoose.model<PostMongoDbType>('posts', postSchema)
