import * as mongoose from 'mongoose';
import { Entity } from '../interfaces/entity.model';
import { fieldSchema } from './field';
import { staticImplements } from '../utils/staticImplements';
import { Field } from '../interfaces/field.model';
import { AppEvents } from '../events';
import { customAlphabet } from 'nanoid/async';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as pluralize from 'pluralize';
dayjs.extend(utc);

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 15);

export interface EntityClassModel {
	getOne(name: string): Promise<Entity & mongoose.Document>;
	getMany(): Promise<Array<Entity & mongoose.Document>>;
	add(entity: Entity): Promise<Entity & mongoose.Document>;
	edit(id: string, entity: Entity): Promise<Entity & mongoose.Document>;
	deleteOneEntity(name: string, isSoftDelete: boolean): Promise<number>;
	getFields(name: string): Promise<Array<Field & mongoose.Document>>;
	addFields(name: string, fields: Array<Field>): Promise<Entity & mongoose.Document>;
	findField(name: string, fieldName: string): Promise<Field>;
	updateField(name: string, _fieldName: string, updatedField: Field): Promise<Entity & mongoose.Document>;
	deleteField(name: string, fieldName: string): Promise<any>;
}

const entitySchema = new mongoose.Schema<Entity>({
	id: { type: 'string', required: true, index: true },
	name: { type: String, required: true, unique: true, minlength: 3, maxlength: 20 },
	description: { type: String, minlength: 10, maxlength: 250 },
	label: { type: String, minlength: 3, maxlength: 30, required: true },
	pluralLabel: { type: String, minlength: 3, maxlength: 40 },
	createdDate: { type: Date, default: dayjs.utc().toDate() },
	updatedDate: { type: Date, default: dayjs.utc().toDate() },
	allowSearch: { type: Boolean, default: true },
	delete: Boolean,
	published: { type: Boolean, default: false },
	fields: [ fieldSchema ],
});

entitySchema.set('toJSON', {
	transform: (_doc: any, ret: any) => {
		ret._id = undefined;
	}
});

/* entitySchema.set('toObject', {
	transform: (_doc: any, ret: any) => {
		ret._id = undefined;
	}
}); */

entitySchema.pre('save', async function() {
	if (this.id === null) {
		this.id = await nanoid();
	}
});

entitySchema.pre('findOneAndUpdate', function(next) {
	const update = this.getUpdate();
	update.updatedDate = dayjs.utc().toDate();
	next();
});

entitySchema.pre('findOneAndUpdate', function(next) {
	const update = this.getUpdate();
	if (update.$push && update.$push.fields) {
		const fields: Array<Field> = update.$push.fields;
		fields
			.filter(field => !field.pluralLabel)
			.forEach(field => {
				field.pluralLabel = pluralize.plural(field.label);
			});

		// Checking if the linked picklist is available as a entity or not.
		fields
			.forEach(field => {
				if (field.picklistoptions && field.picklistoptions.linkedList) {
					const selectedLinkedList = field.picklistoptions.linkedList;
					const entites: Array<string> = Object.keys(global.models);
					if (!entites.includes(selectedLinkedList)) {
						const error = new Error(`${selectedLinkedList} doesn't exist`);
						next(error);
					}
					field.picklistoptions.options = undefined;
				}
			});

		const allCannotExistAtOnce = fields.find(field => (
			field.picklistoptions &&
			Array.isArray(field.picklistoptions.options) &&
			field.picklistoptions.options.length > 0 &&
			field.picklistoptions.linkedList
		));

		if (allCannotExistAtOnce) {
			const error = new Error(`Validation failed. ${allCannotExistAtOnce.name} field contains both picklist options and linkedList`);
			next(error);
		}
	}
	next();
});

// Specifically for __v updates
entitySchema.pre('findOneAndUpdate', function() {
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

@staticImplements<EntityClassModel>()
class EntityClass extends mongoose.Model {

	static async getOne(name: string): Promise<Entity & mongoose.Document> {
		try {
			const entity = await this.findOne({ name });
			if (!entity) throw 'Entity not found';
			return entity;
		} catch (error) {
			throw new Error(error);
		}
	}

	static async getMany(): Promise<Array<Entity & mongoose.Document>> {
		return await this.find().select('-_id');
	}

	static async add(entity: Entity): Promise<Entity & mongoose.Document> {
		// Fields isn't required while creating a new Entity.
		// Since it will be manually added.
		if (entity && entity.fields) {
			entity.fields = undefined;
		}

		// Can be only published on edit..
		// Since fields are not added yet.
		if (entity && entity.published) {
			entity.published = false;
		}

		try {

			entity.id = await nanoid();

			const newEntity: Entity & mongoose.Document = await this.create(entity);
			if (!newEntity) throw 'Error creating entity';

			// Process new Entity - ADD event
			AppEvents.entityEvents.add(newEntity.toObject());

			return newEntity;
		} catch (error) {
			throw new Error(error);
		}

	}

	static async edit(name: string, updatedData: Entity): Promise<Entity & mongoose.Document> {

		try {
			const entity: Entity & mongoose.Document = await this.findOne({ name });
			if (!entity) throw 'Entity not found';

			if (updatedData.fields) delete updatedData.fields;

			// Checking for publish,
			// if yes then one of the field should be required..
			if (updatedData.published) {
				const fields = (entity.toJSON() as Entity).fields;
				const isRequiredFieldIndex = fields.findIndex(field => field.required);
				if (isRequiredFieldIndex === -1) {
					throw 'One or more fields is supposed to be a required field';
				}
			}

			const updatedEntity = await this.findOneAndUpdate({ name }, updatedData, { new: true });

			// Process edit Entity - EDIT event
			AppEvents.entityEvents.edit(updatedEntity.toObject());

			return updatedEntity;

		} catch (error) {
			throw new Error(error);
		}
	}

	static async deleteOneEntity(name: string, isSoftDelete: boolean): Promise<number> {

		try {
			const entity = await this.findOne({ name });
			if (!entity) throw 'Entity not found';

			if (isSoftDelete) {
				await this.findOneAndUpdate({ name }, { $set: { delete: true } });

				// Process edit Entity - EDIT event
				AppEvents.entityEvents.delete(name, isSoftDelete);

				return 1;
			} else {
				const deleteEntity = await this.deleteOne({ name });
				return deleteEntity.deletedCount;
			}
		} catch (error) {
			throw new Error(error);
		}

	}

	// Fields Related Functions ----- Start

	static async addFields(name: string, newFields: Array<Field>): Promise<Entity & mongoose.Document> {
		try {
			let entity: Entity & mongoose.Document = await this.getOne(name);
			if (!entity) throw 'Entity not found';

			entity = entity.toJSON();

			/* Checking field names in itself for duplicates */
			const newFieldsNames = [... new Set(newFields.map(field => field.name))];
			if (newFieldsNames.length !== newFields.length) {
				throw new Error('One or more fields have same name identifiers');
			}

			/* Checking duplicates in Existing entity fields */
			const existingFieldNames = Array.isArray(entity.fields) ? entity.fields.map(field => field.name) : [];
			for (const field of newFields) {
				if (existingFieldNames.includes(field.name)) {
					throw new Error('One or more fields have same name identifiers');
				}
			}

			const updateQuery = await this.findOneAndUpdate({ name }, {
				$push: {
					fields: newFields as never
				}
			});

			if (!updateQuery) throw 'Error updating';

			AppEvents.fieldEvents.addField(name, newFields);

			return updateQuery;

		} catch (error) {
			throw new Error(error);
		}
	}

	static async getFields(name: string): Promise<Array<Field & mongoose.Document>> {
		try {
			const entity: Entity & mongoose.Document = await this.findOne({ name });
			if (!entity) throw 'Entity name not found';
			return entity.toJSON().fields;
		} catch (error) {
			throw new Error(error);
		}
	}

	static async findField(name: string, fieldName: string): Promise<Field> {
		try {
			const entity: Entity & mongoose.Document = await this.findOne({ name, 'fields.name': { $eq: fieldName } });
			if (!entity || (entity.fields && entity.fields.length === 0)) throw new Error('Entity or field name not found');
			return entity.fields[0];
		} catch (error) {
			throw new Error(error);
		}
	}

	static async updateField(name: string, fieldName: string, updatedField: Field): Promise<Entity & mongoose.Document> {
		try {
			const entity: Entity & mongoose.Document = await this.findOne({ name, 'fields.name': { $eq: fieldName } });
			if (!entity) throw 'Entity or Field name not valid';

			const mergedField = (entity.toJSON() as Entity).fields.find(field => field.name === fieldName);

			delete updatedField.name;
			delete updatedField.createdDate;
			updatedField.updatedDate = dayjs.utc().toDate();

			const updateFieldQuery = await this.findOneAndUpdate({ name, 'fields.name': { $eq: fieldName } }, {
				$set: {
					'fields.$': Object.assign(mergedField, updatedField)
				}
			});

			AppEvents.fieldEvents.updateField(name, fieldName, updatedField);

			return updateFieldQuery;
		} catch (error) {
			throw new Error(error);
		}
	}

	static async deleteField(name: string, fieldName: string): Promise<any> {
		try {
			const entity: Entity & mongoose.Document = await this.findOne({ name, 'fields.name': { $eq: fieldName } });
			if (!entity) throw 'Entity or Field name not valid';

			const deleteQuery = await this.updateOne({ name, 'fields.name': { $eq: fieldName } }, {
				$pull: { fields: { name: fieldName as never } as never }
			});

			AppEvents.fieldEvents.deleteField(name, fieldName);

			return deleteQuery;

		} catch (error) {
			throw new Error(error);
		}
	}

}

// Loading the Class with helper methods...
entitySchema.loadClass(EntityClass);

const EntityModel = mongoose.model<Entity & EntityClassModel & mongoose.Document>('Entity', entitySchema);

export { EntityModel };
