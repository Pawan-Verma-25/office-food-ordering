import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import type { CartItem, OrderForm } from "../types";

interface SuccessOverlayProps {
  form: OrderForm;
  cartItems: CartItem[];
  total: number;
  onClose: () => void;
}

export function SuccessOverlay({
  form,
  cartItems,
  total,
  onClose,
}: SuccessOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      data-ocid="order.dialog"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="bg-card rounded-2xl border border-border shadow-elevated w-full max-w-md p-7"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 border border-green-200 mb-4"
          >
            <CheckCircle2 className="w-9 h-9 text-green-600" />
          </motion.div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Order Confirmed! 🎉
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            Your order has been placed successfully
          </p>
        </div>

        <div className="bg-muted rounded-xl p-4 mb-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Name</span>
            <span className="font-semibold text-foreground">{form.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Department</span>
            <span className="font-semibold text-foreground">
              {form.department}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Phone</span>
            <span className="font-semibold text-foreground">{form.phone}</span>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Order Items
          </p>
          {cartItems.map((ci) => (
            <div key={ci.item.id} className="flex justify-between text-sm">
              <span className="text-foreground">
                {ci.item.name} ×{ci.quantity}
              </span>
              <span className="font-medium text-foreground">
                ₹{ci.item.price * ci.quantity}
              </span>
            </div>
          ))}
          <div className="flex justify-between text-base font-bold text-foreground pt-3 border-t border-border">
            <span>Total Paid</span>
            <span className="font-display text-accent">₹{total}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-2xl hover:opacity-90 transition-opacity"
          data-ocid="order.confirm_button"
        >
          Place Another Order
        </button>
      </motion.div>
    </motion.div>
  );
}
