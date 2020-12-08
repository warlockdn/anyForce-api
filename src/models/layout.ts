import * as mongoose from 'mongoose';
import { Layout } from '../interfaces/layout.model';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

// /* interface FieldClassModel {
//     getOne(name: string): Promise<Field & mongoose.Document>;
//     getMany(): Promise<Array<Field & mongoose.Document>>;
//     add(field: Field): Promise<Field & mongoose.Document>;
//     edit(id: string, field: Field): Promise<Field & mongoose.Document>;
//     deleteOneId(id: string, isSoftDelete: boolean): Promise<number>;
// } */

const layoutSchema = new mongoose.Schema<Layout>({
	name: { type: String, maxlength: 30, minlength: 3, required: true, unique: true },
	label: { type: String, maxlength: 30, minlength: 3, required: true },
	actions: [],
	fields: [ String ],
	disabled: Boolean,
	createdDate: { type: Date, default: dayjs.utc().toDate() },
	updatedDate: { type: Date, default: dayjs.utc().toDate() },
	createdBy: { type: String, required: true },
	updatedBy: { type: String, required: true }
});

/* function staticImplements<T>() {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    return <U extends T>(constructor: U) => {constructor};
}

@staticImplements<FieldClassModel>()
class FieldClass extends mongoose.Model {

    static async getOne(name: string): Promise<Field & mongoose.Document> {
        return await this.findById(name);
    }

    static async getMany(): Promise<Array<Field & mongoose.Document>> {
        return await this.find()
    }

    static async add(field: Field): Promise<Field & mongoose.Document> {
        return this.create(field);
    }

    static async edit(id: string, field: Field): Promise<Field & mongoose.Document> {

        const findField = await this.findById(id);

        if (!findField) {
            throw new Error('Not found');
        }

        const editedField = await this.findByIdAndUpdate(id, { $set: field });
        return editedField;
    }

    static async deleteOneId(id: string, isSoftDelete: boolean): Promise<number> {

        if (isSoftDelete) {
            const deleteField = await this.deleteOne({ _id: id });
            return deleteField.deletedCount;
        } else {
            const softDeleteField = await this.findByIdAndUpdate(id, { $set: { delete: true } })
            return softDeleteField;
        }

    }

} */

// // Loading the Class with helper methods...
// fieldSchema.loadClass(FieldClass);

const LayoutModel = mongoose.model<Layout & mongoose.Document>('Layout', layoutSchema);

export { layoutSchema, LayoutModel };
