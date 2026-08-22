import mongoose from "mongoose";

export interface IProduct {
    name: string;
    price: number;
    image: string;
    description?: string;
    category: string;
    tags: string[];
    brand: string;
    stock?: number;
    specifications: Map<string, unknown>;
    onSale: boolean;
    isActive: boolean;
}

const productSchema = new mongoose.Schema<IProduct>({
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
        type: Map,
        required: true
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

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
