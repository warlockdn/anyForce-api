import { Router } from "express";

const LayoutRouter: Router = Router({ mergeParams: true });

LayoutRouter
    .route('/')
    .get()
    
LayoutRouter
    .get('/:layoutId')
    .post('/:layoutId')
    .delete('/:layoutId')

export default LayoutRouter;