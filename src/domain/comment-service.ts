import {CommentRepository} from "../repositories/comment-repository";
import {PostRepository} from "../repositories/post-repository";
import {LikeModel, LikeStatusEnum} from "../db/likes-model";
import {CommentDb, CommentModel} from "../db/comment-model";

export type CreateCommentServiceType ={
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

        const newCommentForDB = new CommentDb({
            content:content,
            postId: postId,
            userLogin: userLogin,
            userId: userId
        })

        return await CommentRepository.createComment(newCommentForDB)
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