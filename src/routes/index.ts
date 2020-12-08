import { EntitiesRoute } from './entities';
import { SetupRoute } from './setup';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const routes: Array<any> = [
	new EntitiesRoute(),
	new SetupRoute()
];
