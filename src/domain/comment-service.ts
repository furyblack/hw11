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
            likesCount: 0,
            dislikesCount: 0
        }
        return   await CommentRepository.createComment(newComment)

    }

    static async updateLikeStatus(commentId: string, userId: string, likeStatus: 'None'|'Like'|'Dislike'):Promise<void>{
        const existingLike = await LikeModel.findOne({commentId, userId})

        if(likeStatus=== 'None'){
            //удаляем лайк или дизлайк если статус None
            if(existingLike){
                await existingLike.deleteOne()
                await updateCommentLikeCounts(commentId)
            }
        }else{
            //обновляем или доабвляем лайк или дизлайк
            if(existingLike){
                if(existingLike.status !== likeStatus){
                    await existingLike.updateOne({status: likeStatus})
                }
            }else {
                await LikeModel.create({commentId,userId, status:likeStatus, createdAt:new Date()})

            }
            await updateCommentLikeCounts(commentId)
        }
    }
}
const updateCommentLikeCounts = async (commentId:string)=>{
    const likesCount  = await LikeModel.countDocuments({commentId, status:'Like'})
    const dislikesCount  = await LikeModel.countDocuments({commentId, status:'Dislike'})

    await CommentModel.findByIdAndUpdate(commentId,{likesCount,dislikesCount})
}