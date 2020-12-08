import Joi from 'joi';

export const joiErrorExtract = (error: Joi.ValidationError): Array<string> | any => {
	return (error && error.details) ? error.details.map(item => {
		return {
			key: item.context.key,
			message: item.message
		};
	}) : error;
};

