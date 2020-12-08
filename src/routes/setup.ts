import { Router	} from 'express';

export class SetupRoute {

	constructor() {
		this.initRoutes();
	}

	public static routePath = '/setup';
	public router: Router = Router();

	initRoutes(): void {
		this.router.route('/')
			.post();
	}

}
