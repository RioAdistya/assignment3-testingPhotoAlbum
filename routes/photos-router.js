const router = require('express').Router();
const authenticationMiddleware = require('../middlewares/authentication-middleware');
const PhotosController = require('../controllers/photos-controller');

router.use(authenticationMiddleware);
router.get('/', PhotosController.findAll);
router.get('/:id', PhotosController.findById);
router.post('/', PhotosController.create);
router.delete('/:id', PhotosController.delete);
router.put('/:id', PhotosController.update);

module.exports = router;
