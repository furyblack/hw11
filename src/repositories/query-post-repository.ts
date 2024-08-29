import {PostMongoDbType, PostOutputType, postSortData} from "../types/posts/output";
import {CommentModel, PostModel} from "../db/db";
import {PostMapper} from "../domain/posts-service";
import {PaginationOutputType} from "../types/blogs/output";
import {ObjectId, SortDirection} from "mongodb";
import {CommentOutputType} from "../types/comment/output-comment-type";
import {CommentMapper} from "./comment-repository";


export class QueryPostRepository {

    static async getAll(sortData: postSortData):Promise<PaginationOutputType<PostOutputType[]>> {
        const {pageSize, pageNumber, sortBy, sortDirection, searchNameTerm} = sortData
        const search = searchNameTerm
            ? {title: {$regex: searchNameTerm, $options: 'i'}}
            : {}
        const  post = await PostModel
            .find(search)
            .sort({ [sortBy]: sortDirection as SortDirection })
            .limit(pageSize)
            .skip((pageNumber - 1) * pageSize)
            .lean()

        const totalCount = await PostModel.countDocuments(search)
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount,
            items: post.map(p =>PostMapper.toDto(p))
        }

    }
    static async getAllCommentsForPost(postId:string, sortData:postSortData):Promise<PaginationOutputType<CommentOutputType[]>>{
        const {pageSize, pageNumber, sortBy, sortDirection} = sortData
        const search = {postId: postId}
        const post = await CommentModel
            .find(search)
            .sort({ [sortBy]: sortDirection as SortDirection })
            .limit(pageSize)
            .skip((pageNumber - 1) * pageSize)
            .lean()
        // подсчёт элементов (может быть вынесено во вспомогательный метод)
        const totalCount = await CommentModel.countDocuments(search)

        return {

            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount,
            items: post.map(c => CommentMapper.toDto(c))
        }

    }


    static async getById(id: string): Promise<PostOutputType | null> {
        const post: PostMongoDbType | null = await PostModel.findOne({_id: new ObjectId(id)})
        if (!post) {
            return null
        }
        return PostMapper.toDto(post)
    }
}