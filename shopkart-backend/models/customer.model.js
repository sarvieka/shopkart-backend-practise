const mongoose = require("mongoose");


// schema: what the document (collection) will look like in Database
const customerSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        wishlist: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product"
                }
            ],
            default: []
        }
    },
    {
        timestamps: true
    }
);

// model: what the collection will be called in DB
const Customer = mongoose.model("Customer", customerSchema);


// It is part of CommonJS, Node.js's default module system, exports Customer (class, variable, function) so that other files in the application can export it
module.exports = Customer;