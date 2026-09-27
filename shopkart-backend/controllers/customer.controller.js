// first step: imports
const Customer = require("../models/customer.model");
const bcrypt = require("bcrypt");
// JWT is used for generating and verifying JSON Web Tokens, which are used for authentication and authorization in web applications. It allows you to securely transmit information between parties as a JSON object. In this code, it is imported but not yet used, but it will likely be used later for generating tokens upon successful registration or login of customers.
const jwt = require("jsonwebtoken");


// async as we re doing DB operations which are asynchronous in nature, we need to use async/await to handle them properly
const registerCustomer = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;

        // Validate input
        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Check for duplicate email
        const existingCustomer = await Customer.findOne({ email });

        if (existingCustomer) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create customer
        const customer = await Customer.create({
            fullName,
            email,
            password: hashedPassword,
            phone
        });

        // Send response without password
        return res.status(201).json({
            message: "Customer registered successfully",
            customer: {
                id: customer._id,
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Do we have a customer with this email?
        const customer = await Customer.findOne({ email });

        if (!customer) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // decrypt password and compare with the one in DB 
        const isPasswordCorrect = await bcrypt.compare(
            password,
            customer.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // create a JWT token for the customer, which will be used for authentication in subsequent requests. The token contains the customer's ID and is signed with a secret key. It also has an expiration time of 1 hour.
        const token = jwt.sign(
            {
                customerId: customer._id // <--- THIS OBJECT IS YOUR PAYLOAD
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h" // <--- This adds the "exp" claim to your payload
            }
        );


        // Putting it into an HttpOnly cookie
// "token -> cookie name , 'token' -> cookie value, httpOnly: true -> cookie cannot be accessed via client-side JavaScript, secure: false -> cookie can be sent over non-HTTPS connections (for development purposes)."
        res.cookie("token", token, {
            httpOnly: true,
            secure: false
        });

        return res.status(200).json({
            message: "Login successful",
            customer: {
                id: customer._id,
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getMyProfile = async (req, res) => {
    try {
        const customer = await Customer.findById(req.customerId).select("-password");

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            customer: {
                id: customer._id,
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone
            }
        });

    } catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const logoutCustomer = (req, res) => {
    res.clearCookie("token");

    return res.status(200).json({
        message: "Logged out successfully"
    });
};

module.exports = {
    registerCustomer,
    loginCustomer,
    getMyProfile,
    logoutCustomer
};

