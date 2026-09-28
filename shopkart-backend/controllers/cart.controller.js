const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// Add product to cart
const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // 2. Find the product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // 3. Find authenticated customer
        const customer = await Customer.findById(req.customerId);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // 4. Check whether product is already in cart
        const cartItem = customer.cart.find(
            item => item.product.toString() === productId
        );

        let newQuantity;

        if (cartItem) {
            // Product already exists → increase quantity
            newQuantity = cartItem.quantity + 1;
        } else {
            // Product not in cart → start with quantity 1
            newQuantity = 1;
        }

        // 5. Check stock
        if (newQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Requested quantity exceeds available stock"
            });
        }

        // 6. Update cart
        if (cartItem) {
            cartItem.quantity = newQuantity;
        } else {
            customer.cart.push({
                product: productId,
                quantity: 1
            });
        }

        // 7. Save customer
        await customer.save();

        // 8. Populate product information
        await customer.populate({
            path: "cart.product",
            select: "name price image stock"
        });

        // 9. Return updated cart
        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: customer.cart
        });

    } catch (error) {
        console.error("Add to cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.customerId)
            .populate({
                path: "cart.product",
                select: "name price image stock"
            });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            success: true,
            cart: customer.cart
        });

    } catch (error) {
        console.error("Get cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    addToCart, getCart
};