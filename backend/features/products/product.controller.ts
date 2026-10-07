import mongoose from "mongoose";
import { Request, Response } from "express";
import { createProductSchema, updateProductSchema } from "./product.schema.js";
import { IProduct } from "./product.model.js";
import { ApiResponse } from "../../shared/http/http.response.js";
import { ValidationError } from "../../shared/errors/error.types.js";
import { getAllProducts, getSingleProductById, createNewProduct, updateExistingProduct, deleteSingleProduct } from "./product.service.js";

export const getProducts = async (req: Request, res: Response<ApiResponse<IProduct[]>>) => {
    const products = await getAllProducts();
    res.status(200).json({ success: true, data: products, timestamp: new Date().toISOString() });
};

export const getProductById = async (req: Request<{ id: string }>, res: Response<ApiResponse<IProduct>>) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new ValidationError(`${id} format is invalid. Verify and try again`, "id");

    const product = await getSingleProductById(id);
    res.status(200).json({ success: true, data: product, timestamp: new Date().toISOString() });
};

export const createProduct = async (req: Request, res: Response<ApiResponse<IProduct>>) => {
    const product = createProductSchema.parse(req.body);
    const newProduct = await createNewProduct(product);
    res.status(201).json({ success: true, data: newProduct, timestamp: new Date().toISOString() });
};

export const updateProduct = async (req: Request<{ id: string }>, res: Response<ApiResponse<IProduct>>) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new ValidationError(`${id} format is invalid. Verify and try again`, "id");
    
    const product = updateProductSchema.parse(req.body);
    const updatedProduct = await updateExistingProduct(id, product);
    res.status(200).json({ success: true, data: updatedProduct, timestamp: new Date().toISOString() });
};

export const deleteProduct = async (req: Request<{ id: string }>, res: Response<ApiResponse<IProduct>>) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new ValidationError(`${id} format is invalid. Verify and try again`, "id");
    
    const deletedProduct = await deleteSingleProduct(id);
    res.status(200).json({ success: true, data: deletedProduct, timestamp: new Date().toISOString() });
};
