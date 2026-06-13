import express from "express";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from "./product.controller.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;