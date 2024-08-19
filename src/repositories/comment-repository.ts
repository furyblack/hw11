import {CommentMongoDbType, CommentOutputType} from "../types/comment/output-comment-type";
import {ObjectId, WithId} from "mongodb";
import {CommentModel} from "../db/db";
import {UpdateCommentType} from "../types/comment/input-comment-type";
import {QueryCommentRepository} from "./query-comment-repository";

export class CommentMapper {
    static toDto(comment: WithId<CommentMongoDbType>): CommentOutputType {
        return {
            id: comment._id.toString(),
            createdAt: comment.createdAt.toISOString(),
            content: comment.content,
            commentatorInfo: comment.commentatorInfo
        }
    }
}

export class CommentRepository {
    static async findById(commentId: string):Promise<WithId<CommentMongoDbType> | null>{

        return  CommentModel.findOne({_id: new ObjectId(commentId)})
    }

    static async createComment(commentParams:CommentMongoDbType):Promise<{commentId: string}>{

        const cteatedCommentData  = await CommentModel.create(commentParams)
        return {
            commentId: cteatedCommentData._id.toString(),
        }
    }

    static  async updateComment(commentId: string, updateData:UpdateCommentType):Promise<boolean|null>{
        const post = await QueryCommentRepository.getById(commentId)
        if(!post){
            return null
        }
        const updateResult= await CommentModel.updateOne({_id: new ObjectId(commentId)},{$set:{...updateData}})
        const updatedCount = updateResult.modifiedCount
        return !!updatedCount;
    }

    static async deleteComment(id:string):Promise<boolean>{
        try {
            const result = await CommentModel.deleteOne({_id: new ObjectId(id)})
            return result.deletedCount===1;
        }catch (error){
            console.error("Error deleting comment", error)
            return false
        }
    }
}

