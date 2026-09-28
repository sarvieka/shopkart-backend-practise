const express = require("express");

const {
    addToCart, getCart
} = require("../controllers/cart.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/:productId", authMiddleware, addToCart);
router.get("/", authMiddleware, getCart);

module.exports = router;