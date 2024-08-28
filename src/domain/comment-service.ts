import {CommentMongoDbType, CommentMongoDbTypeWithId, CommentOutputType} from "../types/comment/output-comment-type";
import {CommentRepository} from "../repositories/comment-repository";
import {PostRepository} from "../repositories/post-repository";
import {CommentModel, LikeModel} from "../db/db";

export class CommentMapper{
    static toDto(comment:CommentMongoDbTypeWithId):CommentOutputType{
        return {
            id: comment._id.toString(),
            content: comment.content,
            commentatorInfo:comment.commentatorInfo,
            createdAt: comment.createdAt.toISOString()
        }
    }
}

type CreateCommentServiceType ={
    postId:string,
    content:string,
    userId:string,
    userLogin:string,
}
export class CommentService{
    static async createComment(data: CreateCommentServiceType):Promise<{commentId:string}|null>{
        const {postId,content,userLogin,userId} = data

        const post= await PostRepository.findPostById(postId)
        if(!post) return null


        const newComment:CommentMongoDbType={
            postId:postId,
            content: content,
            commentatorInfo: {
                userId: userId,
                userLogin: userLogin,
            },
            createdAt: new Date(),
            likesInfo:{
                likesCount: 0,
                dislikesCount: 0,
                myStatus:'None'
            }

        }
        return   await CommentRepository.createComment(newComment)

    }

    static async updateLikeStatus(commentId: string, userId: string, likeStatus: 'None'|'Like'|'Dislike'):Promise<void>{
        //находим существующий лайк для этого комента и пользователя
        const existingLike = await LikeModel.findOne({commentId, userId})

        if(likeStatus=== 'None'){
            //удаляем лайк или дизлайк если статус None
            if(existingLike){   //если лайк уже был
                await existingLike.deleteOne() // удаляем лайк из бд
                await updateCommentLikeCounts(commentId) // обновляем количество лайков дизлайков для комента
            }
        }else{
            //если статус лайка не NOne нужно добавить или обновить лайк\дизлайк
            if(existingLike){   //если лайк был
                if(existingLike.status !== likeStatus){ //если статус лайка изменился
                    await existingLike.updateOne({status: likeStatus}) //обновляем статус в бд
                }
            }else { //если лайка еще не было
                await LikeModel.create({commentId,userId, status:likeStatus, createdAt:new Date()})

            }
            await updateCommentLikeCounts(commentId) //обновляем количество лайков дизлайков
        }
    }
}
const updateCommentLikeCounts = async (commentId:string)=>{
    const likesCount  = await LikeModel.countDocuments({commentId, status:'Like'})
    const dislikesCount  = await LikeModel.countDocuments({commentId, status:'Dislike'})

    await CommentModel.findByIdAndUpdate(commentId,{likesCount,dislikesCount})
}