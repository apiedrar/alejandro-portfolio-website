import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { NotFoundError } from '../../shared/errors/error.types.js';

const mockFind = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockFindById = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockFindByIdAndUpdate = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockFindByIdAndDelete = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockSave = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockRestock = jest.fn<(...args: unknown[]) => Promise<void>>();

// `Product` is used both as a constructor (`new Product(data)`) and as a holder of static query methods.
// A function that returns an object when called with `new` yields that object, so the mock is both.
const makeDocument = (data: object) => ({ ...data, save: mockSave });
const MockProduct = Object.assign(
    jest.fn(makeDocument),
    {
        find: mockFind,
        findById: mockFindById,
        findByIdAndUpdate: mockFindByIdAndUpdate,
        findByIdAndDelete: mockFindByIdAndDelete,
    },
);

jest.unstable_mockModule('./product.model.js', () => ({ Product: MockProduct }));
jest.unstable_mockModule('./product.stock.js', () => ({ restockDepletedProducts: mockRestock }));

const {
    getAllProducts,
    getSingleProductById,
    createNewProduct,
    updateExistingProduct,
    deleteSingleProduct,
} = await import('./product.service.js');

const validCreateDto = {
    name: 'Binary Search Tree',
    priceCents: 4999,
    image: '/products/bst.png',
    category: 'Data Structures' as const,
    tags: ['tree'],
    brand: 'ACME DSA',
    stock: 99,
    specifications: { storage: 'O(n)' },
    onSale: false,
    isActive: true,
};

describe('Product service', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        // resetAllMocks also wipes the constructor mock's implementation, so it has to be re-installed.
        MockProduct.mockImplementation(makeDocument);
        mockRestock.mockResolvedValue(undefined);
    });

    describe('getAllProducts', () => {
        it('restocks before reading, then returns what find resolves', async () => {
            const products = [{ _id: '1', name: 'X' }];
            mockFind.mockResolvedValue(products);

            const result = await getAllProducts();

            expect(result).toEqual(products);
            expect(mockFind).toHaveBeenCalledWith({});
            expect(mockRestock.mock.invocationCallOrder[0]).toBeLessThan(mockFind.mock.invocationCallOrder[0]);
        });

        it('does not read when the restock fails', async () => {
            mockRestock.mockRejectedValue(new Error('restock failed'));

            await expect(getAllProducts()).rejects.toThrow('restock failed');
            expect(mockFind).not.toHaveBeenCalled();
        });
    });

    describe('getSingleProductById', () => {
        it('restocks before reading, then returns the product', async () => {
            const product = { _id: 'abc', name: 'X' };
            mockFindById.mockResolvedValue(product);

            const result = await getSingleProductById('abc');

            expect(result).toEqual(product);
            expect(mockRestock.mock.invocationCallOrder[0]).toBeLessThan(mockFindById.mock.invocationCallOrder[0]);
        });

        it('throws NotFoundError when no product matches', async () => {
            mockFindById.mockResolvedValue(null);

            await expect(getSingleProductById('missing')).rejects.toThrow(NotFoundError);
        });
    });

    describe('createNewProduct', () => {
        it('builds a document from the validated DTO, saves it, and returns the saved document', async () => {
            const saved = { _id: 'new', ...validCreateDto };
            mockSave.mockResolvedValue(saved);

            const result = await createNewProduct(validCreateDto);

            expect(MockProduct).toHaveBeenCalledWith(validCreateDto);
            expect(mockSave).toHaveBeenCalledTimes(1);
            expect(result).toEqual(saved);
        });
    });

    describe('updateExistingProduct', () => {
        it('updates with validators on and returns the new document', async () => {
            const updated = { _id: 'abc', name: 'Renamed' };
            mockFindByIdAndUpdate.mockResolvedValue(updated);

            const result = await updateExistingProduct('abc', { name: 'Renamed' });

            expect(result).toEqual(updated);
            expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
                'abc',
                { name: 'Renamed' },
                { new: true, runValidators: true },
            );
        });

        it('throws NotFoundError when no product matches', async () => {
            mockFindByIdAndUpdate.mockResolvedValue(null);

            await expect(updateExistingProduct('missing', { name: 'X' })).rejects.toThrow(NotFoundError);
        });
    });

    describe('deleteSingleProduct', () => {
        it('returns the deleted document', async () => {
            const deleted = { _id: 'abc', name: 'X' };
            mockFindByIdAndDelete.mockResolvedValue(deleted);

            expect(await deleteSingleProduct('abc')).toEqual(deleted);
        });

        it('throws NotFoundError when no product matches', async () => {
            mockFindByIdAndDelete.mockResolvedValue(null);

            await expect(deleteSingleProduct('missing')).rejects.toThrow(NotFoundError);
        });
    });
});
