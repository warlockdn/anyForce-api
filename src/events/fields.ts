import { EventEmitter } from 'events';
import { Field } from '../interfaces/field.model';
import { EntityModel, EntityClassModel } from '../models/entity';
import { Entity } from '../interfaces/entity.model';
import { AppEvents } from '.';
import * as mongoose from 'mongoose';

export class FieldsEventManager extends EventEmitter {

	constructor() {
		super();
		this.initEvents();
	}

	private initEvents(): void {
		this._addField();
		this._updateField();
		this._deleteField();
	}

	addField(entityName: string, newFields: Array<Field>): void {
		this.emit('addField', entityName, newFields);
	}

	updateField(name: string, fieldName: string, updatedField: Field): void {
		this.emit('updateField', name, fieldName, updatedField);
	}

	deleteField(name: string, fieldName: string): void {
		this.emit('deleteField', name, fieldName);
	}

	private _addField(): void {
		this.on('addField', async (entityName: string, newFields: Array<Field>) => {
			console.log('Processing Event -> Entity:AddField', entityName, newFields);

			try {
				const entityModel = EntityModel as unknown as EntityClassModel;
				const entity: Entity = await (await entityModel.getOne(entityName)).toJSON();

				const modelName = entity.name.substr(0, 1).toUpperCase() + entity.name.substr(1, entity.name.length).toLowerCase();

				const routeExist = mongoose.connection.models[modelName] ? true : false;

				// If model exists then delete model since we are updating the model.
				if (routeExist) {
					delete mongoose.connection.models[modelName];
					delete global.models[modelName];
				}

				// Add or update the route
				AppEvents.routerEvents.addRoute(entity.name);

			} catch (error) {
				console.log(error);
			}

		});
	}

	private _updateField(): void {
		this.on('updateField', (name: string, fieldName: string, updatedField: Field) => {
			console.log('Processing Event -> Entity:UpdateField', name, fieldName, updatedField);
		});
	}

	private _deleteField(): void {
		this.on('deleteField', (name: string, fieldName: string) => {
			console.log('Processing Event -> Entity:DeleteField', name, fieldName);
		});
	}

}
