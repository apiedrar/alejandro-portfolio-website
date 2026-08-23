import mongoose from "mongoose";
import { Request, Response } from "express";
import Product from "./product.model.js";

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await Product.find({});
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.log(`Error fetching products: ${(error as Error).message}`);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getProductById = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ success: false, message: "Product not found, check the ID and try again" });
        return;
    }

    try {
        const product = await Product.findById(id);
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error(`Error fetching product: ${(error as Error).message}`);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    const product = req.body; // user will send this data

    const newProduct = new Product(product);

    try {
        await newProduct.save();
        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        console.error(`Error creating product: ${(error as Error).message}`);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const updateProduct = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const product = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ success: false, message: "Product not found, check the ID and try again" });
        return;
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, product, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });

    }
};

export const deleteProduct = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ success: false, message: "Product not found, check the Id and try again" });
        return;
    }

    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            res.status(404).json({ success: false, message: "Product not found, check the Id and try again" });
            return;
        }
        res.status(200).json({ success: true, message: `Product ${deletedProduct.name} deleted` });
    } catch (error) {
        console.error(`Error deleting product: ${(error as Error).message}`);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
