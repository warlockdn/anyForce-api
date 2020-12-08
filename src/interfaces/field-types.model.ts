import { Schema } from 'mongoose';

export enum FieldType {
	text = 'text',
	date = 'date',
	daterange = 'daterange',
	number = 'number',
	double = 'double',
	currency = 'currency',
	picklist = 'picklist',
	textarea = 'textarea',
	specialtext = 'specialtext',
	file = 'file',
	switch = 'switch',
	phone = 'phone',
	email = 'email',
	lookup = 'lookup'
}

// Email Pattern
// tslint:disable-next-line: max-line-length
// /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const FieldTypeConstructor = {
	text: Schema.Types.String,
	date: Schema.Types.Date,
	daterange: Schema.Types.Date,
	number: Schema.Types.Number,
	double: Schema.Types.Number,
	currency: Schema.Types.Number,
	textarea: Schema.Types.String,
	specialtext: Schema.Types.String,
	file: Schema.Types.String,
	switch: Schema.Types.Boolean,
	picklist: Schema.Types.Mixed,
	lookup: Schema.Types.Mixed
};

export const FieldTypeForMongoose = {
	text: String,
	date: Date,
	daterange: Date,
	number: Number,
	double: Number,
	currency: Number,
	textarea: String,
	specialtext: String,
	file: String,
	switch: Boolean,
	picklist: String,
	lookup: String
};

