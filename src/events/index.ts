import { EntitiesEventManager } from './entities';
import { FieldsEventManager } from './fields';
import { ExpressEventsManager } from './express';

export const AppEvents = {
	entityEvents: new EntitiesEventManager(),
	fieldEvents: new FieldsEventManager(),
	routerEvents: new ExpressEventsManager(null)
};

