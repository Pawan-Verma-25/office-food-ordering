import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ChefHat, ChevronDown, ShoppingCart, Store } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AdminDashboard } from "./components/AdminDashboard";
import { MenuItemCard } from "./components/MenuItemCard";
import {
  type LabeledRestaurantCartItem,
  OrderSidebar,
} from "./components/OrderSidebar";
import { SuccessOverlay } from "./components/SuccessOverlay";
import {
  LUNCH_RESTAURANTS,
  RESTAURANTS,
  lunchMenus,
  menuItems,
  restaurantMenus,
} from "./data/menuData";
import { useActor } from "./hooks/useActor";
import type {
  CartItem,
  MenuItem,
  OrderForm,
  RestaurantCartItem,
} from "./types";

const CATEGORIES = [
  { key: "breakfast", label: "Breakfast", icon: "☀️" },
  { key: "lunch", label: "Lunch", icon: "🍛" },
  { key: "snacks", label: "Snacks", icon: "🍿" },
] as const;

// Restaurant emojis + metadata
const RESTAURANT_META: Record<string, { emoji: string; label: string }> = {
  "Ruchi Cafe": { emoji: "🍽️", label: "Ruchi Cafe" },
  "Anna Cafe": { emoji: "☕", label: "Anna Cafe" },
  "Local Shop": { emoji: "🛒", label: "Local Shop" },
  "Babu's Classic": { emoji: "🍕", label: "Babu's Classic" },
};

function getRestaurantMeta(name: string) {
  return RESTAURANT_META[name] ?? { emoji: "🏪", label: name };
}

// Exact name → unique image mapping for every menu item
const ITEM_IMAGE_MAP: Record<string, string> = {
  // ── Idli variants ──
  Idli: "/assets/generated/plain-idli.dim_400x300.jpg",
  "Idli (2 pcs)": "/assets/generated/plain-idli.dim_400x300.jpg",
  "Steam Idli": "/assets/generated/idli.dim_400x300.jpg",
  "Butter Idli": "/assets/generated/butter-idli.dim_400x300.jpg",
  "Masala Idli": "/assets/generated/masala-idli.dim_400x300.jpg",
  "Rasam Idli": "/assets/generated/rasam-idli.dim_400x300.jpg",
  "Idli Vada": "/assets/generated/idli-vada.dim_400x300.jpg",
  "Idli Sambar": "/assets/generated/idli-sambar.dim_400x300.jpg",
  // ── Vada variants ──
  "Medu Vada": "/assets/generated/medu-vada.dim_400x300.jpg",
  "Medu Vada (2 pcs)": "/assets/generated/medu-vada.dim_400x300.jpg",
  "Masala Vada": "/assets/generated/masala-vada.dim_400x300.jpg",
  "Rasam Wada": "/assets/generated/rasam-wada.dim_400x300.jpg",
  "Sabudana Vada": "/assets/generated/sabudana-vada.dim_400x300.jpg",
  "Batata Vada Usal": "/assets/generated/batata-vada-usal.dim_400x300.jpg",
  "Wada Pav": "/assets/generated/wada-pav.dim_400x300.jpg",
  "Vada Pav": "/assets/generated/vada-pav.dim_400x300.jpg",
  // ── Poha / Upma / Sheera ──
  Poha: "/assets/generated/poha.dim_400x300.jpg",
  "Kanda Poha": "/assets/generated/kanda-poha.dim_400x300.jpg",
  Upma: "/assets/generated/upma.dim_400x300.jpg",
  Sheera: "/assets/generated/sheera.dim_400x300.jpg",
  "Sheera Upma Mix": "/assets/generated/sheera-upma-mix.dim_400x300.jpg",
  "Sabudana Khichdi": "/assets/generated/sabudana-khichdi.dim_400x300.jpg",
  "Sabudana Khichadi": "/assets/generated/sabudana-khichdi.dim_400x300.jpg",
  // ── Puri / Pav ──
  "Puri Bhaji": "/assets/generated/puri-bhaji.dim_400x300.jpg",
  "Misal Pav": "/assets/generated/misal-pav.dim_400x300.jpg",
  "Usal Pav": "/assets/generated/usal-pav.dim_400x300.jpg",
  "Pav Bhaji": "/assets/generated/pav-bhaji.dim_400x300.jpg",
  "Masala Pav": "/assets/generated/masala-pav.dim_400x300.jpg",
  "Cheese Pav Bhaji": "/assets/generated/cheese-pav-bhaji.dim_400x300.jpg",
  "Bhaji Pav": "/assets/generated/bhaji-pav.dim_400x300.jpg",
  // ── Dosa variants ──
  "Sada Dosa": "/assets/generated/sada-dosa.dim_400x300.jpg",
  "Mysore Sada Dosa": "/assets/generated/mysore-sada-dosa.dim_400x300.jpg",
  "Masala Dosa": "/assets/generated/masala-dosa.dim_400x300.jpg",
  "Mysore Masala Dosa": "/assets/generated/mysore-masala-dosa.dim_400x300.jpg",
  "Rava Sada Dosa": "/assets/generated/rava-sada-dosa.dim_400x300.jpg",
  "Onion Rava Sada": "/assets/generated/onion-rava-sada-dosa.dim_400x300.jpg",
  "Rava Masala Dosa": "/assets/generated/rava-masala-dosa.dim_400x300.jpg",
  "Ragi Rava Masala": "/assets/generated/ragi-rava-masala-dosa.dim_400x300.jpg",
  "Butter Sada Dosa": "/assets/generated/butter-sada-dosa.dim_400x300.jpg",
  "Cheese Sada Dosa": "/assets/generated/cheese-sada-dosa.dim_400x300.jpg",
  "Onion Sada Dosa": "/assets/generated/onion-sada-dosa.dim_400x300.jpg",
  "Butter Masala Dosa": "/assets/generated/butter-masala-dosa.dim_400x300.jpg",
  "Mysore Rava Masala Dosa":
    "/assets/generated/mysore-rava-masala-dosa.dim_400x300.jpg",
  "Schezwan Sada Dosa": "/assets/generated/schezwan-sada-dosa.dim_400x300.jpg",
  // ── Uttapam / Uthappa variants ──
  "Sada Uttapam": "/assets/generated/sada-uttapam.dim_400x300.jpg",
  "Sada Uthappa": "/assets/generated/sada-uttapam.dim_400x300.jpg",
  "Sada Uttappa (2 pcs)": "/assets/generated/sada-uttapam.dim_400x300.jpg",
  "Onion Uttapam": "/assets/generated/onion-uttapam.dim_400x300.jpg",
  "Onion Uthappa": "/assets/generated/onion-uttapam.dim_400x300.jpg",
  "Onion Uttappa": "/assets/generated/onion-uttapam.dim_400x300.jpg",
  "Masala Uttapam": "/assets/generated/masala-uttapam.dim_400x300.jpg",
  "Masala Uthappa": "/assets/generated/masala-uttapam.dim_400x300.jpg",
  "Masala Uttappa": "/assets/generated/masala-uttapam.dim_400x300.jpg",
  "Cheese Uttapam": "/assets/generated/cheese-uttapam.dim_400x300.jpg",
  "Cheese Uttappa": "/assets/generated/cheese-uttapam.dim_400x300.jpg",
  "Veg Uttapam": "/assets/generated/veg-uttapam.dim_400x300.jpg",
  "Veg Uttappa": "/assets/generated/veg-uttapam.dim_400x300.jpg",
  "Vegetable Uthappa": "/assets/generated/vegetable-uttapam.dim_400x300.jpg",
  "Butter Onion Uthappa":
    "/assets/generated/butter-onion-uttapam.dim_400x300.jpg",
  "Butter Masala Uthappa":
    "/assets/generated/butter-masala-uttapam.dim_400x300.jpg",
  "Mysore Sada Uthappa":
    "/assets/generated/mysore-sada-uttapam.dim_400x300.jpg",
  // ── Biryani variants ──
  "Paneer Biryani": "/assets/generated/paneer-biryani.dim_400x300.jpg",
  "Veg Biryani": "/assets/generated/veg-biryani.dim_400x300.jpg",
  "Soya Bean Biryani": "/assets/generated/soya-biryani.dim_400x300.jpg",
  "Soya Biryani": "/assets/generated/soya-biryani.dim_400x300.jpg",
  "Mushroom Biryani": "/assets/generated/mushroom-biryani.dim_400x300.jpg",
  // ── Pulav variants ──
  "Veg Pulav": "/assets/generated/veg-pulav.dim_400x300.jpg",
  "Paneer Pulav": "/assets/generated/paneer-pulav.dim_400x300.jpg",
  // ── Rice dishes ──
  "Mini Thali": "/assets/generated/mini-thali.dim_400x300.jpg",
  "Veg Thali": "/assets/generated/veg-thali.dim_400x300.jpg",
  "Dal Rice": "/assets/generated/dal-rice.dim_400x300.jpg",
  "Sambar Rice": "/assets/generated/sambar-rice.dim_400x300.jpg",
  "Lemon Rice": "/assets/generated/lemon-rice.dim_400x300.jpg",
  "Curd Rice": "/assets/generated/curd-rice.dim_400x300.jpg",
  "Masala Rice": "/assets/generated/masala-rice.dim_400x300.jpg",
  "Chapati Bhaji": "/assets/generated/chapati-bhaji.dim_400x300.jpg",
  "Dal Khichdi": "/assets/generated/dal-khichdi.dim_400x300.jpg",
  "Dal Khichadi": "/assets/generated/dal-khichdi.dim_400x300.jpg",
  "Dal Khichdi Tadka": "/assets/generated/dal-khichdi-tadka.dim_400x300.jpg",
  "Rasam Rice": "/assets/generated/rasam-rice.dim_400x300.jpg",
  // ── Fried Rice variants ──
  "Veg Fried Rice": "/assets/generated/veg-fried-rice.dim_400x300.jpg",
  "Schezwan Fried Rice":
    "/assets/generated/schezwan-fried-rice.dim_400x300.jpg",
  "Hong Kong Fried Rice":
    "/assets/generated/hong-kong-fried-rice.dim_400x300.jpg",
  "Paneer Fried Rice": "/assets/generated/paneer-fried-rice.dim_400x300.jpg",
  "Veg Manchurian Fried Rice":
    "/assets/generated/veg-manchurian-fried-rice.dim_400x300.jpg",
  // ── Noodles variants ──
  "Veg Hakka Noodles": "/assets/generated/veg-hakka-noodles.dim_400x300.jpg",
  "Veg Schezwan Noodles":
    "/assets/generated/veg-schezwan-noodles.dim_400x300.jpg",
  "Hong Kong Noodles": "/assets/generated/hong-kong-noodles.dim_400x300.jpg",
  "Triple Schezwan Noodles":
    "/assets/generated/triple-schezwan-noodles.dim_400x300.jpg",
  // ── Drinks / Lassi ──
  "Sweet Lassi": "/assets/generated/sweet-lassi.dim_400x300.jpg",
  "Salted Lassi": "/assets/generated/salted-lassi.dim_400x300.jpg",
  "Mango Lassi": "/assets/generated/mango-lassi.dim_400x300.jpg",
  Buttermilk: "/assets/generated/buttermilk.dim_400x300.jpg",
  "Fresh Lime Water": "/assets/generated/fresh-lime-water.dim_400x300.jpg",
  "Fresh Lime Soda": "/assets/generated/fresh-lime-soda.dim_400x300.jpg",
  "Ginger Lemon": "/assets/generated/ginger-lemon.dim_400x300.jpg",
  // ── Juices ──
  "Sugarcane Juice": "/assets/generated/sugarcane-juice.dim_400x300.jpg",
  "Beetroot Juice": "/assets/generated/beetroot-juice.dim_400x300.jpg",
  "Carrot Juice": "/assets/generated/carrot-juice.dim_400x300.jpg",
  "Mosambi Juice": "/assets/generated/mosambi-juice.dim_400x300.jpg",
  "Watermelon Juice": "/assets/generated/watermelon-juice.dim_400x300.jpg",
  "Pineapple Juice": "/assets/generated/pineapple-juice.dim_400x300.jpg",
  // ── Maggi ──
  "Plain Masala Maggi": "/assets/generated/plain-masala-maggi.dim_400x300.jpg",
  "Paneer Maggi": "/assets/generated/paneer-maggi.dim_400x300.jpg",
  // ── Sandwiches (Babu's Classic) ──
  "Veg Sandwich": "/assets/generated/veg-sandwich-plain.dim_400x300.jpg",
  Sandwich: "/assets/generated/veg-sandwich.dim_400x300.jpg",
  "Masala Toast Sandwich":
    "/assets/generated/masala-toast-sandwich.dim_400x300.jpg",
  "Bread Butter Toast": "/assets/generated/bread-butter-toast.dim_400x300.jpg",
  "Veg Three Slice Sandwich":
    "/assets/generated/veg-three-slice-sandwich.dim_400x300.jpg",
  "Veg Cheese Sandwich":
    "/assets/generated/veg-cheese-sandwich.dim_400x300.jpg",
  "Veg Grill Sandwich": "/assets/generated/veg-grill-sandwich.dim_400x300.jpg",
  "Paneer Cheese Grill Sandwich":
    "/assets/generated/paneer-cheese-grill-sandwich.dim_400x300.jpg",
  "Samosa Veg Sandwich":
    "/assets/generated/samosa-veg-sandwich.dim_400x300.jpg",
  "Samosa Toast Sandwich":
    "/assets/generated/samosa-toast-sandwich.dim_400x300.jpg",
  // ── Pizzas ──
  "Veg Cheese Pizza": "/assets/generated/veg-cheese-pizza.dim_400x300.jpg",
  "Veg Masala Pizza": "/assets/generated/veg-masala-pizza.dim_400x300.jpg",
  "Chilly Corn Pizza": "/assets/generated/chilly-corn-pizza.dim_400x300.jpg",
  "Mushroom Pizza": "/assets/generated/mushroom-pizza.dim_400x300.jpg",
  "Veg Paneer Pizza": "/assets/generated/veg-paneer-pizza.dim_400x300.jpg",
  // ── Burgers ──
  "Veg Burger": "/assets/generated/veg-burger.dim_400x300.jpg",
  "Veg Cheese Burger": "/assets/generated/veg-cheese-burger.dim_400x300.jpg",
  "Schezwan Cheese Burger":
    "/assets/generated/schezwan-cheese-burger.dim_400x300.jpg",
  // ── Other ──
  Samosa: "/assets/generated/samosa.dim_400x300.jpg",
  Patty: "/assets/generated/veg-burger.dim_400x300.jpg",
  // ── Local Shop Lunch items ──
  "Bhaji & Chapati":
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
  "Dal Rice & Bhaji":
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
  // Dal Rice already mapped above (dal-rice.dim_400x300.jpg)
  "Chicken Fried Rice":
    "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
  "Veg Noodles":
    "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&h=300&fit=crop",
  "Chicken Noodles":
    "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=300&fit=crop",
  "Triple Fried Rice":
    "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop",
  "Chicken Chilli":
    "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop",
  "Malai Soya Chaap":
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop",
  "Afghani Soya Chaap": "/assets/uploads/afghani-soya-chaap.png",
  "Omelette Pav":
    "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop",
  "Bhurji Pav":
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop",
  "Egg Rice": "/assets/uploads/egg-rice.png",
  "Boiled Egg (2 pcs)":
    "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop",
};

function getMenuItemImage(name: string): string {
  if (ITEM_IMAGE_MAP[name]) return ITEM_IMAGE_MAP[name];
  const lower = name.toLowerCase();
  if (lower.includes("idli")) return "/assets/generated/idli.dim_400x300.jpg";
  if (lower.includes("dosa")) return "/assets/generated/dosa.dim_400x300.jpg";
  if (lower.includes("uttap") || lower.includes("uthap"))
    return "/assets/generated/uttapam.dim_400x300.jpg";
  if (lower.includes("vada") || lower.includes("wada"))
    return "/assets/generated/medu-vada.dim_400x300.jpg";
  if (lower.includes("biryani"))
    return "/assets/generated/veg-biryani.dim_400x300.jpg";
  if (lower.includes("pulav") || lower.includes("pulao"))
    return "/assets/generated/veg-pulav.dim_400x300.jpg";
  if (lower.includes("fried rice"))
    return "/assets/generated/veg-fried-rice.dim_400x300.jpg";
  if (lower.includes("noodle"))
    return "/assets/generated/veg-noodles.dim_400x300.jpg";
  if (lower.includes("thali"))
    return "/assets/generated/veg-thali.dim_400x300.jpg";
  if (lower.includes("lassi")) return "/assets/generated/lassi.dim_400x300.jpg";
  if (lower.includes("juice")) return "/assets/generated/juice.dim_400x300.jpg";
  if (lower.includes("pizza"))
    return "/assets/generated/veg-pizza.dim_400x300.jpg";
  if (lower.includes("burger"))
    return "/assets/generated/veg-burger.dim_400x300.jpg";
  if (lower.includes("sandwich") || lower.includes("toast"))
    return "/assets/generated/veg-sandwich.dim_400x300.jpg";
  if (lower.includes("maggi")) return "/assets/generated/maggi.dim_400x300.jpg";
  if (lower.includes("samosa"))
    return "/assets/generated/samosa.dim_400x300.jpg";
  if (lower.includes("poha")) return "/assets/generated/poha.dim_400x300.jpg";
  if (lower.includes("upma")) return "/assets/generated/upma.dim_400x300.jpg";
  if (lower.includes("sheera"))
    return "/assets/generated/sheera.dim_400x300.jpg";
  if (lower.includes("rice"))
    return "/assets/generated/sambar-rice.dim_400x300.jpg";
  if (lower.includes("pav"))
    return "/assets/generated/pav-bhaji.dim_400x300.jpg";
  return "/assets/generated/veg-thali.dim_400x300.jpg";
}

// ── Custom Restaurant Dropdown ──────────────────────────────────────────────
interface RestaurantDropdownProps {
  value: string;
  options: readonly string[];
  placeholder?: string;
  onChange: (v: string) => void;
  id: string;
  ocid: string;
}

function RestaurantDropdown({
  value,
  options,
  placeholder,
  onChange,
  id,
  ocid,
}: RestaurantDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selectedMeta = value ? getRestaurantMeta(value) : null;

  return (
    <div ref={ref} className="relative w-full sm:w-80">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 bg-card text-sm font-medium text-foreground",
          "shadow-soft hover:shadow-card transition-all duration-200 cursor-pointer focus:outline-none",
          open
            ? "border-primary ring-2 ring-primary/20"
            : "border-border hover:border-primary/50",
        ].join(" ")}
        data-ocid={ocid}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selectedMeta ? (
          <>
            <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-base shrink-0">
              {selectedMeta.emoji}
            </span>
            <span className="flex-1 text-left font-semibold text-foreground">
              {selectedMeta.label}
            </span>
          </>
        ) : (
          <>
            <span className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-base shrink-0">
              <Store className="w-4 h-4 text-muted-foreground" />
            </span>
            <span className="flex-1 text-left text-muted-foreground">
              {placeholder ?? "Select a restaurant"}
            </span>
          </>
        )}
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 z-50 bg-card rounded-2xl border border-border shadow-elevated overflow-hidden"
          >
            {options.map((opt) => {
              const meta = getRestaurantMeta(opt);
              const isSelected = opt === value;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={[
                    "w-full flex items-center gap-3 px-4 py-3.5 text-sm text-left custom-dropdown-item transition-colors",
                    isSelected ? "selected" : "",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 transition-colors",
                      isSelected ? "bg-primary/15" : "bg-muted",
                    ].join(" ")}
                  >
                    {meta.emoji}
                  </span>
                  <span
                    className={
                      isSelected
                        ? "font-semibold text-primary"
                        : "font-medium text-foreground"
                    }
                  >
                    {meta.label}
                  </span>
                  {isSelected && (
                    <span className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-label="Selected"
                        role="img"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Menu item card (inline for breakfast/lunch) ────────────────────────────
interface InlineMenuCardProps {
  item: { id: string; name: string; price: number };
  cartItem: RestaurantCartItem | undefined;
  onAdd: (id: string) => void;
  onQtyChange: (id: string, delta: number) => void;
  ocid: string;
  primaryBtnOcid: string;
  secondaryBtnOcid: string;
}

function InlineMenuCard({
  item,
  cartItem,
  onAdd,
  onQtyChange,
  ocid,
  primaryBtnOcid,
  secondaryBtnOcid,
}: InlineMenuCardProps) {
  return (
    <div
      className="group bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-2 hover:border-primary/30 transition-all duration-300 ease-out cursor-pointer"
      data-ocid={ocid}
    >
      <div className="relative h-36 overflow-hidden bg-muted">
        <img
          src={getMenuItemImage(item.name)}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ease-out"
        />
      </div>
      <div className="p-4">
        <p className="font-display font-semibold text-sm text-foreground leading-tight mb-1.5 line-clamp-2 min-h-[2.5rem]">
          {item.name}
        </p>
        <p className="text-accent font-bold text-base mb-3">₹{item.price}</p>
        {cartItem ? (
          <div className="flex items-center justify-between bg-muted rounded-full px-1 py-0.5">
            <button
              type="button"
              onClick={() => onQtyChange(item.id, -1)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:bg-card active:scale-95 transition-all duration-150 text-lg font-bold"
              data-ocid={secondaryBtnOcid}
            >
              −
            </button>
            <span className="text-sm font-bold text-foreground w-6 text-center">
              {cartItem.quantity}
            </span>
            <button
              type="button"
              onClick={() => onAdd(item.id)}
              className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-lg font-bold hover:brightness-110 active:scale-95 transition-all duration-150"
              data-ocid={primaryBtnOcid}
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onAdd(item.id)}
            className="w-full py-2.5 rounded-full bg-accent text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all duration-150 shadow-sm hover:shadow-md"
            data-ocid={primaryBtnOcid}
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}

// ── Admin route guard ────────────────────────────────────────────────────────
const isAdminRoute = window.location.pathname === "/admin";

export default function App() {
  if (isAdminRoute) {
    return <AdminDashboard />;
  }
  return <MainApp />;
}

function MainApp() {
  const [cart, setCart] = useState<CartItem[]>([]);
  // Each restaurant keeps its own separate cart array, keyed by restaurant name
  const [restaurantCartMap, setRestaurantCartMap] = useState<
    Record<string, RestaurantCartItem[]>
  >({});
  const [lunchCartMap, setLunchCartMap] = useState<
    Record<string, RestaurantCartItem[]>
  >({});
  const [activeTab, setActiveTab] = useState<string>("breakfast");
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [selectedLunchRestaurant, setSelectedLunchRestaurant] =
    useState<string>("");
  const [form, setForm] = useState<OrderForm>({
    name: "",
    department: "",
    phone: "",
    restaurantName: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<OrderForm>>({});
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [prevCartCount, setPrevCartCount] = useState(0);
  const [badgeAnimKey, setBadgeAnimKey] = useState(0);
  const { actor } = useActor();
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Flatten all restaurant cart maps into a single LabeledRestaurantCartItem array
  const allRestaurantCartItems: LabeledRestaurantCartItem[] = [
    ...Object.entries(restaurantCartMap).flatMap(([restaurantName, items]) =>
      items.map((ci) => ({ ...ci, restaurantName })),
    ),
    ...Object.entries(lunchCartMap).flatMap(([restaurantName, items]) =>
      items.map((ci) => ({ ...ci, restaurantName })),
    ),
  ];

  const regularCartTotal = cart.reduce(
    (sum, ci) => sum + ci.item.price * ci.quantity,
    0,
  );
  const restaurantCartTotal = allRestaurantCartItems.reduce(
    (sum, ci) => sum + ci.item.price * ci.quantity,
    0,
  );
  const cartTotalItems =
    cart.reduce((sum, ci) => sum + ci.quantity, 0) +
    allRestaurantCartItems.reduce((sum, ci) => sum + ci.quantity, 0);
  const cartTotal = regularCartTotal + restaurantCartTotal;

  // Trigger badge pop animation when cart grows
  useEffect(() => {
    if (cartTotalItems > prevCartCount) {
      setBadgeAnimKey((k) => k + 1);
    }
    setPrevCartCount(cartTotalItems);
  }, [cartTotalItems, prevCartCount]);

  const getCartItem = (itemId: string) =>
    cart.find((ci) => ci.item.id === itemId);

  // Get cart item for the CURRENTLY selected breakfast restaurant only
  const getRestaurantCartItem = (itemId: string) =>
    (restaurantCartMap[selectedRestaurant] ?? []).find(
      (ci) => ci.item.id === itemId,
    );

  // Get cart item for the CURRENTLY selected lunch restaurant only
  const getLunchCartItem = (itemId: string) =>
    (lunchCartMap[selectedLunchRestaurant] ?? []).find(
      (ci) => ci.item.id === itemId,
    );

  const handleToggle = (item: MenuItem) => {
    const category =
      item.category.charAt(0).toUpperCase() + item.category.slice(1);
    setCart((prev) => {
      const exists = prev.find((ci) => ci.item.id === item.id);
      if (exists) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci,
        );
      }
      return [...prev, { item, quantity: 1, category }];
    });
  };

  const handleQtyChange = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((ci) =>
          ci.item.id === itemId ? { ...ci, quantity: ci.quantity + delta } : ci,
        )
        .filter((ci) => ci.quantity > 0),
    );
  };

  const handleRestaurantAdd = (itemId: string) => {
    const menu = restaurantMenus[selectedRestaurant];
    const item = menu?.find((m) => m.id === itemId);
    if (!item) return;
    setRestaurantCartMap((prev) => {
      const existing = prev[selectedRestaurant] ?? [];
      const alreadyIn = existing.find((ci) => ci.item.id === itemId);
      const updated = alreadyIn
        ? existing.map((ci) =>
            ci.item.id === itemId ? { ...ci, quantity: ci.quantity + 1 } : ci,
          )
        : [...existing, { item, quantity: 1, category: item.category }];
      return { ...prev, [selectedRestaurant]: updated };
    });
  };

  const handleRestaurantQtyChange = (itemId: string, delta: number) => {
    setRestaurantCartMap((prev) => {
      const existing = prev[selectedRestaurant] ?? [];
      const updated = existing
        .map((ci) =>
          ci.item.id === itemId ? { ...ci, quantity: ci.quantity + delta } : ci,
        )
        .filter((ci) => ci.quantity > 0);
      return { ...prev, [selectedRestaurant]: updated };
    });
  };

  const handleLunchAdd = (itemId: string) => {
    const menu = lunchMenus[selectedLunchRestaurant];
    const item = menu?.find((m) => m.id === itemId);
    if (!item) return;
    setLunchCartMap((prev) => {
      const existing = prev[selectedLunchRestaurant] ?? [];
      const alreadyIn = existing.find((ci) => ci.item.id === itemId);
      const updated = alreadyIn
        ? existing.map((ci) =>
            ci.item.id === itemId ? { ...ci, quantity: ci.quantity + 1 } : ci,
          )
        : [...existing, { item, quantity: 1, category: item.category }];
      return { ...prev, [selectedLunchRestaurant]: updated };
    });
  };

  const handleLunchQtyChange = (itemId: string, delta: number) => {
    setLunchCartMap((prev) => {
      const existing = prev[selectedLunchRestaurant] ?? [];
      const updated = existing
        .map((ci) =>
          ci.item.id === itemId ? { ...ci, quantity: ci.quantity + delta } : ci,
        )
        .filter((ci) => ci.quantity > 0);
      return { ...prev, [selectedLunchRestaurant]: updated };
    });
  };

  // Switching restaurants no longer clears existing carts — each restaurant keeps its own
  const handleRestaurantChange = (restaurant: string) => {
    setSelectedRestaurant(restaurant);
    setForm((prev) => ({ ...prev, restaurantName: restaurant }));
  };

  const handleLunchRestaurantChange = (restaurant: string) => {
    setSelectedLunchRestaurant(restaurant);
    setForm((prev) => ({ ...prev, restaurantName: restaurant }));
  };

  const handleFormChange = (field: keyof OrderForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    // Clear order error when user starts correcting their input
    setOrderError(null);
  };

  const handleSubmit = async (_paymentScreenshot?: string) => {
    // Prevent duplicate submissions
    if (isSubmitting) return;

    // Clear previous order error
    setOrderError(null);

    // Data validation — required fields
    const errors: Partial<OrderForm> = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.department.trim()) errors.department = "Department is required";
    if (!form.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(form.phone.trim()))
      errors.phone = "Enter a valid 10-digit number";

    if (cartTotalItems === 0) {
      alert("Please add at least one item to your order.");
      return;
    }

    if (cartTotal <= 0) {
      setOrderError("Invalid order total. Please add items to your cart.");
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Use the first non-empty restaurant name as the order's primary restaurant
    const primaryRestaurant =
      selectedRestaurant || selectedLunchRestaurant || "General";

    // Combine all items from all carts — ensure category is always set
    const allItems = [
      ...cart.map((ci) => ({
        itemName: ci.item.name,
        quantity: BigInt(ci.quantity),
        price: BigInt(ci.item.price),
        category: ci.category?.trim() || "Others",
        restaurant: "",
      })),
      ...allRestaurantCartItems.map((ci) => ({
        itemName: ci.item.name,
        quantity: BigInt(ci.quantity),
        price: BigInt(ci.item.price),
        category: ci.category?.trim() || "Others",
        restaurant: ci.restaurantName ?? "",
      })),
    ];

    const orderData = {
      name: form.name.trim(),
      department: form.department.trim(),
      phone: form.phone.trim(),
      restaurantName: primaryRestaurant,
      items: allItems,
      totalAmount: BigInt(cartTotal),
      timestamp: Date.now(),
      paymentScreenshot: _paymentScreenshot ?? "",
    };
    console.log("[Order] Placing order:", orderData);

    setIsSubmitting(true);
    try {
      if (actor) {
        await actor.placeOrder(
          form.name.trim(),
          form.department.trim(),
          form.phone.trim(),
          primaryRestaurant,
          allItems,
          BigInt(cartTotal),
          _paymentScreenshot ?? "",
        );
        console.log("[Order] Order saved successfully");
      }
      setShowSuccess(true);
    } catch (e) {
      console.error("[Order] Failed to save order:", e);
      setOrderError("Order failed, please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewOrder = () => {
    setShowSuccess(false);
    setCart([]);
    setRestaurantCartMap({});
    setLunchCartMap({});
    setSelectedRestaurant("");
    setSelectedLunchRestaurant("");
    setForm({ name: "", department: "", phone: "", restaurantName: "" });
    setFormErrors({});
    setShowOrderPanel(false);
  };

  const currentYear = new Date().getFullYear();

  // Build CartItem-compatible list for success overlay
  const allCartItemsForSuccess: CartItem[] = [
    ...cart,
    ...allRestaurantCartItems.map((ci) => ({
      item: {
        id: ci.item.id,
        name: ci.item.name,
        description: "",
        price: ci.item.price,
        category: (ci.item.category?.toLowerCase() ?? "breakfast") as
          | "breakfast"
          | "lunch"
          | "snacks",
        image: "",
      },
      quantity: ci.quantity,
      category: ci.category,
    })),
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-xl text-foreground leading-none tracking-tight">
                Bonkers Bites
              </span>
              <span className="text-[10px] text-muted-foreground/90 italic tracking-wide leading-none mt-0.5">
                Fresh food, delivered at Bonkers 🚀
              </span>
            </div>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-3">
            {/* Desktop cart icon */}
            <button
              type="button"
              className="hidden lg:flex relative items-center gap-2 px-4 py-2 rounded-full border-2 border-border bg-card hover:border-primary/40 hover:shadow-soft active:scale-95 transition-all duration-200"
              onClick={() => {
                const el = document.getElementById("order-sidebar");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              data-ocid="order.open_modal_button"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-foreground" />
                {cartTotalItems > 0 && (
                  <span
                    key={badgeAnimKey}
                    className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-accent text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 badge-pop"
                  >
                    {cartTotalItems}
                  </span>
                )}
              </div>
              {cartTotalItems > 0 && (
                <span className="text-sm font-semibold text-foreground hidden xl:block">
                  ₹{cartTotal}
                </span>
              )}
            </button>

            {/* Mobile cart icon */}
            <button
              type="button"
              className="lg:hidden relative p-2.5 rounded-2xl bg-muted hover:bg-secondary hover:scale-105 active:scale-95 transition-all duration-150"
              onClick={() => setShowOrderPanel((v) => !v)}
              data-ocid="order.open_modal_button"
            >
              <ShoppingCart className="w-5 h-5 text-foreground" />
              {cartTotalItems > 0 && (
                <span
                  key={badgeAnimKey}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-accent text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 badge-pop"
                >
                  {cartTotalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden flex items-center"
        style={{
          backgroundImage:
            'url("/assets/generated/hero-food-bg.dim_1400x600.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "340px",
        }}
      >
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, oklch(0.18 0.12 258 / 0.92) 0%, oklch(0.26 0.13 258 / 0.80) 55%, oklch(0.28 0.15 255 / 0.50) 100%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14 w-full">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white">
                Fresh food{" "}
                <span
                  className="font-black"
                  style={{ color: "oklch(0.78 0.20 45)" }}
                >
                  delivered
                </span>
                <br />
                to your desk
              </h1>
              <p className="mt-4 text-base text-white/75 max-w-md leading-relaxed">
                Order breakfast, lunch &amp; snacks from multiple restaurants —
                fresh to your desk every day.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="mt-6 flex flex-wrap gap-2"
            >
              {[
                { icon: "🏪", text: "Multiple restaurants" },
                { icon: "⚡", text: "Fresh daily" },
                { icon: "📱", text: "UPI payments" },
              ].map((chip) => (
                <span
                  key={chip.text}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm"
                  style={{
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    color: "rgba(255,255,255,0.92)",
                  }}
                >
                  <span>{chip.icon}</span>
                  {chip.text}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <main
        id="menu-section"
        className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8"
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Menu Column */}
          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Category Pill Tabs */}
              <div
                className="flex flex-wrap gap-2.5 mb-8"
                data-ocid="menu.tab"
                role="tablist"
                aria-label="Menu categories"
              >
                {CATEGORIES.map((cat) => {
                  const isActive = activeTab === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveTab(cat.key)}
                      data-ocid={`menu.${cat.key}.tab`}
                      className={[
                        "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none select-none",
                        isActive
                          ? "bg-primary text-white shadow-md scale-105 pill-active"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-primary/40 hover:text-primary hover:bg-primary/5 hover:scale-102",
                      ].join(" ")}
                    >
                      <span className="text-base leading-none">{cat.icon}</span>
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Breakfast Tab */}
              <TabsContent value="breakfast" className="mt-0">
                <div className="mb-6">
                  <label
                    htmlFor="restaurant-select"
                    className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5"
                  >
                    Select Restaurant
                  </label>
                  <RestaurantDropdown
                    id="restaurant-select"
                    value={selectedRestaurant}
                    options={RESTAURANTS}
                    placeholder="Choose a restaurant to view menu"
                    onChange={handleRestaurantChange}
                    ocid="breakfast.restaurant.select"
                  />
                </div>

                {!selectedRestaurant ? (
                  <div
                    className="flex flex-col items-center justify-center py-16 text-center"
                    data-ocid="breakfast.restaurant.empty_state"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-primary/8 flex items-center justify-center mb-4">
                      <span className="text-4xl">🏪</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1.5">
                      Please select a restaurant to view the menu
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Choose from Ruchi Cafe, Anna Cafe, Local Shop, or
                      Babu&apos;s Classic
                    </p>
                  </div>
                ) : (
                  <motion.div
                    key={selectedRestaurant}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex items-center gap-2.5 mb-5">
                      <span className="text-2xl">
                        {getRestaurantMeta(selectedRestaurant).emoji}
                      </span>
                      <h2 className="font-display text-lg font-bold text-foreground">
                        {selectedRestaurant}
                      </h2>
                      <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
                        {restaurantMenus[selectedRestaurant]?.length} items
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {(restaurantMenus[selectedRestaurant] ?? []).map(
                        (item, idx) => (
                          <InlineMenuCard
                            key={item.id}
                            item={item}
                            cartItem={getRestaurantCartItem(item.id)}
                            onAdd={handleRestaurantAdd}
                            onQtyChange={handleRestaurantQtyChange}
                            ocid={`breakfast.item.${idx + 1}`}
                            primaryBtnOcid={`breakfast.item.${idx + 1}.primary_button`}
                            secondaryBtnOcid={`breakfast.item.${idx + 1}.secondary_button`}
                          />
                        ),
                      )}
                    </div>
                  </motion.div>
                )}
              </TabsContent>

              {/* Lunch Tab */}
              <TabsContent value="lunch" className="mt-0">
                <div className="mb-6">
                  <label
                    htmlFor="lunch-restaurant-select"
                    className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5"
                  >
                    Select Restaurant
                  </label>
                  <RestaurantDropdown
                    id="lunch-restaurant-select"
                    value={selectedLunchRestaurant}
                    options={LUNCH_RESTAURANTS}
                    placeholder="Choose a restaurant for lunch"
                    onChange={handleLunchRestaurantChange}
                    ocid="lunch.restaurant.select"
                  />
                </div>

                {!selectedLunchRestaurant ? (
                  <div
                    className="flex flex-col items-center justify-center py-16 text-center"
                    data-ocid="lunch.restaurant.empty_state"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-primary/8 flex items-center justify-center mb-4">
                      <span className="text-4xl">🍛</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1.5">
                      Please select a restaurant to view the lunch menu
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Currently available: Ruchi Cafe, Anna Cafe, Local Shop
                    </p>
                  </div>
                ) : (
                  <motion.div
                    key={selectedLunchRestaurant}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex items-center gap-2.5 mb-5">
                      <span className="text-2xl">
                        {getRestaurantMeta(selectedLunchRestaurant).emoji}
                      </span>
                      <h2 className="font-display text-lg font-bold text-foreground">
                        {selectedLunchRestaurant}
                      </h2>
                      <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
                        {lunchMenus[selectedLunchRestaurant]?.length} items
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {(lunchMenus[selectedLunchRestaurant] ?? []).map(
                        (item, idx) => (
                          <InlineMenuCard
                            key={item.id}
                            item={item}
                            cartItem={getLunchCartItem(item.id)}
                            onAdd={handleLunchAdd}
                            onQtyChange={handleLunchQtyChange}
                            ocid={`lunch.item.${idx + 1}`}
                            primaryBtnOcid={`lunch.item.${idx + 1}.primary_button`}
                            secondaryBtnOcid={`lunch.item.${idx + 1}.secondary_button`}
                          />
                        ),
                      )}
                    </div>
                  </motion.div>
                )}
              </TabsContent>

              {/* Snacks Tab */}
              <TabsContent key="snacks" value="snacks" className="mt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {menuItems
                    .filter((item) => item.category === "snacks")
                    .map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        cartItem={getCartItem(item.id)}
                        onToggle={handleToggle}
                        onQtyChange={handleQtyChange}
                      />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-80 shrink-0" id="order-sidebar">
            <div className="sticky top-[80px]">
              <OrderSidebar
                cartItems={cart}
                restaurantCartItems={allRestaurantCartItems}
                form={form}
                onFormChange={handleFormChange}
                onSubmit={handleSubmit}
                formErrors={formErrors}
                submitted={false}
                isSubmitting={isSubmitting}
                orderError={orderError}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {showOrderPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setShowOrderPanel(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Order Panel (bottom sheet) */}
      <AnimatePresence>
        {showOrderPanel && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl border-t border-border shadow-xl max-h-[88vh] overflow-y-auto p-4 lg:hidden"
            data-ocid="order.sheet"
          >
            <div className="w-10 h-1.5 bg-border rounded-full mx-auto mb-5" />
            <OrderSidebar
              cartItems={cart}
              restaurantCartItems={allRestaurantCartItems}
              form={form}
              onFormChange={handleFormChange}
              onSubmit={handleSubmit}
              formErrors={formErrors}
              submitted={false}
              onBack={() => setShowOrderPanel(false)}
              isSubmitting={isSubmitting}
              orderError={orderError}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sticky Bottom Bar */}
      {cartTotalItems > 0 && !showOrderPanel && (
        <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden px-4 py-3">
          <button
            type="button"
            onClick={() => setShowOrderPanel(true)}
            className="w-full flex items-center justify-between bg-primary text-white px-5 py-3.5 rounded-2xl shadow-elevated hover:brightness-110 active:scale-[0.98] transition-all duration-150"
            data-ocid="order.open_modal_button"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {cartTotalItems} item{cartTotalItems > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">₹{cartTotal}</span>
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">
                View Order →
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessOverlay
            form={form}
            cartItems={allCartItemsForSuccess}
            total={cartTotal}
            onClose={handleNewOrder}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 text-center">
          <p className="text-xs text-muted-foreground">
            © {currentYear}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="underline hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
