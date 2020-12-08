import { FieldType } from './field-types.model';

export interface FieldIn {
	type: FieldType;
	name: string;
	label: string;
	pluralLabel: string;
	placeholder: string;
	helptext: string;
	masktext: string;
	disabled: boolean;
	required: boolean;
	iseditable: boolean;
	createdDate: Date;
	updatedDate: Date;
	picklistoptions: PickListOptions;
}

export interface TextField {
	min: number;
	max: number;
}

export interface DateField {
	minDate: Date;
	maxDate: Date;
}

export interface PickListOptions {
	multiple: boolean;
	options: [{
		value: string,
		label: string,
		default?: boolean
	}];
	linkedList: string;
}

export type Field = FieldIn & TextField & DateField;
