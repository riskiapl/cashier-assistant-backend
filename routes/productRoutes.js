const express = require('express');
const {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
// const { checkProductStatus } = require('../middlewares/productMiddleware');

const router = express.Router();

router.post('/', createProduct);
router.get('/view', getAllProducts);
router.get('/view/:id', getProduct);
router.put('/update/:id', updateProduct);
router.delete('/delete/:id', deleteProduct);

module.exports = router;