import * as mongoose from 'mongoose';
import { Field } from '../interfaces/field.model';
import { FieldTypeConstructor, FieldType } from '../interfaces/field-types.model';
import { DynamicSchemaClass, generateSchemaMiddleware } from '../models/content';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export class DynamicSchemaGenerator {

	entity: string;
	fields: Array<Field>;
	model: mongoose.Model<any>;

	constructor(entity: string, fields: Array<Field>, ) {
		this.fields = Array.isArray(fields) ? fields : [];
		this.entity = entity;

		//  Generating mongoose schema with middlewares and schema class
		const _schema = this._generateSchema();
		this.applyMiddleWare(entity, _schema);
		this.model = this._generateModel(entity, _schema);
	}

	/**
	 * Generating Monoose Schema from list of fields
	 */
	private _generateSchema(): any {
		const _schema = {};

		// Adding id
		_schema['id'] = {
			type: FieldTypeConstructor.text,
			required: true,
			index: true
		};

		_schema['createdDate'] = { type: Date, default: dayjs.utc().toDate() };
		_schema['updatedDate'] = { type: Date, default: dayjs.utc().toDate() };

		for (const field of this.fields) {
			const element = field;
			const key = field.name;

			// Add Type
			_schema[key] = {
				type: FieldTypeConstructor[field.type]
			};

			// Is Required
			_schema[key].required = element.required;

			// Add Min/Max Date
			if (element.type && (
				element.type === FieldType.date ||
				element.type === FieldType.daterange)
			) {
				if (element.minDate) _schema[key].min = element.minDate;
				if (element.maxDate) _schema[key].max = element.maxDate;
			} else if ( // Add Min/Max value
				element.type && (
					element.type === FieldType.currency ||
					element.type === FieldType.double ||
					element.type === FieldType.number ||
					element.type === FieldType.specialtext ||
					element.type === FieldType.text ||
					element.type === FieldType.textarea
				)) {
				if (element.min) _schema[key].min = element.min;
				if (element.max) _schema[key].max = element.max;
			} else {
				// nothing
			}
		}

		return new mongoose.Schema(_schema);
	}

	/**
	 * Apply schema middleware..
	 * @param name Schema Name
	 * @param schema Mongoose Schema barebones
	 */
	applyMiddleWare(name: string, schema: mongoose.Schema): void {
		generateSchemaMiddleware(name, schema);
	}

	/**
	 * Takes the generated schema and generates a mongoose model
	 * @param entity Entity Schema Name
	 * @param schema Mongoose Schema with Middleware..
	 */
	private _generateModel(entity: string, schema: mongoose.Schema): mongoose.Model<any> {
		const updatedEntity = entity.substr(0, 1).toUpperCase() + entity.substr(1, entity.length).toLowerCase();

		// Load Class
		schema.loadClass(DynamicSchemaClass);

		// Generating Model
		return mongoose.model(updatedEntity, schema);
	}

}
