import {CommentMongoDbType} from "../types/comment/output-comment-type";
import {CommentRepository} from "../repositories/comment-repository";
import {PostRepository} from "../repositories/post-repository";
import {CommentModel, LikeModel, LikeStatusEnum} from "../db/db";

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
            }
        }
        return   await CommentRepository.createComment(newComment)
    }


    static async updateLikeStatus(commentId: string, userId: string, likeStatus: LikeStatusEnum): Promise<void> {
        const existingLike = await LikeModel.findOne({ commentId, userId });

        if (likeStatus === LikeStatusEnum.NONE) {
            if (existingLike) {
                await existingLike.deleteOne();
            }
        } else {
            if (existingLike) {
                if (existingLike.status !== likeStatus) {
                    await existingLike.updateOne({ status: likeStatus });
                }
            } else {
                await LikeModel.create({ commentId, userId, status: likeStatus, createdAt: new Date() });
            }
        }

        await updateCommentLikeCounts(commentId);
    }

}
const updateCommentLikeCounts = async (commentId:string)=>{
    const likesCount  = await LikeModel.countDocuments({commentId, status:LikeStatusEnum.LIKE})
    const dislikesCount  = await LikeModel.countDocuments({commentId, status:LikeStatusEnum.DISLIKE})

        // обновляем поля likesInfo
    await CommentModel.findByIdAndUpdate(commentId,{
        'likesInfo.likesCount':likesCount,
        'likesInfo.dislikesCount':dislikesCount,

    })
}