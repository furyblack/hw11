import {Request, Response, Router} from "express";
import {QueryCommentRepository} from "../repositories/query-comment-repository";
import {authMiddlewareBearer} from "../middlewares/auth/auth-middleware";
import {commentForPostValidation} from "../validators/post-validators";
import {UpdateCommentType} from "../types/comment/input-comment-type";
import {CommentRepository} from "../repositories/comment-repository";
import {CommentService} from "../domain/comment-service";
import {extractUserIdFromToken} from "../middlewares/comments/comments-middleware";
import {LikeModel} from "../db/likes-model";
import {CommentModel} from "../db/comment-model";

export const commentRouter= Router({})

//миддл вар для получения комента всем пользователям( и даже не авторизованным)


class CommentController{
    async getComment(req: Request, res: Response){
        {
            const commentId = req.params.id;
            const userId = req.userDto ? req.userDto._id.toString() : null;

            const comment = await QueryCommentRepository.getById(commentId);

            if (!comment) {
                return res.sendStatus(404);
            }

            let myStatus = 'None';

            if (userId) {
                const userLike = await LikeModel.findOne({ commentId, userId });
                if (userLike) {
                    myStatus = userLike.status;
                }
            }

            const responseComment = {
                id: comment.id,
                content: comment.content,
                commentatorInfo: comment.commentatorInfo,
                createdAt: comment.createdAt,
                likesInfo: {
                    likesCount: comment.likesInfo.likesCount,
                    dislikesCount: comment.likesInfo.dislikesCount,
                    myStatus: myStatus,
                }
            };

            res.status(200).send(responseComment);
            return
        }
    }
    async  updateComment(req: Request, res: Response){
        {
            const commentUpdateParams: UpdateCommentType={
                content: req.body.content
            }
            const commentId = req.params.id

            const userId = req.userDto._id

            const foundComment = await CommentRepository.findById(commentId)
            if( foundComment && foundComment?.commentatorInfo.userId.toString() !== userId.toString()){
                return res.sendStatus(403)
            }
            await CommentRepository.updateComment(commentId, commentUpdateParams)
            if(!foundComment) return res.sendStatus(404)
            return res.sendStatus(204)
        }
    }
    async  deleteComment(req:Request,res:Response){
        {
            const commentId = req.params.id

            const userId = req.userDto._id

            const foundComment = await CommentRepository.findById(commentId)
            if (foundComment && foundComment?.commentatorInfo.userId.toString() !== userId.toString()) {
                return res.sendStatus(403)
            }

            await CommentRepository.deleteComment(commentId)
            if (!foundComment) return res.sendStatus(404)
            return res.sendStatus(204)
        }
    }
    async updateLikeStatus(req:Request,res:Response){
        {
            const id = req.params.id
            const  {likeStatus} = req.body
            const userId = req.userDto._id.toString()

            if(!['None', 'Like','Dislike'].includes(likeStatus)){
                return res.status(400).send({errorsMessages:[{message:'Invalid like status', field:'likeStatus'}]})
            }

            try {
                const commentsExists = await CommentModel.findById(id)
                if(!commentsExists){
                    return res.status(404).send({errorMessages:[{message:'Comment not found', field:'commentId'}]})
                }

                await CommentService.updateLikeStatus(id, userId, likeStatus)
                return res.sendStatus(204)
            }catch (error){
                console.error('Error updating like status:', error);
                return res.status(500).send({error:'Something went wrong'});
            }
        }
    }
}
const commentController = new CommentController()

commentRouter.get('/:id', extractUserIdFromToken, commentController.getComment);

commentRouter.put('/:id', authMiddlewareBearer, commentForPostValidation(), commentController.updateComment)

commentRouter.delete('/:id',authMiddlewareBearer, commentController.deleteComment)

commentRouter.put('/:id/like-status', authMiddlewareBearer, commentController.updateLikeStatus)


