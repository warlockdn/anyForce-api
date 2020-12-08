
export enum ComparisionOperator {
	'greater than' = '>',
	'greater than equals' = '>==',
	'less than' = '<',
	'less than equals' = '<==',
	'equals' = '===',
	'not equals' = '!==',
	'contains' = '',
	'starts with' = '',
	'ends with' = '',
	'and' = '&&',
	'or' = '||',
	'not' = '!'
}

export enum LogicalOperator {
	'and' = '&&',
	'or' = '||',
	'not' = '!'
}

export interface Validation {
	operator: string;
	field: string;
	value: number;
	message?: string;
	transform?: Array<TransformDocument>;
	children?: Array<ChildValidation>;
}

export interface ChildValidation {
	multiple: boolean;
	message?: string;
	operator: ComparisionOperator;
	conditions: Array<Validation>;
	transform?: Array<TransformDocument>;
}

export interface TransformDocument {
	name: string;
	value: string;
}


