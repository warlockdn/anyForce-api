// import * as _ from 'lodash';
// import { Aggregate, Model } from 'mongoose';
// import { FieldType } from '../interfaces/field-types.model';
// import { ConvertedQueryParams, QueryOperators, QueryOperatorsValues, WhereConditions } from '../interfaces/query.model';
// import { EntityModel, EntityClassModel } from '../models/entity';
// import * as dayjs from 'dayjs';
// import * as utc from 'dayjs/plugin/utc';
// dayjs.extend(utc);

// /**
//  * Need to generate a aggregation pipeline
//  * for deep filtering..
//  * This only executes if there is a deep level filtering..
//  * Won't run for single level queries
//  *
//  * There can be 2 base scenarios
//  * 	Either field is {null}
//  * 	Either field has {value}
//  */

// export class ModelAggregatorGenerator {

// 	/** Model name from global.models */
// 	model: string;

// 	/** List of Fields with respective field type */
// 	fields: {
// 		[key: string]: FieldType
// 	};

// 	/**Aggregate Pipeline */
// 	aggregatePipeline: Aggregate<any>;

// 	constructor(model: string) {
// 		this.model = model;
// 	}

// 	private async _getEntityFields (model: string): Promise<{ [key: string]: FieldType }> {

// 		try {
// 			const entityModel = EntityModel as unknown as EntityClassModel;
// 			const fields = await entityModel.getFields(model.toLowerCase());

// 			const fieldList = {};

// 			fields.map(field => {
// 				fieldList[field.name] = field.type;
// 			});

// 			return fieldList;

// 		} catch (error) {
// 			throw new Error(error);
// 		}

// 	}

// 	/**
// 	 * Converts the Field to its original datatype defined in the Entity Schema
// 	 * @param originalType Original datatype stored in the schema
// 	 * @param value Value received from Db..
// 	 */
// 	private _convertFieldType(originalType: FieldType, value: any): string | Date | number {
// 		let convertedFieldType: any = value;

// 		switch (originalType) {
// 		case FieldType.number:
// 			// tslint:disable-next-line: radix
// 			convertedFieldType = parseInt(value);
// 			break;
// 		case FieldType.double:
// 			convertedFieldType = parseFloat(value);
// 			break;
// 		case FieldType.switch:
// 			convertedFieldType = Boolean(value);
// 			break;
// 		case FieldType.currency:
// 			convertedFieldType = parseFloat(value);
// 			break;
// 		case FieldType.date:
// 			dayjs.isDayjs(value) ?
// 				convertedFieldType = value :
// 				convertedFieldType = dayjs.utc().toDate();
// 			break;
// 		default:
// 			break;
// 		}
// 		return convertedFieldType;
// 	}

// 	/**
// 	 * Checks if the operator passed is a Regex type operator
// 	 * @param operator one of QueryOperators..
// 	 */
// 	private _isSearchOperator(operator: QueryOperators): boolean {

// 		return [
// 			QueryOperators.contains,
// 			QueryOperators.ncontains,
// 			QueryOperators.containss,
// 			QueryOperators.ncontainss
// 		].includes(operator) ? true : false;

// 	}

// 	/* private _generateSearchOperatorQuery (operator: QueryOperators, value: string): any {

// 		// eslint-disable-next-line prefer-const
// 		let query = null;

// 		switch (operator) {
// 		case QueryOperators.contains:
// 			query = {
// 				$regex: `${value}`,
// 				$options: 'i'
// 			};
// 			break;
// 		case QueryOperators.containss:
// 			query = {
// 				$regex: `${value}`
// 			};
// 			break;
// 		case QueryOperators.ncontains:
// 			query = {
// 				$not: new RegExp(value, 'i')
// 			};
// 			break;
// 		case QueryOperators.ncontainss:
// 			query = {
// 				$not: new RegExp(value)
// 			};
// 			break;
// 		default:
// 			break;
// 		}

// 		return query;
// 	} */

// 	/**
// 	 * ..
// 	 * @param field key value pairs of fields with respective fieldtype
// 	 * @param operator one of the operators from QueryOperators used by mongo - $eq, $in, etc..
// 	 * @param value ..
// 	 */
// 	private _convertValueArray(field: any, operator: QueryOperators, value: any): void {

// 		// Need to find if the array is a plain array or a array of objects
// 		const isPlainArray = value.findIndex(item => typeof item === 'string') >= 0;

// 		if (isPlainArray && field) {
// 			if (this._isSearchOperator(operator)) {
// 				this.aggregatePipeline.match({
// 					[QueryOperatorsValues[operator]]: (value as Array<any>)
// 						.map(_value => this._convertFieldType(field, _value))
// 				});
// 			} else {
// 				/* return {
// 					[QueryOperatorsValues[operator]]: (value as Array<any>)
// 						.map(_value => this._convertFieldType(field, _value))
// 				}; */
// 			}
// 		} else {
// 			/* return (value as Array<WhereConditions>).map(item => {
// 				return {
// 					[QueryOperatorsValues[operator]]: item.value
// 				};
// 			}); */
// 		}

// 	}

// 	/**
// 	 * Converts the where.values which is an array of {WhereConditions} to aggregate queries
// 	 * @param fields key value pairs of fields with respective fieldtype
// 	 * @param whereList contains list of where conditions
// 	 * @param aggregatePipeline carried pipeline and used to attach dynamic conditions
// 	 */
// 	private _convertWhereArray(fields: any, whereList: Array<WhereConditions>): void {

// 		const match = {};
// 		whereList.forEach(where => {
// 			const operator: QueryOperatorsValues = QueryOperatorsValues[where.operator];
// 			if (operator) {
// 				if (Array.isArray(where.value)) {
// 					match[where.field] = {
// 						[operator]: this._convertValueArray(where.field, where.operator, where.value)
// 					};
// 				} else {
// 					match[where.field] =  {
// 						[operator]: this._convertFieldType(fields[where.field], where.value as FieldType)
// 					};
// 				}
// 			} else {
// 				throw 'Operator not found';
// 			}
// 		});

// 		this.aggregatePipeline.match(match);

// 	}

// 	/**
// 	 * Converts a single WhereCondition to agggregate query
// 	 * @param where contains the where clause
// 	 * @param aggregatePipeline carried pipeline and used to attach dynamic conditions
// 	 */
// 	private _convertWhereObject(where: WhereConditions): void {

// 		if (where?.value && Array.isArray(where.value)) {
// 			this._convertValueArray(where.field, where.operator, where.value);
// 		} else {
// 			this.aggregatePipeline.match({
// 				[QueryOperatorsValues[where.operator]]: this._convertFieldType(this.fields[where.field], where.value)
// 			});
// 		}
// 	}

// 	async AggregationPipelineGenerator(query: ConvertedQueryParams, model: string): Promise<Aggregate<any>> {

// 		try {
// 			if (typeof query !== 'object' || query === null) {
// 				throw `Expected parsed query but received ${typeof query === null ? null : typeof query}`;
// 			}

// 			if (!global.models[model]) {
// 				throw `${model} model doesn't exist`;
// 			}

// 			this.fields = await this._getEntityFields(model);

// 			this.aggregatePipeline = (global.models[model] as Model<any>).aggregate();

// 			if (query.limit && query.limit !== -1) {
// 				this.aggregatePipeline.limit(query.limit);
// 			}

// 			if (query.start) {
// 				this.aggregatePipeline.skip(query.start);
// 			} else {
// 				this.aggregatePipeline.skip(0);
// 			}

// 			if (query?.where) {

// 				// Query can be a object or an Array
// 				if (Array.isArray(query.where)) {
// 					// convertWhereArray(fields, query.where, aggregatePipeline);
// 				} else {
// 					this._convertWhereObject(query.where);
// 				}

// 			}

// 			// Ignore Id
// 			this.aggregatePipeline.project({ _id: 0 });

// 			return await this.aggregatePipeline;

// 		} catch (error) {
// 			throw new Error(error);
// 		}

// 	}

// }

// export default AggregationPipelineGenerator;

