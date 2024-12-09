import mongoose from "mongoose";
import {CommentMongoDbType} from "../types/comment/output-comment-type";


//СХЕМА И МОДЕЛЬ КОММЕНТОВ
export const commentSchema = new mongoose.Schema({
    postId:{type: String, required: true},
    content: {type: String, required: true},
    commentatorInfo:{
        userId: {type: String, required: true},
        userLogin: {type: String, required: true},
    },
    createdAt: {type: Date, required: true},
    likesInfo:{
        likesCount: {type: Number, required: true},
        dislikesCount: {type: Number, required: true},
    }
})
export const CommentModel = mongoose.model<CommentMongoDbType>('comments', commentSchema)
