import { Router } from "express";

export class AuthRoute {

    router: Router = Router();
    public static routePath = '/entities';

    constructor() {
        this.initRoutes();
    }

    initRoutes(): void {
        this.router.route('/')
            .get()
            .post()
    }

}