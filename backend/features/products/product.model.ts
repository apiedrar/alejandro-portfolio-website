import mongoose from "mongoose";
import { DEFAULT_STOCK } from "./products.constants.js";

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
    depletedAt: Date | null;
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
        default: DEFAULT_STOCK,
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
    },
    depletedAt: {
        type: Date,
        default: null,
    }
}, {
    timestamps: true // createdAt, updatedAt
});

export const Product = mongoose.model<IProduct>("Product", productSchema);