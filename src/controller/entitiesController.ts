import { Request, Response } from 'express';
import { EntityModel, EntityClassModel } from '../models/entity';

export class EntitiesController {

	static async getEntity(req: Request, res: Response): Promise<void> {

		try {
			const entityName = req.params.entityName;
			const entityModel = EntityModel as unknown as EntityClassModel;

			if (entityName) { // Send specific entity

				res.status(200).json({
					status: 'Success',
					data: await entityModel.getOne(entityName)
				});

			} else { // Send all entities

				res.status(200).json({
					message: 'Success',
					data: await entityModel.getMany()
				});
			}
		} catch (error) {

			res.status(500).json({
				status: 'Error',
				message: error.message
			});

		}

	}

	static async saveEntity(req: Request, res: Response): Promise<void> {

		try {
			const entityModel = EntityModel as unknown as EntityClassModel;
			const entity = await entityModel.add(req.body);

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

	static async updateEntity(req: Request, res: Response): Promise<void> {

		const entityName = req.params.entityName;
		const entityModel = EntityModel as unknown as EntityClassModel;

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

	static async deleteEntity(req: Request, res: Response): Promise<void> {

		const entityName = req.params.entityName;
		const isSoftDelete = Boolean(req.query.softDelete) as boolean;
		const entityModel = EntityModel as unknown as EntityClassModel;

		try {

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
		}

	}

}
