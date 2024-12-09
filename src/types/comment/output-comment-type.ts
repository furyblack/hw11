import {CreateCommentServiceType} from "../../domain/comment-service";
import {LikeStatusEnum} from "../../db/likes-model";

export type CommentOutputType = {
    "id": string,
    "content": string,
    "commentatorInfo": {
        "userId": string,
        "userLogin": string
    },
    "createdAt": string
    likesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus:LikeStatusEnum
    }
}

// export type CommentMongoDbType =  {
//     "postId":string,
//     "content": string,
//     "commentatorInfo":{
//         "userId": string,
//         "userLogin": string
//     }
//     "createdAt": Date,
//     likesInfo: {
//         likesCount: number,
//         dislikesCount: number
//     }
// }

export class CommentMongoDbType {
    constructor(
        public postId: string,
        public content: string,
        public commentatorInfo: {
            userId: string,
            userLogin: string,
        },
        public createdAt: Date,
        public likesInfo: {
            likesCount: number,
            dislikesCount: number
        }
    ) {
    }
}

export class CommentDb {
    public postId: string
    public content: string
    public commentatorInfo: {
        userId: string,
        userLogin: string,
    }
    public createdAt: Date
    public likesInfo: {
        likesCount: number,
        dislikesCount: number
    }
    constructor(data: CreateCommentServiceType) {
        this.postId = data.postId
        this.content = data.content
        this.commentatorInfo =  {
            userId: data.userId,
            userLogin: data.userLogin
        }
        this.createdAt = new Date()
        this.likesInfo = {
            likesCount: 0,
            dislikesCount: 0
        }
    }

}