import { EntityModel } from '../models/entity';
import { Router } from 'express';
import { Entity } from '../interfaces/entity.model';
import { DynamicSchemaGenerator } from '../utils/dynamic-schema-generator';
import { Field } from '../interfaces/field.model';
import { DynamicJoiValidatorGenerator } from '../utils/joi-validator-generator';
import { RequestSchema } from '../interfaces/app.model';
import { ContentValidator } from '../validators/contentValidator';
import { ContentController } from '../controller/contentController';

export class ContentRoute {

	router: Router = Router({ mergeParams: true });

	async fetchApplicationEntities(): Promise<Router> {
		try {
			global.models = {};
			global.validator = {};
			const entities = await EntityModel.find().select('-_id');
			for (const entity of entities) {
				const _entity: Entity = entity.toJSON();

				// Generate Model and routes
				await this.processEntityGeneration(_entity);

			}
			return this.router;
		} catch (error) {
			throw new Error(error);
		}
	}

	async generateMiddleware(entity: string, fields: Array<Field>): Promise<RequestSchema> {
		try {
			const dynamicValidator = new DynamicJoiValidatorGenerator(entity, fields);
			await dynamicValidator.generateSchema();
			return dynamicValidator.schema;
		} catch (error) {
			throw new Error(error);
		}
	}

	/**
	 * Generates Mongoose Model,
	 * then the middleware - GET, POST, PUT, DELETE
	 * generate routes and registers to express
	 * @param entity Entity with list of fields
	 */
	async processEntityGeneration(entity: any): Promise<void> {

		/** Generating Dynamic Content Model */
		const _entityModel = new DynamicSchemaGenerator(entity.name, entity.fields);

		/** Adding model to Node.Global */
		const modelName = entity.name.substr(0, 1).toUpperCase() + entity.name.substr(1, entity.name.length).toLowerCase();
		global.models[modelName] = _entityModel.model;

		/** Generate Middleware */
		const middlewares = await this.generateMiddleware(entity.name, entity.fields);

		// Adding Middleware to Node.Global
		global.validator[entity.name] = middlewares;

		// Generating Routes
		this.generateRoutes(entity.name, middlewares);

	}

	generateRoutes(route: string, middlewares: RequestSchema): void {

		const middlewareClass = new ContentValidator(route);
		middlewareClass.schema = middlewares;

		this.router.route(`/${route}`)
			.get(middlewareClass.getContentValidate, ContentController.getContent)
			.post(middlewareClass.postContentValidate, ContentController.saveContent)
			.patch(middlewareClass.patchContentValidate, ContentController.updateContent);
		/* // .delete(middlewareClass.deleteContentValidate, ContentController.) */
	}

}
