import { Description } from 'joi';

export interface RequestSchema {
	get?: Description;
	post?: Description;
	patch?: Description;
	delete?: Description;
}
