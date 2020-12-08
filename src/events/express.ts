import { EventEmitter } from 'events';
import { Express } from 'express';
import { Entity } from '../interfaces/entity.model';
import { EntityModel } from '../models/entity';
import { ContentRoute } from '../routes/content';

export class ExpressEventsManager extends EventEmitter {

	server: Express;

	constructor(server: Express) {
		super();
		this.server = server;
		this._initEvents();
	}

	private _initEvents(): void {
		this._addRoute();
	}

	addRoute(route: string): void {
		this.emit('addRoute', route);
	}

	private _addRoute(): void {
		this.on('addRoute', async(route: string) => {
			console.log('Adding/Updating new route -> ', route);

			const entity: Entity = await (await EntityModel.findOne({ name: route })).toJSON();

			// Checking if the route has already been generated..
			if (global.models[name]) {
				// No need to generate new route just update the middleware schema..
				const middlewares = await new ContentRoute().generateMiddleware(entity.name, entity.fields);
				global.validator[name] = middlewares;
			} else {
				// Since a new entity is added generate routes and middlwares
				new ContentRoute().processEntityGeneration(entity);
			}

			console.log('Added/Updated new route -> ', entity.name);

		});
	}

}
