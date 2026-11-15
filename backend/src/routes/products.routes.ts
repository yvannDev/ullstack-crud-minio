import { Router } from 'express';
import * as controller from '../controllers/products.controller';
import { uploadImage } from '../middlewares/upload';

const router = Router();
router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', uploadImage.single('image'), controller.create);
router.put('/:id', uploadImage.single('image'), controller.update);
router.delete('/:id', controller.remove);
export default router;
