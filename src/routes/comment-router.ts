import {Request, Response, Router} from "express";
import {QueryCommentRepository} from "../repositories/query-comment-repository";
import {authMiddlewareBearer} from "../middlewares/auth/auth-middleware";
import {commentForPostValidation} from "../validators/post-validators";
import {UpdateCommentType} from "../types/comment/input-comment-type";
import {CommentRepository} from "../repositories/comment-repository";
import {CommentModel} from "../db/db";
import {CommentService} from "../domain/comment-service";

export const commentRouter= Router({})


commentRouter.get('/:id', async (req: Request, res: Response)=>{
const commentId = await QueryCommentRepository.getById(req.params.id)
    if(commentId){
        res.status(200).send(commentId)
    }else{
        res.sendStatus(404)
    }
})

commentRouter.put('/:id', authMiddlewareBearer, commentForPostValidation(), async (req: Request, res: Response) =>{
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
})

commentRouter.delete('/:id',authMiddlewareBearer, async (req:Request,res:Response) =>{

    const commentId = req.params.id

    const userId = req.userDto._id

    const foundComment = await CommentRepository.findById(commentId)
    if(foundComment && foundComment?.commentatorInfo.userId.toString() !== userId.toString()){
        return res.sendStatus(403)
    }

    await CommentRepository.deleteComment(commentId)
    if(!foundComment) return res.sendStatus(404)
     return res.sendStatus(204)
})

commentRouter.put('/:id/like-status', async (req:Request,res:Response)=>{
    const {commentId} = req.params
    const {userId, likeStatus} = req.body

    if(!['None', 'Like','Dislike'].includes(likeStatus)){
        return res.status(400).send({errorsMessages:[{message:'Invalid like status', field:'likeStatus'}]})
    }

    try {
        const commentsExists = await CommentModel.findById(commentId)
        if(!commentsExists){
            return res.status(404).send({errorMessages:[{message:'Comment not found', field:'commentId'}]})
        }

        await CommentService.updateLikeStatus(commentId, userId,likeStatus)
        return res.sendStatus(204)
    }catch (error){
        return res.status(500).send({error:'Something went wrong'})
    }
})


