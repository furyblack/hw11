import * as dotenv from "dotenv";
import { BlogMongoDbType} from "../types/blogs/output";
import { PostMongoDbType} from "../types/posts/output";
import {UserAccountDBType,} from "../types/users/inputUsersType";
import {CommentMongoDbType} from "../types/comment/output-comment-type";
import {requestCountType, SessionType} from "../types/session/sessionType";

//пытаюсь подключить бд
import mongoose from "mongoose";

dotenv.config()
const mongoUri = process.env.MONGO_URL as string // вытащили из енви строку  подключения

const dbName =  process.env.DB_NAME


//СХЕМА И МОДЕЛЬ БЛОГОВ
const blogSchema  = new mongoose.Schema ({
    name: {type: String, required: true},
    description: {type: String, required: true},
    websiteUrl: {type: String, required: true},
    createdAt: {type: Date, required: true}
})
export const BlogModel = mongoose.model<BlogMongoDbType>('blogs', blogSchema)

//СХЕМА И МОДЕЛЬ ЮЗЕРОВ
export const userSchema = new mongoose.Schema({
    accountData: {
        userName:  {type: String, required: true},
        email:  {type: String, required: true},
        passwordHash:  {type: String, required: true},
        passwordSalt:{type: String, required: true},
        createdAt: {type: Date, required: true}
    },
    emailConfirmation: {
        confirmationCode:  {type: String},
        expirationDate:  {type: Date},
        isConfirmed:  {type: Boolean},
    },
    recoveryCode:{
        code:{type:String, default:''},
        expirationDate:{type:Date, default:null}
    }
})
export const UserModel = mongoose.model<UserAccountDBType>('users', userSchema)


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

//СХЕМА И МОДЕЛЬ КОММЕНТОВ
export const commentSchema = new mongoose.Schema({
    postId:{type: String, required: true},
    content: {type: String, required: true},
    commentatorInfo:{
        userId: {type: String, required: true},
        userLogin: {type: String, required: true},
    },
    createdAt: {type: Date, required: true}
})
export const CommentModel = mongoose.model<CommentMongoDbType>('comments', commentSchema)

//СХЕМА И МОДЕЛЬ СЕССИЙ
export const sessionSchema = new mongoose.Schema({
    ip: {type: String, required: true},
    title: {type: String, required: true},
    lastActiveDate: {type: Date, required: true},
    deviceId: {type: String, required: true},
    userId: {type: String, required: true}
})
export const SessionModel = mongoose.model<SessionType>('sessions', sessionSchema)


//СХЕМА И МОДЕЛЬ ДЛЯ REQUEST COUNT
export const RequestCountSchema = new mongoose.Schema({
    ip: {type: String, required: true},
    url: {type: String, required: true},
    date: {type: Date, required: true}
})
export const RequestCountModel = mongoose.model<requestCountType>('requestsCount', RequestCountSchema)

//СХЕМА И МОДЕЛЬ ДЛЯ ЛАЙКОВ И ДИЗЛАЙКОВ НА КОМЕНТЫ

// export const CommentsLikesSchema = new mongoose.Schema({
//     commentId: {type: Types.ObjectId, ref:'comments', required:true},
//     userId: {type:Types.ObjectId, ref:'users', required:true},
//     type:{type:String, enum:['None','like','dislike'], required:true}
// })
// export const CommentLikesModel = mongoose.model<>('PostsLikes', CommentsLikesSchema)


export async  function connectMongo (){
    try{
        await mongoose.connect(mongoUri, {dbName})
        console.log('hello')
        //await client.connect(mongoUri)
        return true
    }catch (e) {
        console.log(e)
        // await client.close()
        await mongoose.disconnect()
        return false
    }
}
