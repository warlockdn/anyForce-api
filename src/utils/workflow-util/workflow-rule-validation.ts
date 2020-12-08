import { NodeVM } from 'vm2';
import { ComparisionOperator, Validation, ChildValidation } from '../../interfaces/operators.model';

// doc - {a,s,d,a}
// (doc[x.field] && (doc[x.field] === x.value)) {
// if (doc[x.field] === x.value && doc[x.field] !== x.value) {

// }
/*
	message = '';
	(doc[x.field]) ?
		doc[x.field] === x.value ?
			doc[x.field] === x.value && doc[x.field] !== x.value ?
				message = x.message
				: true
		: true
} */

export class WorkFlowRuleValidation {

	rules: Array<Validation>;
	document: {
		[key: string]: any
	};

	constructor(rules: Array<Validation>, document: any) {
		this.rules = rules;
		this.document = document;
	}

	/**
	 * Iterate through each rule parent or child and returns the calculated logical string
	 * @param rules contains all the rules
	 * @param isChild tells the function the rule is a child
	 */
	parseRules(rules: Array<Validation> | Array<ChildValidation>, isChild = false): string {
		try {
			let dynamicLogic = '';
			if (!isChild) { // Running Parent Validation
				(rules as Array<Validation>).forEach(rule => {
					dynamicLogic += this._generateValidationLogic(rule);
				});
			} else { // Running child validation
				(rules as Array<ChildValidation>).forEach(rule => {
					dynamicLogic += this._generateValidationForChild(rule);
				});
			}
			return dynamicLogic.replace(/^\s+|\s+$/gm, '').split('\n').join('');
		} catch (error) {
			throw new Error(error);
		}
	}

	/**
	 * Execute the script in VM and return true or error message
	 * @param script generated script..
	 */
	async execScript(script: string): Promise<any> {
		return new Promise((resolve, reject) => {
			try {
				const vm = new NodeVM({
					console: 'inherit',
					require: {
						external: true
					}
				});
				const functionInSandbox = vm.run(`
					const dayjs = require('dayjs');
					module.exports = function(callback) {
						try {
							callback(${script});
						} catch(err) {
							callback(err);
						}
					}`, './../../modules.js'
				);
				functionInSandbox(response => {
					typeof response === 'boolean' ?
						resolve(response) :
						reject(response);
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	private _generateValidationLogic(rule: Validation): string {
		try {
			// (document[rule.field] ('===' '>' '<') rule.value)
			const logicString = `
				${this._getDataType(this.document[rule.field])} ?
					${this._getDataType(this.document[rule.field])} ${ComparisionOperator[rule.operator]} ${this._getDataType(rule.value)} ?
						${rule.children ? this.parseRules(rule.children, true) : this._decideReturnMessage(rule.message)}
						: true
					: true
			`;
			return logicString;
		} catch (error) {
			throw new Error(error);
		}
	}

	private _generateValidationForChild(rule: ChildValidation): string {
		try {
			let logicString = '';
			if (rule.multiple) {
				logicString += `
					${this._generateMultipleSingleLineCondition(rule.conditions, rule.operator)} ?
						${this._decideReturnMessage(rule.message)}
						: true
				`;
			}
			return logicString;
		} catch (error) {
			throw new Error(error);
		}
	}

	private _generateMultipleSingleLineCondition(rules: Array<Validation>, parentOperator: ComparisionOperator): string {
		let multipleLogicString = '(';
		const lastIndex = rules.length - 1;
		// tslint:disable-next-line: no-shadowed-variable
		rules.forEach((rule, index) => {
			const isLastIndex = lastIndex === index;
			multipleLogicString += `
				(
					(${this._getDataType(this.document[rule.field])}) &&
					(${this._getDataType(this.document[rule.field])} ${ComparisionOperator[rule.operator]} ${this._getDataType(rule.value)})
				) ${isLastIndex ? '' : ComparisionOperator[parentOperator]}`;
		});
		multipleLogicString += ')';
		return multipleLogicString;
	}

	/**
	 * Decides how to treat a given value
	 * @param value can be a string, boolean or number
	 */
	private _getDataType(value: any): any {
		let response = '';
		switch (typeof value) {
		case 'string':
			response = `'${value}'`;
			break;
		case 'number':
			response = `${+value}`;
			break;
		case 'boolean':
			response = `${value}`;
			break;
		case 'object':
			break;
		default:
			response = '';
			break;
		}
		return response;
	}

	private _decideReturnMessage(message): string {
		return message ? `'${message}'` : `'One or more validation failed'`;
	}

}
