import mongoose from "mongoose";
import { Request, Response } from "express";
import { createProductSchema, updateProductSchema } from "./product.schema.js";
import { IProduct, Product } from "./product.model.js";
import { ApiResponse } from "../../shared/http/apiResponse.js";
import { NotFoundError, ValidationError } from "../../shared/errors/errorTypes.js";

export const getProducts = async (req: Request, res: Response<ApiResponse<IProduct[]>>) => {

    const products = await Product.find({});

    res.status(200).json({ success: true, data: products, timestamp: new Date().toISOString() });

};

export const getProductById = async (req: Request<{ id: string }>, res: Response<ApiResponse<IProduct>>) => {

    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError(`${id} format is invalid. Verify and try again`, "id");
    }

    const product = await Product.findById(id);
    
    if (!product) {
        throw new NotFoundError(`Product ${id} does not exist`, "id");
    }

    res.status(200).json({ success: true, data: product, timestamp: new Date().toISOString() });

};

export const createProduct = async (req: Request, res: Response<ApiResponse<IProduct>>) => {

    const product = createProductSchema.parse(req.body);
    const newProduct = new Product(product);
    
    await newProduct.save();
    
    res.status(201).json({ success: true, data: newProduct, timestamp: new Date().toISOString() });

};

export const updateProduct = async (req: Request<{ id: string }>, res: Response<ApiResponse<IProduct>>) => {

    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError(`${id} format is invalid. Verify and try again`, "id");
    }
    
    const product = updateProductSchema.parse(req.body);
    
    const updatedProduct = await Product.findByIdAndUpdate(id, product, { new: true, runValidators: true });
    
    if (!updatedProduct) {
        throw new NotFoundError(`Product ${id} does not exist`, "id");
    }
    
    res.status(200).json({ success: true, data: updatedProduct, timestamp: new Date().toISOString() });

};

export const deleteProduct = async (req: Request<{ id: string }>, res: Response<ApiResponse<IProduct>>) => {
    
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError(`${id} format is invalid. Verify and try again`, "id");
    }
    
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
        throw new NotFoundError(`Product ${id} does not exist`, "id");
    }
    
    res.status(200).json({ success: true, data: deletedProduct, timestamp: new Date().toISOString() });

};
