import { Request, Response, NextFunction } from 'express';
import { ErrorTypes } from '../config/error-types';
import { joiErrorExtract } from '../utils/errorHandler';
import { RequestSchema } from '../interfaces/app.model';
import { contentSchemaValidator } from '../utils/utils';

export class ContentValidator {

	route: string;
	schema: RequestSchema;

	constructor(router: string) {
		this.route = router;
	}

	async getContentValidate(_req: Request, res: Response, next: NextFunction): Promise<void> {

		try {

			// const content = req.url.replace('/', '');
			// await contentSchemaValidator(content, req.method, req.params);
			next();
		} catch (error) {
			res.status(400).json({
				message: ErrorTypes.validationFailed,
				errors: joiErrorExtract(error)
			});
		}

	}

	async postContentValidate(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const content = req.url.replace('/', '');
			await contentSchemaValidator(content, req.method, Array.isArray(req.body) ? req.body : [req.body]);
			next();
		} catch (error) {
			res.status(400).json({
				message: ErrorTypes.validationFailed,
				error: (error && error.message) ? error.message : error
			});
		}
	}

	async patchContentValidate(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const content = req.url.replace('/', '');
			await contentSchemaValidator(content, req.method, Array.isArray(req.body) ? req.body : [req.body]);
			next();
		} catch (error) {
			res.status(400).json({
				message: ErrorTypes.validationFailed,
				error: (error && error.message) ? error.message : error
			});
		}
	}

	async deleteContentValidate(_req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			// await DynamicContentValidator.deleteValidate(this.route, req);
			next();
		} catch (error) {
			res.status(400).json({
				message: ErrorTypes.validationFailed,
				error: (error && error.message) ? error.message : error
			});
		}
	}

}
