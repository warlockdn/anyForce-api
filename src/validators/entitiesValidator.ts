import * as Joi from 'joi';
import { Request, NextFunction, Response } from 'express';
import { ErrorTypes } from '../config/error-types';
import { joiErrorExtract } from '../utils/errorHandler';

export class EntitiesValidator {

	static async getEntityValidate(req: Request, res: Response, next: NextFunction): Promise<void> {

		const entityName = req.params.entityName;
		// const query = req.query;

		try {

			let schema: Joi.Schema;

			if (entityName) {
				schema = Joi.object().keys({
					entityName: Joi.string().min(3).max(15)
				});
				await schema.validateAsync({ entityName });
				next();
			} else {
				next();
			}

			/* if (query) {
				schema = Joi.object().keys({
					username: Joi.string()
						.alphanum()
						.min(3)
						.max(30)
						.required()
					});
			} */
		} catch (error) {
			res.status(400).json({
				message: ErrorTypes.validationFailed,
				errors: joiErrorExtract(error)
			});
		}

	}

	static async postEntityValidate(req: Request, res: Response, next: NextFunction): Promise<void> {

		const entity = req.body;

		const entitySchema: Joi.ObjectSchema = Joi.object().keys({
			name: Joi.string().min(3).max(20).not('entities', 'content').required(),
			description: Joi.string().min(10).max(250),
			label: Joi.string().min(3).max(30).required(),
			pluralLabel: Joi.string().min(3).max(30),
			allowSearch: Joi.boolean(),
			published: Joi.boolean()
		});

		try {
			await entitySchema.validateAsync(entity);
			next();
		} catch (error) {
			res.status(400).json({
				message: ErrorTypes.validationFailed,
				errors: joiErrorExtract(error)
			});
		}

	}

	static async patchEntityValidate(req: Request, res: Response, next: NextFunction): Promise<void> {

		const entity = req.body;

		const entitySchema: Joi.ObjectSchema = Joi.object().keys({
			description: Joi.string().min(10).max(250),
			label: Joi.string().min(3).max(30),
			pluralLabel: Joi.string().min(3).max(30),
			allowSearch: Joi.boolean(),
			published: Joi.boolean()
		}).or('description', 'label', 'pluralLabel', 'allowSearch', 'published');

		try {
			await entitySchema.validateAsync(entity);
			next();
		} catch (error) {
			res.status(400).json({
				message: ErrorTypes.validationFailed,
				errors: joiErrorExtract(error)
			});
		}

	}

	static async deleteEntityValidate(req: Request, res: Response, next: NextFunction): Promise<void> {

		const entityName = req.params.entityName;

		try {
			await Joi.string().min(3).max(20).required().validateAsync(entityName);
			next();
		} catch (error) {
			res.status(400).json({
				message: ErrorTypes.validationFailed,
				errors: joiErrorExtract(error)
			});
		}

	}

}
