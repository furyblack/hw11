import {Router, Request, Response} from "express";
import {UsersService} from "../domain/users-service";
import {RequestWithBody, RequestWithQuery} from "../types/common";
import {CreateNewUserType, userQuerySortData} from "../types/users/inputUsersType";
import {UserOutputType} from "../types/users/outputUserType";
import {PaginationOutputType} from "../types/blogs/output";
import {userPaginator} from "../types/paginator/pagination";
import {queryUserRepo} from "../repositories/query-user-repository";
import {authMiddleware} from "../middlewares/auth/auth-middleware";
import {userValidation} from "../validators/user-validators";

export const usersRouter = Router({})

class UserController {
    userService:UsersService
    constructor() {
        this.userService = new UsersService()
    }
    async getUsers(req: RequestWithQuery<userQuerySortData>, res: Response<PaginationOutputType<UserOutputType[]>>) {
        const paginationData = userPaginator(req.query)

        const userPromise = await queryUserRepo.getAll(paginationData)
        res.send(userPromise)
    }

    async createUser(req: RequestWithBody<CreateNewUserType>, res: Response) {
        const userId: string = await this.userService.createUser(req.body.login, req.body.email, req.body.password)
        const user = await queryUserRepo.getById(userId)
        return res.status(201).send(user)
    }

    async deleteUser(req: Request, res: Response) {
        const isDeleteUser = await this.userService.deleteUser(req.params.id)
        if (isDeleteUser) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }
}

const userController = new UserController()

usersRouter.get('/', userController.getUsers)

usersRouter.post('/', authMiddleware, userValidation(), userController.createUser.bind(userController))

usersRouter.delete('/:id', authMiddleware, userController.deleteUser.bind(userController))

