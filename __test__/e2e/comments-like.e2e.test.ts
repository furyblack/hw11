import mongoose from "mongoose";

describe('users', ()=> {
    const mongoURI = 'mongodb+srv://miha:miha2016!@cluster0.expiegq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    beforeAll(async () => {

        await mongoose.connect(mongoURI, {dbName: 'testUser'})

    })
    afterAll(async () => {
        /* Closing database connection after each test. */
        await mongoose.connection.close()
    })
    it('commentlikes', ()=>{

    })
})