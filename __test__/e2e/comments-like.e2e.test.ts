import mongoose from "mongoose";
import {agent as request} from 'supertest'
import {app} from "../../src/settings";


const userCreateData = {
    login:"testUser",
    password:"testPassword",
    email:"testuser@example.com"
}

let user: {id:string, login:string, email:string}
let refreshToken:string
let commentId: string

describe('/comments', ()=> {
    jest.setTimeout(10000)
    // const mongoURI = 'mongodb+srv://miha:miha2016!@cluster0.expiegq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    const mongoURI = 'mongodb://localhost:27017'
    beforeAll(async () => {

        await mongoose.connect(mongoURI, {dbName: 'testLikes'}) //'testUser'
        await request(app).delete("/testing/all-data")


        //создаем пользователя
        const createUserResponse = await request(app)
            .post("/users")
            .auth("admin", "qwerty")
            .send(userCreateData)
            .expect(201)

        user = createUserResponse.body

        //логинимся и получаем refresh token

        const loginResponse = await request(app)
            .post("/auth/login")
            .send({loginOrEmail: userCreateData.login, password:userCreateData.password})
            .expect(200)

        refreshToken = loginResponse.headers['set-cookie'][0].split(";")[0].split('=')[1]

        //создаем пост и комент

        const createPostResponse = await request(app)
            .post('/posts')
            .auth('admin', 'qwerty')
            .send({title:'test post', content:'test content',shortDescription:'testtesttsettset'})
            .expect(400)

        console.log("123",createPostResponse.body)

        const postId: string = createPostResponse.body.id

        const createCommentResponse = await request(app)
            .post(`/posts/${postId}/comments`)
            .set('Cookie', `refreshToken=${refreshToken}`)
            .send({content:'Test comment'})
            .expect(201)

        commentId = createCommentResponse.body.id

    })

    afterAll(async () => {
        /* Closing database connection after each test. */
        await request(app).delete('/testing/all-data')
        await mongoose.connection.close()
    });

    it('should like the comment', async ()=>{
        await request(app)
            .put(`/comments/${commentId}/like-status`)
            .set('Cookie', `refreshToken=${refreshToken}`)
            .send({likeStatus:'Like'})
            .expect(204)

        const getCommentResponse = await request(app)
            .get(`/comments/${commentId}`)
            .set('Cookie', `refreshToken=${refreshToken}`)
            .expect(200)


        expect(getCommentResponse.body.likesInfo.likesCount).toBe(1)
        expect(getCommentResponse.body.likesInfo.dislikesCount).toBe(0)
        expect(getCommentResponse.body.likesInfo.myStatus).toBe('Like')
    })
})