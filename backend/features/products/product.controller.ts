import mongoose from "mongoose";
import { Request, Response } from "express";
import Product from "./product.model.js";
import { NotFoundError, ValidationError } from "../../shared/errors/types.js";

export const getProducts = async (req: Request, res: Response) => {
    const products = await Product.find({});
    res.status(200).json({ success: true, data: products });
};

export const getProductById = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError(`${id} format is invalid. Verify and try again`, "id");
    }
    const product = await Product.findById(id);
    if (!product) {
        throw new NotFoundError(`Product ${id} does not exist`, "id");
    }
    res.status(200).json({ success: true, data: product });
};

export const createProduct = async (req: Request, res: Response) => {
    const product = req.body; // user will send this data
    const newProduct = new Product(product);
    await newProduct.save();
    res.status(201).json({ success: true, data: newProduct });
};

export const updateProduct = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const product = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError(`${id} format is invalid. Verify and try again`, "id");
    }
    const updatedProduct = await Product.findByIdAndUpdate(id, product, { new: true, runValidators: true });
    if (!updatedProduct) {
        throw new NotFoundError(`Product ${id} does not exist`, "id");
    }
    res.status(200).json({ success: true, data: updatedProduct });
};

export const deleteProduct = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError(`${id} format is invalid. Verify and try again`, "id");
    }
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
        throw new NotFoundError(`Product ${id} does not exist`, "id");
    }
    res.status(200).json({ success: true, message: `Product ${deletedProduct.name} deleted` });
};
