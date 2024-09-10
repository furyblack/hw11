import mongoose from "mongoose";
import {agent as request} from 'supertest'
import {app} from "../../src/settings";


const userCreateDate = {
    login:"testUser",
    password:"testPassword",
    email:"testuser@example.com"
}

let user
let refreshToken
let commentId

describe('/comments', ()=> {

    const mongoURI = 'mongodb+srv://miha:miha2016!@cluster0.expiegq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    beforeAll(async () => {

        await mongoose.connect(mongoURI, {dbName: 'testLikes'}) //'testUser'
        await request(app).delete("/testing/all-data")


        //создаем пользователя
        const createUserResponse = await request(app)
            .post("/users")
            .auth("admin", "qwerty")
            .send(userCreateDate)
            .expect(201)

        user = createUserResponse.body

        //логинимся и получаем refresh token

        const loginResponse = await request(app)
            .post("/auth/login")
            .send({loginOrEmail: userCreateDate.login, password:userCreateDate.password})
            .expect(200)

        refreshToken = loginResponse.headers['set-cookie'][0].split(";")[0].split('=')[1]

        //создаем пост и комент


    })
    afterAll(async () => {
        /* Closing database connection after each test. */
        await mongoose.connection.close()
    })
    it('commentlikes', ()=>{

    })
})