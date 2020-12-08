import * as mongoose from 'mongoose';
import { Field } from './field.model';

export interface EntityClassModel {
	getOne(name: string): Promise<Entity & mongoose.Document>;
	getMany(): Promise<Array<Entity & mongoose.Document>>;
	add(entity: Entity): Promise<Entity & mongoose.Document>;
	edit(id: string, entity: Entity): Promise<Entity & mongoose.Document>;
	deleteOneId(id: string, isSoftDelete: boolean): Promise<number>;
}

export interface Entity {
	id?: string;
	name: string;
	label: string;
	pluralLabel?: string;
	description?: string;
	createdDate?: Date;
	updatedDate?: Date;
	allowSearch?: boolean;
	published?: boolean;
	fields: Array<Field>;
}
