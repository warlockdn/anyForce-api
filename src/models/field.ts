import * as mongoose from 'mongoose';
import { Field } from '../interfaces/field.model';
import { FieldType } from '../interfaces/field-types.model';
import * as pluralize from 'pluralize';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export interface FieldClassModel {
	getOne(name: string): Promise<Field & mongoose.Document>;
	getMany(): Promise<Array<Field & mongoose.Document>>;
	add(field: Array<Field>): Array<Field & mongoose.Document>;
	edit(id: string, field: Field): Promise<Field & mongoose.Document>;
	deleteOneId(id: string, isSoftDelete: boolean): Promise<number>;
}

const picklistOptionsSchema = new mongoose.Schema({
	value: { type: String, required: true },
	label: { type: String, required: true },
	default: Boolean
}, {
	_id: false,
});

const pickListSchema = new mongoose.Schema({
	multiple: { type: Boolean, default: false },
	options: [ picklistOptionsSchema ]
}, {
	_id: false
});

const lookupSchema = new mongoose.Schema({
	name: { type: String, required: true },
	fields: [String]
});

const fieldSchema = new mongoose.Schema<Field>({
	type: { type: String, required: true, enum: Object.values(FieldType) },
	name: { type: String, maxlength: 30, minlength: 3, required: true },
	label: { type: String, maxlength: 30, minlength: 3, required: true },
	pluralLabel: { type: String, required: true },
	placeholder: { type: String, maxlength: 30, minlength: 3 },
	helptext: { type: String, minlength: 10, maxlength: 160 },
	masktext: { type: String, maxlength: 30 },
	disabled: Boolean,
	required: Boolean,
	iseditable: Boolean,
	min: Number,
	max: Number,
	minDate: Date,
	maxDate: Date,
	lookupoptions: {
		type: lookupSchema,
		required: [
			function(): boolean {
				return (this.type === FieldType.lookup || !this.picklistoptions);
			}, 'Field type needs to be Lookup type if lookup options is being passed'
		]
	},
	picklistoptions: {
		type: pickListSchema,
		required: [
			function(): boolean {
				return (this.type === FieldType.picklist || this.lookupoptions);
			}, 'Field type needs to be Picklist type if picklistoptions is being passed'
		]
	},
	createdDate: { type: Date, default: dayjs.utc().toDate() },
	updatedDate: { type: Date, default: dayjs.utc().toDate() }
});

fieldSchema.set('toObject', {
	transform: (_doc: any, ret: any) => {
		ret._id = undefined;
	}
});

fieldSchema.pre('findOneAndUpdate', function(next) {
	const update = this.getUpdate();
	update.updatedDate = dayjs.utc().toDate();
	if (!update.pluralLabel) {
		update.pluralLabel = pluralize.plural(update.name);
	}
	next();
});

// Specifically for __v updates
fieldSchema.pre('findOneAndUpdate', function() {
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

fieldSchema.pre('save', async function(next) {
	if ((this as any).pluralLabel === null) {
		(this as any).pluralLabel = pluralize.plural((this as any).name);
	}

	// Checking if the linked picklist is available as a entity or not.
	if ((this as any).picklistoptions && (this as any).picklistoptions.linkedList) {
		const selectedLinkedList = (this as any).picklistoptions.linkedList;
		const entites: Array<string> = Object.keys(global.models);
		if (!entites.includes(selectedLinkedList)) {
			const error = new Error(`${selectedLinkedList} doesn't exist`);
			next(error);
		}
	}
	next();
});

/* @staticImplements<FieldClassModel>()
export class FieldClass extends mongoose.Model {

	static async getOne(name: string): Promise<Field & mongoose.Document> {
		return this.findOne({ name });
	}

	static async getMany(): Promise<Array<Field & mongoose.Document>> {
		return this.find();
	}

	static add(fields: Array<Field>): Array<Field & mongoose.Document> {
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		return fields.map(field => new FieldModel(field));
	}

	static async edit(id: string, field: Field): Promise<Field & mongoose.Document> {

		const findField = await this.findById(id);

		if (!findField) {
			throw new Error('Not found');
		}

		const editedField = await this.findByIdAndUpdate(id, { $set: field });
		return editedField;
	}

	static async deleteOneId(id: string, isSoftDelete: boolean): Promise<number> {

		if (isSoftDelete) {
			const deleteField = await this.deleteOne({ _id: id });
			return deleteField.deletedCount;
		} else {
			const softDeleteField = await this.findByIdAndUpdate(id, { $set: { delete: true } });
			return softDeleteField;
		}

	}

} */

// Loading the Class with helper methods...
// fieldSchema.loadClass(FieldClass);

// const FieldModel = mongoose.model<Field & FieldClassModel & mongoose.Document>('Field', fieldSchema);

export { fieldSchema };
