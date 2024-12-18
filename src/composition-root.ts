import {UsersRepository} from "./repositories/users-repository";
import {UsersService} from "./domain/users-service";
import {UserController} from "./routes/users-router";
import {CommentRepository} from "./repositories/comment-repository";
import {CommentService} from "./domain/comment-service";
import {CommentController} from "./routes/comment-router";
import {PostRepository} from "./repositories/post-repository";
import {PostService} from "./domain/posts-service";
import {PostController} from "./routes/post-route";
import {BlogRepository} from "./repositories/blog-repository";
import {BlogsService} from "./domain/blogs-service";
import {BlogController} from "./routes/blog-route";


//REPO
const userRepo = new UsersRepository()
const postRepo = new PostRepository()
const commentRepo = new CommentRepository()
const blogRepo = new BlogRepository()

//Service
export const userService = new UsersService(userRepo)
export const postService = new PostService(postRepo)
export const commentService = new CommentService(commentRepo, postRepo)
export const blogService = new BlogsService(blogRepo)

//Controller
export const userController = new UserController(userService)
export const postController = new PostController(postService, postRepo,commentService)
export const commentController = new CommentController(commentService, commentRepo)
export const blogController = new BlogController(blogService, blogRepo,postService)







