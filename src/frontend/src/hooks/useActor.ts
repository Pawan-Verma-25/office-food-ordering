import { useActor as useCoreActor } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";

export interface OrderItem {
  itemName: string;
  quantity: bigint;
  price: bigint;
  category: string;
  restaurant: string;
}

export interface Order {
  id: bigint;
  name: string;
  department: string;
  phone: string;
  restaurantName: string;
  items: OrderItem[];
  totalAmount: bigint;
  timestamp: bigint;
  paymentScreenshot: string;
}

export interface AppActor {
  placeOrder: (
    name: string,
    department: string,
    phone: string,
    restaurantName: string,
    items: OrderItem[],
    totalAmount: bigint,
    paymentScreenshot: string,
  ) => Promise<Order>;
  getOrders: () => Promise<Order[]>;
}

// Wrap core useActor with our typed backend
export function useActor(): { actor: AppActor | null; isFetching: boolean } {
  // createActor signature matches createActorFunction<Backend>
  // We cast to AppActor since bindgen types may lag behind actual backend
  const { actor, isFetching } = useCoreActor(
    createActor as Parameters<typeof useCoreActor>[0],
  );
  return {
    actor: actor as unknown as AppActor | null,
    isFetching,
  };
}
