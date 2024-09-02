import { PostMongoDbType, PostOutputType, postSortData } from "../types/posts/output";
import {CommentModel, LikeModel, LikeStatusEnum, PostModel} from "../db/db";
import { PostMapper } from "../domain/posts-service";
import { PaginationOutputType } from "../types/blogs/output";
import { ObjectId, SortDirection } from "mongodb";
import { CommentOutputType } from "../types/comment/output-comment-type";


export class QueryPostRepository {


    static async getAll(sortData: postSortData): Promise<PaginationOutputType<PostOutputType[]>> {
        const { pageSize, pageNumber, sortBy, sortDirection, searchNameTerm } = sortData;
        const search = searchNameTerm
            ? { title: { $regex: searchNameTerm, $options: 'i' } }
            : {};
        const post = await PostModel
            .find(search)
            .sort({ [sortBy]: sortDirection as SortDirection })
            .limit(pageSize)
            .skip((pageNumber - 1) * pageSize)
            .lean();

        const totalCount = await PostModel.countDocuments(search);
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount,
            items: post.map(p => PostMapper.toDto(p))
        };
    }



    static async getAllCommentsForPost(postId: string, sortData: postSortData, userId: string | null): Promise<PaginationOutputType<CommentOutputType[]>> {
        const { pageSize, pageNumber, sortBy, sortDirection } = sortData;
        const search = { postId: postId };

        // Получаем все комментарии к посту с сортировкой и пагинацией
        const comments = await CommentModel
            .find(search)
            .sort({ [sortBy]: sortDirection as SortDirection })
            .limit(pageSize)
            .skip((pageNumber - 1) * pageSize)
            .lean();

        // Подсчёт общего количества комментариев
        const totalCount = await CommentModel.countDocuments(search);

        // Если userId не передан, возвращаем комментарии без `myStatus`
        if (!userId) {
            return {
                pagesCount: Math.ceil(totalCount / pageSize),
                page: pageNumber,
                pageSize: pageSize,
                totalCount,
                items: comments.map(c => ({
                    id: c._id.toString(),
                    content: c.content,
                    commentatorInfo: c.commentatorInfo,
                    createdAt: c.createdAt.toISOString(), // Преобразуем Date в строку
                    likesInfo: {
                        likesCount: c.likesInfo.likesCount,
                        dislikesCount: c.likesInfo.dislikesCount,
                        myStatus: LikeStatusEnum.NONE, // Используем LikeStatusEnum
                    }
                }))
            };
        }

        // Получаем статус реакции пользователя для каждого комментария
        const userLikes = await LikeModel.find({ commentId: { $in: comments.map(c => c._id) }, userId });
        const userLikesMap = new Map(userLikes.map(like => [like.commentId.toString(), like.status]));

        // Формируем ответ с учетом `myStatus`
        const responseComments = comments.map(c => {
            const myStatus = userLikesMap.get(c._id.toString()) || LikeStatusEnum.NONE; // Используем LikeStatusEnum
            return {
                id: c._id.toString(),
                content: c.content,
                commentatorInfo: c.commentatorInfo,
                createdAt: c.createdAt.toISOString(), // Преобразуем Date в строку
                likesInfo: {
                    likesCount: c.likesInfo.likesCount,
                    dislikesCount: c.likesInfo.dislikesCount,
                    myStatus: myStatus as LikeStatusEnum, // Приведение типа
                }
            };
        });

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount,
            items: responseComments
        };
    }



    static async getById(id: string): Promise<PostOutputType | null> {
        const post: PostMongoDbType | null = await PostModel.findOne({ _id: new ObjectId(id) });
        if (!post) {
            return null;
        }
        return PostMapper.toDto(post);
    }
}
