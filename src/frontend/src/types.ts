export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "breakfast" | "lunch" | "snacks";
  image: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  category: string;
}

export interface OrderForm {
  name: string;
  department: string;
  phone: string;
  restaurantName: string;
}

export interface RestaurantMenuItem {
  id: string;
  name: string;
  price: number;
  category: "Breakfast" | "Lunch" | "Snacks";
  image?: string;
}

export interface RestaurantCartItem {
  item: RestaurantMenuItem;
  quantity: number;
  category: string;
}
