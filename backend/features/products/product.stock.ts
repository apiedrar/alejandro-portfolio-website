import { Product } from "./product.model.js";
import { DEFAULT_STOCK, RESTOCK_DELAY_MS } from "./products.constants.js";

/* Lazy restock (SPEC decision 12): called before any product read, never from a timer. One conditional write, not read-then-write: the filter is re-evaluated by MongoDB at write time, so concurrent callers cannot double-apply it.
- `stock: 0` guards against clobbering an operator's manual restock that left a stale `depletedAt`.
- `depletedAt` is only ever set by the purchase path, so an operator who sets `stock: 0` on purpose (discontinuing a product) is never silently restocked.
*/
export async function restockDepletedProducts(now: Date = new Date()): Promise<void> {
    const cutoff = new Date(now.getTime() - RESTOCK_DELAY_MS);

    await Product.updateMany(
        { stock: 0, depletedAt: { $lte: cutoff } },
        { $set: { stock: DEFAULT_STOCK, depletedAt: null } },
    );
}
