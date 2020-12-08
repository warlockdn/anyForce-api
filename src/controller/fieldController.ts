import { Request, Response } from 'express';
import { EntityClassModel, EntityModel } from '../models/entity';

export class FieldController {

	static async getFields(req: Request, res: Response): Promise<void> {
		try {

			const fieldName = req.params.fieldName;
			const entityModel = EntityModel as unknown as EntityClassModel;

			if (fieldName) {
				res.json({
					status: 'Success',
					data: await entityModel.findField(req.params.entityName, fieldName)
				});
			} else {
				res.json({
					status: 'Success',
					data: await entityModel.getFields(req.params.entityName)
				});
			}

		} catch (error) {
			res.json({
				status: 'Error',
				error: error.message
			});
		}
	}

	static async saveFields(req: Request, res: Response): Promise<void> {
		try {

			const entityModel = EntityModel as unknown as EntityClassModel;

			res.json({
				status: 'Success',
				fields: await entityModel.addFields(req.params.entityName, Array.isArray(req.body) ? req.body : [req.body])
			});
		} catch (error) {
			res.status(500).json({
				status: 'Error',
				error: error.message
			});
		}
	}

	static async updateFields(req: Request, res: Response): Promise<void> {
		try {

			const fieldName = req.params.fieldName;
			const updatedField = req.body;
			const entityModel = EntityModel as unknown as EntityClassModel;

			if (fieldName) {
				res.json({
					status: 'Success',
					data: await entityModel.updateField(req.params.entityName, fieldName, updatedField)
				});
			} else {
				res.json({
					status: 'Success'
				});
			}
		} catch (error) {
			res.status(500).json({
				status: 'Error',
				error: error.message
			});
		}
	}

	static async deleteFields(req: Request, res: Response): Promise<void> {
		try {

			const entityName = req.params.entityName;
			const fieldName = req.params.fieldName;
			const entityModel = EntityModel as unknown as EntityClassModel;

			res.status(204).json({
				status: 'Success',
				res: await entityModel.deleteField(entityName, fieldName)
			});
		} catch (error) {
			res.status(500).json({
				status: 'Error',
				error: error.message
			});
		}
	}

}
