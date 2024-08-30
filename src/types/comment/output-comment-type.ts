import {LikeStatusEnum} from "../../db/db";

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

export type CommentMongoDbType =  {

    "postId":string,
    "content": string,
    "commentatorInfo":{
        "userId": string,
        "userLogin": string
    }
    "createdAt": Date,
    likesInfo: {
        likesCount: number,
        dislikesCount: number
    }

}
