const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// Add product to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // Validate product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // Find the product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Find authenticated customer
        const customer = await Customer.findById(req.customerId);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // Check for duplicate
        const alreadyExists = customer.wishlist.some(
            id => id.toString() === productId
        );

        if (alreadyExists) {
            return res.status(409).json({
                success: false,
                message: "Product already in wishlist"
            });
        }

        // Add product reference
        customer.wishlist.push(productId);

        // Save updated customer
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist"
        });

    } catch (error) {
        console.error("Add to wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get current user's wishlist
const getWishlist = async (req, res) => {
    try {
        const customer = await Customer.findById(req.customerId)
            .populate({
                path: "wishlist",
                select: "name price category image stock"
            });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            success: true,
            count: customer.wishlist.length,
            wishlist: customer.wishlist
        });

    } catch (error) {
        console.error("Get wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // Validate product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // Find authenticated customer
        const customer = await Customer.findById(req.customerId);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // Check whether product exists in wishlist
        const productIndex = customer.wishlist.findIndex(
            id => id.toString() === productId
        );

        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not in wishlist"
            });
        }

        // Remove product reference
        customer.wishlist.splice(productIndex, 1);

        // Save updated customer
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        });

    } catch (error) {
        console.error("Remove from wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist
};