import { Document, Model, mongo, Schema } from 'mongoose';
import { staticImplements } from '../utils/staticImplements';
import { customAlphabet } from 'nanoid/async';
// import AggregationPipelineGenerator from '../utils/model-aggregator-generator';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import { ConvertedQueryParams } from '../interfaces/query.model';
dayjs.extend(utc);

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 15);

export interface DynamicSchemaModel {
	getOne(fieldName: string, value: any): Promise<Document>;
	getMany(parsedQuery?: ConvertedQueryParams): Promise<Array<Document>>;
	add(row: any): Promise<Document>;
	edit(id: string, updatedRow: any): Promise<Document>;
	bulkAdd(rows: Array<any>, entityName: string): Promise<Array<Document>>;
}

/**
 * Apply schema middleware..
 * @param name Schema Name
 * @param schema Mongoose Schema barebones
 */
export const generateSchemaMiddleware = (name: string, schema: Schema): Schema => {

	schema.pre('save', async function() {
		this.id = `${name}-${await nanoid()}`;
	});

	schema.set('toObject', {
		transform: (_doc: any, ret: any) => {
			ret._id = undefined;
		}
	});

	schema.pre('find', function(next) {
		next();
	});

	schema.pre('findOneAndUpdate', function(next) {
		const update = this.getUpdate();
		update.updatedDate = dayjs.utc().toDate();
		next();
	});

	// Specifically for __v updates
	schema.pre('findOneAndUpdate', function() {
		const update = this.getUpdate();
		if (update.__v != null) {
			delete update.__v;
		}
		const keys = ['$set', '$setOnInsert'];
		for (const key of keys) {
			if (update[key] != null && update[key].__v != null) {
				delete update[key].__v;
				if (Object.keys(update[key]).length === 0) {
					delete update[key];
				}
			}
		}
		update.$inc = update.$inc || {};
		update.$inc.__v = 1;
	});

	return schema;

};

@staticImplements<DynamicSchemaModel>()
export class DynamicSchemaClass extends Model {
	static async getOne(fieldName: string, value: any): Promise<Document> {
		return this.findOne({ [fieldName]: value });
	}

	// parsedQuery: ConvertedQueryParams = {}
	static async getMany(): Promise<Array<Document>> {
		try {

			// const aggregatePipeline = await AggregationPipeelineGenerator(parsedQuery, this.modelName);
			// return aggregatePipeline;

			const contents = await this.find().select('-_id');
			return contents;
		} catch (error) {
			throw new Error(error);
		}
	}

	static async add(row: any): Promise<Document> {
		try {
			row.id = new mongo.ObjectID();
			const newRow: Document = await this.create(row);
			if (!newRow) throw 'Error creating document';
			return newRow.toObject();
		} catch (error) {
			throw new Error(error);
		}
	}

	static async edit(id: string, updatedRow: any): Promise<Document> {
		try {
			const row = await this.findOne({ id }).select('-_id').lean(true);
			if (!row) throw 'Error finding document';

			const findRowAndUpdate: Document = await this.findOneAndUpdate({ id }, updatedRow, { new: true });
			return findRowAndUpdate.toObject();
		} catch (error) {
			throw new Error(error);
		}
	}

	static async bulkAdd(rows: Array<any>, entityName: string): Promise<Array<Document>> {

		try {

			const ids = await Promise.all(
				rows.map(() => nanoid())
			);

			rows.forEach((row: any, index) => {
				row.id = `${entityName.toLowerCase()}-${ids[index]}`;
			});

			const contents: Array<Document> = await this.insertMany(rows);

			if (!contents) throw 'Error bulk creating';
			return contents.map(content => content.toObject());

		} catch (error) {
			throw new Error(error);
		}


	}

	/* static aggregateBuilder(): void {

	} */

}
