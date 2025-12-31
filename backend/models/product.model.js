import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
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
    brand: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    specifications: {
        type: Object,
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
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
    },
    updatedAt: {
        type: Date,
    }
}, {
    timestamps: true // createdAt, updatedAt
});

const Product = mongoose.model("Product", productSchema);

export default Product;