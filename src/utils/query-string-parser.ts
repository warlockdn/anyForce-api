/* eslint-disable @typescript-eslint/no-use-before-define */
import * as _ from 'lodash';
import { ConvertedQueryParams, DefaultQueryParams, WhereConditions } from '../interfaces/query.model';

/**
 * Courtesy Strapi..
 * Converts the standard REST query params to a moe usable format for querying
 */

/**
 * Global converter
 * @param params takes in params from Get request..
 * @param defaults Defaults
 */
const parseQueryString = (params: any = {}, defaults: DefaultQueryParams = {}): ConvertedQueryParams => {
	if (typeof params !== 'object' || params === null) {
		throw new Error(
			`convertRestQueryParams expected an object got ${params === null ? 'null' : typeof params}`
		);
	}

	let finalParams: DefaultQueryParams = Object.assign({
		start: 0,
		limit: 100
	}, defaults);

	if (Object.keys(params).length === 0) {
		return finalParams;
	}

	if (_.has(params, '_sort')) {
		finalParams = Object.assign(finalParams, convertSortQueryParams(params._sort));
	}

	if (_.has(params, '_start')) {
		finalParams = Object.assign(finalParams, convertStartQueryParams(params._start));
	}

	if (_.has(params, '_limit')) {
		finalParams = Object.assign(finalParams, convertLimitQueryParams(params._limit));
	}

	const whereParams = _.omit(params, ['_sort', '_start', '_limit', '_where']);
	const whereClauses: Array<WhereConditions> = [];

	if (_.keys(whereParams).length > 0) {
		whereClauses.push(...convertWhereParams(whereParams));
	}

	if (_.has(params, '_where')) {
		whereClauses.push(...convertWhereParams(params._where));
	}

	Object.assign(finalParams, {
		where: whereClauses
	});

	return finalParams;
};

/**
 * Sort query parser
 * @param sortQuery - ex: id:asc,price:desc
 */
const convertSortQueryParams = (sortQuery: string): any => {
	if (typeof sortQuery !== 'string') {
		throw new Error(`convertSortQueryParams expected a string, got ${typeof sortQuery}`);
	}

	const sortKeys = [];

	sortQuery.split(',').forEach(part => {
		// split field and order param with default order to ascending
		const [field, order = 'asc'] = part.split(':');

		if (field.length === 0) {
			throw new Error('Field cannot be empty');
		}

		if (!['asc', 'desc'].includes(order.toLocaleLowerCase())) {
			throw new Error('order can only be one of asc|desc|ASC|DESC');
		}

		sortKeys.push({
			field,
			order: order.toLowerCase()
		});
	});

	return {
		sort: sortKeys,
	};
};

/**
 * Start query parser
 * @param startQuery - ex: id:asc,price:desc
 */
const convertStartQueryParams = (startQuery: any): any => {
	const startAsANumber = _.toNumber(startQuery);

	if (!_.isInteger(startAsANumber) || startAsANumber < 0) {
		throw new Error(`convertStartQueryParams expected a positive integer got ${startAsANumber}`);
	}

	return {
		start: startAsANumber,
	};
};

/**
 * Limit query parser
 * @param limitQuery - ex: id:asc,price:desc
 */
const convertLimitQueryParams = (limitQuery: any): any => {
	const limitAsANumber = _.toNumber(limitQuery);

	if (!_.isInteger(limitAsANumber) || (limitAsANumber !== -1 && limitAsANumber < 0)) {
		throw new Error(`convertLimitQueryParams expected a positive integer got ${limitAsANumber}`);
	}

	return {
		limit: limitAsANumber,
	};
};

// List of all the possible filters
const VALID_REST_OPERATORS = [
	'eq',
	'ne',
	'in',
	'nin',
	'contains',
	'ncontains',
	'containss',
	'ncontainss',
	'lt',
	'lte',
	'gt',
	'gte',
	'null',
];

const BOOLEAN_OPERATORS = ['or'];

/**
 * Parse where params
 */
const convertWhereParams = (whereParams: object | Array<any>): Array<WhereConditions> => {
	const finalWhere: Array<WhereConditions> = [];

	if (Array.isArray(whereParams)) {
		return whereParams.reduce((acc, whereParam) => {
			return acc.concat(convertWhereParams(whereParam));
		}, []);
	}

	Object.keys(whereParams).forEach(whereClause => {
		const {
			field,
			operator = 'eq',
			value
		} = convertWhereClause(
			whereClause,
			whereParams[whereClause]
		);

		finalWhere.push({
			field,
			operator,
			value,
		});
	});

	return finalWhere;
};

/**
 * Parse single where param
 * @param whereClause - Any possible where clause e.g: id_ne text_ncontains
 * @param value - the value of the where clause e.g id_ne=value
 */
const convertWhereClause = (whereClause: any, value: any): any => {
	const separatorIndex = whereClause.lastIndexOf('_');

	// eq operator
	if (separatorIndex === -1) {
		return {
			field: whereClause,
			value
		};
	}

	// split field and operator
	const field = whereClause.substring(0, separatorIndex);
	const operator = whereClause.slice(separatorIndex + 1);

	if (BOOLEAN_OPERATORS.includes(operator) && field === '') {
		return {
			field: null,
			operator,
			value: [].concat(value).map(convertWhereParams)
		};
	}

	// the field as underscores
	if (!VALID_REST_OPERATORS.includes(operator)) {
		return {
			field: whereClause,
			value
		};
	}

	return {
		field,
		operator,
		value
	};
};

export default parseQueryString;
