export enum QueryOperators {
	eq = 'eq',
	ne = 'ne',
	in = 'in',
	nin = 'nin',
	contains = 'contains',
	ncontains = 'ncontains',
	containss = 'containss',
	ncontainss = 'ncontainss',
	lt = 'lt',
	lte = 'lte',
	gt = 'gt',
	gte = 'gte',
	null = 'null'
}

export enum QueryOperatorsValues {
	eq = '$eq',
	ne = '$ne',
	in = '$in',
	nin = '$nin',
	contains = 'contains',
	ncontains = 'ncontains',
	containss = 'containss',
	ncontainss = 'ncontainss',
	lt = '$lt',
	lte = '$lte',
	gt = '$gt',
	gte = '$gte',
	null = 'null',
}

export const ConditionalOperators = [
	'and',
	'or'
];

export enum ConditionalOperatorsValues {
	and = 'and',
	or = 'or'
}

export interface DefaultQueryParams {
	start?: number;
	limit?: number;
}

export interface ConvertedQueryParams extends DefaultQueryParams {
	where?: Array<WhereConditions>;
}

export interface WhereConditions {
	field: string;
	operator: QueryOperators;
	value: Array<WhereConditions> | Array<string> | string | number | Date;
}
