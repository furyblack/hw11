import {NextFunction, Request, Response, Router} from "express";
import {QueryCommentRepository} from "../repositories/query-comment-repository";
import {authMiddlewareBearer} from "../middlewares/auth/auth-middleware";
import {commentForPostValidation} from "../validators/post-validators";
import {UpdateCommentType} from "../types/comment/input-comment-type";
import {CommentRepository} from "../repositories/comment-repository";
import {CommentModel} from "../db/db";
import {CommentService} from "../domain/comment-service";
import {jwtService} from "../application/jwt-service";
import {UsersRepository} from "../repositories/users-repository";

export const commentRouter= Router({})



const extractUserIdFromToken = async  (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        next()
        return;
    }
    // Извлекаем токен из заголовка
    const token = req.headers.authorization.split(' ')[1];
    // Получаем ID пользователя по токену
    const userId = await jwtService.getUserIdByToken(token);
    // Ищем пользователя в базе данных
    const user = await UsersRepository.findUserById(userId);
    if (user) {
        req.userDto = user; // Добавляем пользователя в объект запроса
        next(); // Передаем управление следующему middleware
        return;
    }
     return next()
};



commentRouter.get('/:id', extractUserIdFromToken, async (req: Request, res: Response)=>{
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

commentRouter.put('/:id/like-status', authMiddlewareBearer, async (req:Request,res:Response)=>{
    const id = req.params.id
    const  likeStatus = req.body
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
})


