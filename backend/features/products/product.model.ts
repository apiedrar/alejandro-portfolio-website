import mongoose from "mongoose";

export interface IProduct {
    name: string;
    priceCents: number;
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
        // Dropped maxLength and annotation
    },
    priceCents: {
        type: Number,
        required: true,
        // Dropped min and annotation
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
        default: 99,
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

export const Product = mongoose.model<IProduct>("Product", productSchema);