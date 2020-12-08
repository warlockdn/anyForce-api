import { EventEmitter } from 'events';
import { Entity } from '../interfaces/entity.model';

export class EntitiesEventManager extends EventEmitter {

	constructor() {
		super();
		this.initEvents();
	}

	private initEvents(): void {
		this._addEvent();
		this._editEvent();
		this._deleteEvent();
	}

	add(entity: Entity): void {
		this.emit('add', entity);
	}

	edit(entity: Entity): void {
		this.emit('edit', entity);
	}

	delete(entityName: string, isSoftDelete: boolean): void {
		this.emit('delete', entityName, isSoftDelete);
	}

	private _addEvent(): void {
		this.on('add', (entity: Entity) => {
			console.log('Processing Event -> Entity:Add', entity);
		});
	}

	private _editEvent(): void {
		this.on('edit', (entity: Entity) => {
			console.log('Processing Event -> Entity:Edit', entity);
		});
	}

	private _deleteEvent(): void {
		this.on('delete', (entityName: string, isSoftDelete: boolean) => {
			console.log('Processing Event -> Entity:Edit', entityName, isSoftDelete);
		});
	}

}
