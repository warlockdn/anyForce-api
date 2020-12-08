import * as Joi from 'joi';
import { Field } from '../interfaces/field.model';
import { FieldType } from '../interfaces/field-types.model';

export class DynamicJoiValidatorGenerator {

	entity: string;
	fields: Array<Field>;

	schema: {
		get?: Joi.Description,
		post?: Joi.Description,
		patch?: Joi.Description,
		delete?: Joi.Description
	};

	constructor(entity: string, fields: Array<Field>) {
		this.entity = entity;
		this.fields = Array.isArray(fields) ? fields : [];
	}

	/**
	 * Generates schema's for different request type
	 */
	async generateSchema(): Promise<boolean> {
		try {
			this.schema = {
				get: await this._generateGetValidations(),
				post: await this._generatePostValidations(),
				patch: await this._generatePatchValidations(),
				delete: await this._generateDeleteValidations()
			};
			return true;
		} catch (error) {
			throw new Error(error);
		}
	}

	private async _generateGetValidations(): Promise<Joi.Description> {
		const schema = Joi.object().keys({
			[this.entity]: Joi.string().min(3).max(30)
		});
		return schema.describe();
	}

	/**
	 * Will generate dynamic Joi schema for POST based on fields of the specified Entity
	 */
	private async _generatePostValidations(): Promise<Joi.Description> {

		const arrayValidator = {
			type: 'array',
			items: []
		};

		const validator = {
			type: 'object',
			rules: [{
				name: 'min',
				args: {
					limit: 1
				}
			}],
			keys: {}
		};

		for (const field of this.fields) {
			const key = {
				type: 'string',
				flags: {},
				rules: []
			};

			if (field.type) {

				if (this._getFieldType(field.type) === 'string') {
					key.type = 'string';
				} else if (this._getFieldType(field.type) === 'date') {
					key.type = 'date';
				} else if (this._getFieldType(field.type) === 'number') {
					key.type = 'number';
				} else if (this._getFieldType(field.type) === 'boolean') {
					key.type = 'boolean';
				} else {
					key.type = 'string';
				}
			}

			if (field.iseditable !== undefined && field.iseditable === false) {
				key.flags['presence'] = 'forbidden';
			}

			if (field.min && this._getFieldType(field.type) === 'string') {
				key.rules.push({
					name: 'min',
					args: {
						limit: field.min
					}
				});
			}

			if (field.max && this._getFieldType(field.type) === 'string') {
				key.rules.push({
					name: 'max',
					args: {
						limit: field.max
					}
				});
			}

			if (field.minDate && this._getFieldType(field.type) === 'date') {
				key.rules.push({
					name: 'min',
					args: {
						date: field.minDate
					}
				});
			}

			if (field.maxDate && this._getFieldType(field.type) === 'date') {
				key.rules.push({
					name: 'min',
					args: {
						date: field.maxDate
					}
				});
			}

			if (field.required) {
				key.flags['presence'] = 'required';
			}

			if (Object.keys(key.flags).length === 0) delete key.flags;
			if (key.rules.length === 0) delete key.rules;

			validator.keys[field.name] = key;

		}

		arrayValidator.items.push(validator);

		return arrayValidator;

	}

	/**
	 * Will generate dynamic Joi schema for PATCH based on fields of the specified Entity
	 */
	private async _generatePatchValidations(): Promise<Joi.Description> {

		const arrayValidator = {
			type: 'array',
			items: []
		};

		const validator = {
			type: 'object',
			rules: [
				{
					name: 'min',
					arg: 1
				}
			],
			keys: {}
		};

		for (const field of this.fields) {
			const key = {
				type: 'string',
				flags: {},
				rules: []
			};

			if (field.type) {

				if (this._getFieldType(field.type) === 'string') {
					key.type = 'string';
				} else if (this._getFieldType(field.type) === 'date') {
					key.type = 'date';
				} else if (this._getFieldType(field.type) === 'number') {
					key.type = 'number';
				} else if (this._getFieldType(field.type) === 'boolean') {
					key.type = 'boolean';
				} else {
					key.type = 'string';
				}
			}

			if (!field.iseditable) {
				key.flags['presence'] = 'forbidden';
			}

			if (field.min && this._getFieldType(field.type) === 'string') {
				key.rules.push({
					name: 'min',
					args: {
						limit: field.min
					}
				});
			}

			if (field.max && this._getFieldType(field.type) === 'string') {
				key.rules.push({
					name: 'max',
					args: {
						limit: field.max
					}
				});
			}

			if (field.minDate && this._getFieldType(field.type) === 'date') {
				key.rules.push({
					name: 'min',
					args: {
						date: field.minDate
					}
				});
			}

			if (field.maxDate && this._getFieldType(field.type) === 'date') {
				key.rules.push({
					name: 'min',
					args: {
						date: field.maxDate
					}
				});
			}

			if (Object.keys(key.flags).length === 0) delete key.flags;
			if (key.rules.length === 0) delete key.rules;

			validator.keys[field.name] = key;

		}

		arrayValidator.items.push(validator);
		return arrayValidator;

	}

	private async _generateDeleteValidations(): Promise<Joi.Description> {
		return Joi.string().min(3).max(20).required().describe();
	}

	/**
	 * Returns the type of Field in plain text
	 * @param type Field type from field.type
	 */
	private _getFieldType(type: string): 'string' | 'date' | 'boolean' | 'number' {
		if ((type === FieldType.text) ||
			(type === FieldType.textarea) ||
			(type === FieldType.specialtext)) {
			return 'string';
		} else if ((type === FieldType.date ||
			type === FieldType.daterange)) {
			return 'date';
		} else if ((type === FieldType.number ||
			type === FieldType.double ||
			type === FieldType.currency)) {
			return 'number';
		} else if (type === FieldType.switch) {
			return 'boolean';
		} else {
			return 'string';
		}
	}

}
