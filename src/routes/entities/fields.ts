import { Router } from 'express';
import { FieldController } from '../../controller/fieldController';
import { FieldsValidator } from './../../validators/fieldsValidator';

const FieldRoute: Router = Router({ mergeParams: true });

FieldRoute
	.get('/', FieldsValidator.getFieldValidate, FieldController.getFields)
	.post('/', FieldsValidator.postFieldValidate, FieldController.saveFields)
	.route('/:fieldName')
	.get(FieldsValidator.getFieldValidate, FieldController.getFields)
	.patch(FieldsValidator.patchFieldValidate, FieldController.updateFields)
	.delete(FieldController.deleteFields);

// FieldRoute.route('/fields/:fieldName')

export default FieldRoute;
