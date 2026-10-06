import { z } from "zod";

const nameField = z.string().max(30);
const priceCentsField = z.number().min(99);
const imageField = z.string();
const descriptionField = z.string().optional();
const categoryField = z.enum(["Data Structures", "Audio Gear", "Eyewear"]);
const tagsArray = z.array(z.string());
const brandField = z.string();
const stockField = z.number();
const specsRecord = z.record(z.string().regex(/^[a-zA-Z_-]+$/), z.unknown());
const onSaleField = z.boolean();
const isActiveField = z.boolean();

export const createProductSchema = z.object({
    name: nameField,
    priceCents: priceCentsField,
    image: imageField,
    description: descriptionField,
    category: categoryField,
    tags: tagsArray,
    brand: brandField,
    stock: stockField.default(99),
    specifications: specsRecord,
    onSale: onSaleField.default(false),
    isActive: isActiveField.default(true),
});

export const updateProductSchema = z.object({
    name: nameField,
    priceCents: priceCentsField,
    image: imageField,
    description: descriptionField,
    category: categoryField,
    tags: tagsArray,
    brand: brandField,
    stock: stockField,
    specifications: specsRecord,
    onSale: onSaleField,
    isActive: isActiveField,
})
    .partial()
    .refine(data => Object.keys(data).length > 0, "At least one field must be provided");