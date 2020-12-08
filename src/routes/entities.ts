import { Router } from 'express';
import FieldRoute from './entities/fields';
import LayoutRoute from './entities/layouts';

import { EntitiesController } from './../controller/entitiesController';
import { EntitiesValidator } from '../validators/entitiesValidator';

export class EntitiesRoute {

	router: Router = Router({ mergeParams: true });
	public readonly routePath = '/entities';

	constructor() {
		this.initRoutes();
	}

	initRoutes(): Router {
		this.router.route(`${this.routePath}`)
			.get(EntitiesController.getEntity)
			.post(EntitiesValidator.postEntityValidate, EntitiesController.saveEntity);

		this.router.route(`${this.routePath}/:entityName`)
			.get(EntitiesValidator.getEntityValidate, EntitiesController.getEntity)
			.patch(EntitiesValidator.patchEntityValidate, EntitiesController.updateEntity)
			.delete(EntitiesValidator.deleteEntityValidate, EntitiesController.deleteEntity);

		this.router.use(`${this.routePath}/:entityName/fields`, FieldRoute);
		this.router.use(`${this.routePath}/:entityName/layouts`, LayoutRoute);

		return this.router;
	}
}
