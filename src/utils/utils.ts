import * as Joi from 'joi';

export const contentSchemaValidator = async (content: string, method: string, data: any): Promise<boolean> => {
	try {
		const description: Joi.Description = global.validator[content][method.toLowerCase()];
		const schema = Joi.build(description);
		await schema.validateAsync(data);
		return true;
	} catch (error) {
		throw new Error(error.message);
	}
};

export const capitalizeString = (word: string): string => {
	return word.replace(/^\w/, (c) => c.toUpperCase());
};

