export type CommentOutputType = {
    "id": string,
    "content": string,
    "commentatorInfo": {
        "userId": string,
        "userLogin": string
    },
    "createdAt": string
}

export type CommentMongoDbType =  {

    "postId":string,
    "content": string,
    "commentatorInfo":{
        "userId": string,
        "userLogin": string
    }
    "createdAt": Date,
    "likesCount": number,
    "dislikesCount": number
}
export type CommentMongoDbTypeWithId = CommentMongoDbType & { _id: Object };
