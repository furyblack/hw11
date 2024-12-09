import {BlogMongoDbType} from "../types/blogs/output";
import mongoose from "mongoose";


//СХЕМА И МОДЕЛЬ БЛОГОВ
const blogSchema  = new mongoose.Schema ({
    name: {type: String, required: true},
    description: {type: String, required: true},
    websiteUrl: {type: String, required: true},
    createdAt: {type: Date, required: true}
})
export const BlogModel = mongoose.model<BlogMongoDbType>('blogs', blogSchema)
