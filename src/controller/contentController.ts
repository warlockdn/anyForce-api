import { Request, Response } from 'express';
import { DynamicSchemaModel, DynamicSchemaClass } from '../models/content';
import { capitalizeString } from './../utils/utils';
import { parse as QueryParse } from 'qs';
import parseQueryString from '../utils/query-string-parser';

export class ContentController {

	static async getContent(req: Request, res: Response): Promise<void> {

		try {
			const entityName = capitalizeString(req.route.path.replace('/', ''));
			const entityModel = global.models[entityName] as DynamicSchemaClass as unknown as DynamicSchemaModel;

			// Checking if the request has query params
			if (req.query) {

				const query = req.url.split('?')[1];
				const parsedQuery = parseQueryString((QueryParse(query)));
				res.status(200).json({
					// query: parsedQuery,
					data: await entityModel.getMany(parsedQuery)
				});

			} else {

				if (entityName) { // Send specific entity

					res.status(200).json({
						status: 'Success',
						data: await entityModel.getMany()
					});

				} else { // Send all entities

					res.status(200).json({
						message: 'Success',
						data: await entityModel.getMany()
					});
				}
			}

		} catch (error) {

			res.status(500).json({
				status: 'Error',
				message: error.message
			});

		}

	}

	static async saveContent(req: Request, res: Response): Promise<void> {

		try {
			const entityName = capitalizeString(req.route.path.replace('/', ''));
			const entityModel = global.models[entityName] as DynamicSchemaClass as unknown as DynamicSchemaModel;
			const entity = Array.isArray(req.body) ?
				await entityModel.bulkAdd(req.body, entityName) :
				await entityModel.add(req.body);

			res.status(200).json({
				status: 'Success',
				data: entity
			});
		} catch (error) {
			res.status(500).json({
				status: 'Error',
				message: error.message
			});
		}

	}

	static async updateContent(req: Request, res: Response): Promise<void> {

		const entityName = capitalizeString(req.route.path.replace('/', ''));
		const entityModel = global.models[entityName] as DynamicSchemaClass as unknown as DynamicSchemaModel;

		try {
			res.status(200).json({
				status: 'Success',
				data: await entityModel.edit(entityName, req.body)
			});
		} catch (error) {
			res.status(500).json({
				status: 'Error',
				message: error.message
			});
		}

	}

	/* static async deleteContent(req: Request, res: Response): Promise<void> {

		const entityName = req.route.path.replace('/', '');
		const isSoftDelete = Boolean(req.query.softDelete) as boolean;
		const entityModel = global.models[entityName] as DynamicSchemaClass as unknown as DynamicSchemaModel;

		/* try {

			await entityModel.deleteOneEntity(entityName, isSoftDelete)

			if (isSoftDelete) {
				res.status(200).json({
					status: 'Success',
					message: 'Soft delete executed successfully'
				})
			} else {
				res.status(204).send();
			}

		} catch (error) {
			res.status(500).json({
				status: 'Error',
				message: error.message
			});
		} */

	// }

}
