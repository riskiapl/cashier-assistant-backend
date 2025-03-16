const { products } = require('../models');

async function getAllProducts() {
    try {
        const product = await products.findAll();
        return product;
    } catch (error) {
        throw new Error(`Error getting products: ${error.message}`);
    }
}

async function getProductById(id) {
    try {
        const product = await products.findByPk(id);
        return product;
    } catch (error) {
        throw new Error(`Error getting product: ${error.message}`);
    }
}

async function createProduct(productData) {
    try {
        console.log(productData, 'productData');
        const product = await products.create(productData);
        return product;
    } catch (error) {
        throw new Error(`Error creating product: ${error.message}`);
    }
}

async function updateProduct(id, productData) {
    try {
        const product = await products.findByPk(id);
        if (!product) {
            throw new Error('Product not found');
        }
        await product.update(productData);
        return product;
    } catch (error) {
        throw new Error(`Error updating product: ${error.message}`);
    }
}

async function deleteProduct(id) {
    try {
        const product = await products.findByPk(id);
        if (!product) {
            throw new Error('Product not found');
        }
        await product.update({ action_type: 'D' });
        return { message: 'Product soft deleted successfully' };
    } catch (error) {
        throw new Error(`Error deleting product: ${error.message}`);
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
