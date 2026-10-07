import { z } from "zod";
import { IProduct, Product } from "./product.model.js";
import { createProductSchema, updateProductSchema } from "./product.schema.js";
import { NotFoundError } from "../../shared/errors/error.types.js";

export async function getAllProducts(): Promise<IProduct[]> {
    const products = await Product.find({});
    return products;
};

export async function getSingleProductById(id: string): Promise<IProduct> {
    const product = await Product.findById(id);
    if (!product) throw new NotFoundError(`Product ${id} does not exist`, "id");

    return product;
}

export async function createNewProduct(data: z.infer<typeof createProductSchema>): Promise<IProduct> {
    const newProduct = new Product(data);
    return await newProduct.save();
}

export async function updateExistingProduct(id: string, data: z.infer<typeof updateProductSchema>): Promise<IProduct> {
    const updatedProduct = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!updatedProduct) throw new NotFoundError(`Product ${id} does not exist`, "id");

    return updatedProduct;
}

export async function deleteSingleProduct(id: string): Promise<IProduct> {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) throw new NotFoundError(`Product ${id} does not exist`, "id");

    return deletedProduct;
}