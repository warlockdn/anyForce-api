import * as Joi from 'joi';
import { Request, NextFunction, Response } from 'express';
import { ErrorTypes } from '../config/error-types';
import { joiErrorExtract } from '../utils/errorHandler';
// import { FieldType } from '../models/field-types.model';

export class FieldsValidator {

	static async getFieldValidate(req: Request, res: Response, next: NextFunction): Promise<void> {

		const fieldName = req.params.fieldName;
		// const query = req.query; To implement

		try {
			let schema: Joi.Schema;
			if (fieldName) {
				schema = Joi.object().keys({
					fieldName: Joi.string().min(3).max(30)
				});
				await schema.validateAsync(fieldName);
				next();
			} else {
				next();
			}
		} catch (error) {
			res.status(400).json({
				message: ErrorTypes.validationFailed,
				errors: joiErrorExtract(error)
			});
		}

	}

	static async postFieldValidate(req: Request, res: Response, next: NextFunction): Promise<void> {

		const fields = Array.isArray(req.body) ? req.body : [req.body];

		const staticPickListSchema = Joi.object().keys({
			multiple: Joi.boolean().default(false),
			options: Joi.array().items(
				Joi.object().keys({
					value: Joi.string().required(),
					label: Joi.string(),
					default: Joi.boolean()
				})
			)
		});

		const dynamicPickListSchema = Joi.object().keys({
			multiple: Joi.boolean().default(false),
			linkedList: Joi.string().min(3).max(30).not('fields').required()
		});

		const fieldSchema = Joi.array().items(
			Joi.object().keys({
				type: Joi.string().valid('text', 'date', 'daterange', 'number', 'double', 'currency', 'picklist', 'textarea', 'specialtext', 'file', 'switch', 'lookup').required(),
				name: Joi.string().min(3).max(30).not('fields').required(),
				label: Joi.string().min(3).max(30).required(),
				placeholder: Joi.string().min(3).max(30),
				helptext: Joi.string().min(10).max(160),
				masktext: Joi.string().max(20),
				required: Joi.boolean(),
				iseditable: Joi.boolean(),
				min: Joi.number().min(0),
				max: Joi.number().min(0),
				minDate: Joi.date(),
				maxDate: Joi.date(),
				picklistoptions: Joi.alternatives().try(staticPickListSchema, dynamicPickListSchema)
			}).required()
				.without('min', ['minDate', 'maxDate'])
				.without('max', ['minDate', 'maxDate'])
				.without('minDate', ['min', 'max'])
				.without('maxDate', ['min', 'max'])
				.with('picklist', ['picklistoptions'])
		);

		try {
			await fieldSchema.validateAsync(fields);
			next();
		} catch (error) {
			res.status(400).json({
				message: ErrorTypes.validationFailed,
				errors: joiErrorExtract(error)
			});
		}

	}

	static async patchFieldValidate(req: Request, res: Response, next: NextFunction): Promise<void> {

		const fieldName = req.params.fieldName;
		const field = { ...req.body };

		const staticPickListSchema = Joi.object().keys({
			multiple: Joi.boolean().default(false),
			options: Joi.array().items(
				Joi.object().keys({
					value: Joi.string().required(),
					label: Joi.string(),
					default: Joi.boolean()
				})
			)
		});

		const dynamicPickListSchema = Joi.object().keys({
			multiple: Joi.boolean().default(false),
			linkedList: Joi.string().min(3).max(30).not('fields').required()
		});

		const fieldSchema = Joi.object().keys({
			name: Joi.string().min(3).max(30).not('fields').required(),
			label: Joi.string().min(3).max(30),
			placeholder: Joi.string().min(3).max(30),
			helptext: Joi.string().min(10).max(160),
			masktext: Joi.string().max(20),
			required: Joi.boolean(),
			iseditable: Joi.boolean(),
			min: Joi.number().min(0),
			max: Joi.number().min(0),
			minDate: Joi.date(),
			maxDate: Joi.date(),
			picklistoptions: Joi.alternatives().try(staticPickListSchema, dynamicPickListSchema)
		}).min(1)
			.without('min', ['minDate', 'maxDate'])
			.without('max', ['minDate', 'maxDate'])
			.without('minDate', ['min', 'max'])
			.without('maxDate', ['min', 'max']);

		try {
			await fieldSchema.validateAsync(Object.assign(field, { name: fieldName }));
			next();
		} catch (error) {
			res.status(400).json({
				message: ErrorTypes.validationFailed,
				errors: joiErrorExtract(error)
			});
		}

	}

	static async deleteFieldValidate(req: Request, res: Response, next: NextFunction): Promise<void> {

		const fieldName = req.params.fieldName;

		try {
			const schema = Joi.object().keys({
				fieldName: Joi.string().min(3).max(30)
			});
			await schema.validateAsync(fieldName);
			next();
		} catch (error) {
			res.status(400).json({
				message: ErrorTypes.validationFailed,
				errors: joiErrorExtract(error)
			});
		}

	}

}
