import { jest, describe, it, expect, afterEach } from '@jest/globals';
import request from "supertest";
import express from "express";

// Mock the Product model BEFORE importing the routes

const mockFind = jest.fn();
const mockFindById = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();

jest.unstable_mockModule('../models/product.model.js', () => ({
    default: {
        find: mockFind,
        findById: mockFindById,
        findByIdAndUpdate: mockFindByIdAndUpdate,
        findByIdAndDelete: mockFindByIdAndDelete,
    }
}));

// Import routes AFTER mocking the model
const { default: productRoutes } = await import('../routes/product.route.js');

const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

describe('Product API', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should get all products successfully', async () => {
        // Mock data
        const mockProducts = [
            { _id: '1', name: 'iPhone 16', price: 699, image: 'https://example.com/iphone16.jpg' },
            { _id: '2', name: 'iPhone 17', price: 799, image: 'https://example.com/iphone17.jpg' },
        ];

        // Mock Product.find() to return our mock data
        mockFind.mockResolvedValue(mockProducts);

        // Make the request
        const res = await request(app).get('/api/products');

        // Assert the response
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toEqual(mockProducts);
        expect(mockFind).toHaveBeenCalledWith({});
    });

    it('should handle errors when fetching products', async () => {
        // Mock Product.find() to throw an error
        mockFind.mockRejectedValue(new Error('Database error'));

        // Make the request
        const res = await request(app).get('/api/products');

        // Assert the response
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Server error');
    });
});