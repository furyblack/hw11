import {authMiddleware, authMiddlewareBearer} from "../middlewares/auth/auth-middleware";
import {RequestWithBody, RequestWithParamsAndBody, RequestWithQuery, RequestWithQueryAndParams} from "../types/common";
import {Request, Response, Router} from "express";
import {PostOutputType} from "../types/posts/output";
import {CreateNewPostType, postQuerySortData, UpdatePostType} from "../types/posts/input";
import {commentForPostValidation, postValidation} from "../validators/post-validators";
import {queryPostRepo} from "../repositories/query-post-repository";
import {paginator} from "../types/paginator/pagination";
import {PaginationOutputType} from "../types/blogs/output";
import {CommentOutputType} from "../types/comment/output-comment-type";
import {CreateNewCommentType} from "../types/comment/input-comment-type";
import {queryCommentRepo} from "../repositories/query-comment-repository";
import {ObjectId} from "mongodb";
import {extractUserIdFromToken} from "../middlewares/comments/comments-middleware";
import {PostService} from "../domain/posts-service";
import {PostRepository} from "../repositories/post-repository";
import {CommentService} from "../domain/comment-service";

export const postRoute = Router({})

class PostController {
    postService:PostService
    private postRepo: PostRepository;
    private commentService: CommentService;
    constructor() {
        this.postService = new PostService()
        this.postRepo = new PostRepository()
        this.commentService = new CommentService()
    }

    async getPosts(req: RequestWithQuery<postQuerySortData>, res: Response<PaginationOutputType<PostOutputType[]>>) {
        const paginationData = paginator(req.query)
        const posts = await queryPostRepo.getAll(paginationData)
        res.send(posts)
    }

    async getPostById(req: Request, res: Response) {
        const postId = await queryPostRepo.getById(req.params.id)
        if (postId) {
            res.status(200).send(postId)
        } else {
            res.sendStatus(404)
        }
    }

    async getCommentsForPost(req: RequestWithQueryAndParams<{
        postId: string
    }, postQuerySortData>, res: Response) {
        const postId = req.params.postId
        const paginationData = paginator(req.query)
        const userId = req.userDto ? req.userDto._id.toString() : null;
        if (!ObjectId.isValid(postId)) {
            res.sendStatus(404)
            return
        }
        const foundPost = await this.postRepo.findPostById(postId)
        if (!foundPost) {
            res.sendStatus(404)
            /**
             * справка от Семена по статусам)
             * status - просто сетает сататус в запросе но не отправляет его
             * send -  сетает тело запроса и отправляет ответ на фронт (если не указан статус будет отправлен дефолтный например 200)
             * sendStatus просто их смесь ( укороченый синтаксис -> отправка пустого бади и статуса который укажешь )
             */
            return
        }
        try {
            const comments = await queryPostRepo.getAllCommentsForPost(postId, paginationData, userId)
            res.status(200).send(comments)
            return
        } catch (error) {
            console.error("Error fetching comments for post:", error)
            res.status(500).json({message: 'Internal server error'})
            return
        }
    }

    async createPost(req: RequestWithBody<CreateNewPostType>, res: Response<PostOutputType>) {
        const {title, shortDescription, content, blogId}: CreateNewPostType = req.body
        const addResult = await this.postService.createPost({title, shortDescription, content, blogId})
        if (!addResult) {
            res.sendStatus(404)
            return
        }
        res.status(201).send(addResult)
    }

    async createCommentForPost(req: RequestWithParamsAndBody<{
        postId: string
    }, CreateNewCommentType>, res: Response<CommentOutputType>) {

        const postId = req.params.postId;
        const content = req.body.content;
        const userId = req.userDto._id.toString();
        const userLogin = req.userDto.accountData.userName;
        const createResult = await this.commentService.createComment({content, postId, userId, userLogin})
        //если поста нет то 404
        if (!createResult) return res.sendStatus(404)

        const createdComment = await queryCommentRepo.getById(createResult.commentId)

        return res.status(201).send(createdComment!)
    }

    async updatePost(req: Request, res: Response) {
        const postUpdateParams: UpdatePostType = {
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content
        }
        const postId = req.params.id

        const isUpdated = await this.postService.updatePost(postId, postUpdateParams)
        if (isUpdated) {
            return res.sendStatus(204)
        } else {
            return res.sendStatus(404)
        }

    }

    async deletePost(req: Request, res: Response) {
        const isDeleted = await this.postService.deletePost(req.params.id)
        if (!isDeleted) {
            res.sendStatus(404)
        } else {
            res.sendStatus(204)
        }
    }
}

const postController = new PostController()

postRoute.get('/', postController.getPosts)

postRoute.get('/:id', postController.getPostById)

postRoute.get('/:postId/comments', extractUserIdFromToken, postController.getCommentsForPost)

postRoute.post('/', authMiddleware, postValidation(), postController.createPost.bind(postController))

postRoute.post("/:postId/comments", authMiddlewareBearer, commentForPostValidation(), postController.createCommentForPost.bind(postController))

postRoute.put('/:id', authMiddleware, postValidation(), postController.updatePost.bind(postController))

postRoute.delete('/:id', authMiddleware, postController.deletePost.bind(postController))



