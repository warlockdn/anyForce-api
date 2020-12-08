export interface Layout {
    name: string,
    label: string,
    actions: Array<LayoutActions>,
    fields: Array<string>,
    disabled: boolean,
    createdDate: Date,
    updatedDate: Date,
    createdBy?: string,
    updatedBy?: string,
}

export interface LayoutActions {
    label: string,
    type: LayoutActionTypes
}

type LayoutActionTypes = 'submit' | 'clear' | 'edit' | 'delete';