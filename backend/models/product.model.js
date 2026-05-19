import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: [30, 'So thirty characters were insufficient, huh?']
    },
    price: {
        type: Number,
        required: true,
        min: [0.99, 'Profit is required even in sandbox, son']
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    category: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
    },
    specifications: {
        storage: {
            type: String,
            required: true,
        },
        color: {
            type: String,
            required: true,
        },
        ram: {
            type: String,
            required: true,
        },
    },
    onSale: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true // createdAt, updatedAt
});

const Product = mongoose.model("Product", productSchema);

export default Product;