"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyCart, removeCartItem, type CartResponse } from "../services/cart";
import { Trash2, ShoppingCart, CreditCard } from "../components/icons"; // убери, если нет icons.ts
import { useCart } from "../stores/cart"; // чтобы обновить бейдж в хедере

function formatCurrency(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
}

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<{ open: boolean; itemId: string | null; loading: boolean }>({
    open: false,
    itemId: null,
    loading: false,
  });

  // из стора корзины — чтобы обновлять бейдж после операций
  const setCount = useCart((s) => s.setCount);

  async function load() {
    setLoading(true);
    try {
      const data = await getMyCart(); // 404 => { items:[], total:0 }
      setCart(data);
      setError("");
      // обновим глобальный счётчик
      const totalCount = data.items?.reduce((sum, it) => sum + it.quantity, 0) ?? 0;
      setCount(totalCount);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getMyCart();
        if (!isMounted) return;
        setCart(data);
        setError("");
        const totalCount = data.items?.reduce((sum, it) => sum + it.quantity, 0) ?? 0;
        setCount(totalCount);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.response?.data?.message || "Failed to load cart");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [setCount]);

  const subtotal = cart?.items.reduce((sum, it) => sum + it.lineTotal, 0) ?? 0;

  async function onRemoveConfirmed() {
    if (!confirm.itemId || !cart) return;
    try {
      setConfirm((s) => ({ ...s, loading: true }));
      await removeCartItem(confirm.itemId); // DELETE /api/cart/items/{itemId}

      // локально удаляем позицию
      const newItems = cart.items.filter((x) => x.itemId !== confirm.itemId);
      const newCart: CartResponse = {
        ...cart,
        items: newItems,
        total: newItems.reduce((sum, it) => sum + it.lineTotal, 0),
      };
      setCart(newCart);

      // обновим глобальный счётчик (сумма quantity)
      const totalCount = newItems.reduce((sum, it) => sum + it.quantity, 0);
      setCount(totalCount);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to remove item");
    } finally {
      setConfirm({ open: false, itemId: null, loading: false });
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
        <div className="rounded-2xl border bg-card p-6">
          <div className="h-6 w-48 bg-muted animate-pulse rounded mb-4" />
          <div className="h-48 w-full bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <div className="font-medium mb-2">Error Loading Cart</div>
          <div>{error}</div>
          <button
            onClick={load}
            className="mt-4 inline-flex items-center rounded-xl border px-4 py-2 text-sm hover:bg-muted"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
        <div className="rounded-2xl border p-10 text-center">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-8 w-8 opacity-60" />
          </div>
          <div className="text-xl font-semibold mb-1">Your cart is empty</div>
          <div className="text-muted-foreground mb-6">Browse events to add tickets.</div>
          <button
            onClick={() => navigate("/events")}
            className="inline-flex items-center rounded-xl border px-4 py-2 text-sm hover:bg-muted"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="border-b p-4 font-semibold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Cart Items ({cart.items.length})
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="p-3">Ticket Type</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Unit Price</th>
                <th className="p-3">Total</th>
                <th className="p-3 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item) => (
                <tr key={item.itemId} className="border-b hover:bg-muted/30">
                  <td className="p-3 font-mono">{item.ticketTypeId}</td>
                  <td className="p-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{formatCurrency(item.unitPrice)}</td>
                  <td className="p-3 font-bold text-secondary">{formatCurrency(item.lineTotal)}</td>
                  <td className="p-3">
                    <button
                      onClick={() => setConfirm({ open: true, itemId: item.itemId, loading: false })}
                      className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 rounded-2xl border bg-gradient-to-r from-primary/5 to-secondary/5 p-6">
        <div className="flex items-center justify-between text-lg font-bold">
          <span>Subtotal:</span>
          <span className="text-secondary">{formatCurrency(subtotal)}</span>
        </div>
        <button
          onClick={() => navigate("/checkout")}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground hover:opacity-90"
        >
          <CreditCard className="h-5 w-5" />
          Proceed to Checkout
        </button>
      </div>

      {/* Confirm dialog */}
      {confirm.open && (
        <div className="fixed inset-0 z-50 grid place-items-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirm({ open: false, itemId: null, loading: false })}
          />
          <div className="relative w-full max-w-md rounded-2xl border bg-card p-5">
            <div className="text-lg font-semibold mb-2">Remove Item</div>
            <div className="text-muted-foreground mb-4">
              Are you sure you want to remove this item from your cart?
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirm({ open: false, itemId: null, loading: false })}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-muted"
                disabled={confirm.loading}
              >
                Cancel
              </button>
              <button
                onClick={onRemoveConfirmed}
                className="rounded-xl bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:opacity-90 disabled:opacity-50"
                disabled={confirm.loading}
              >
                {confirm.loading ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
