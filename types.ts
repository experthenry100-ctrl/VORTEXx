export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'mouse' | 'keyboard' | 'headset' | 'monitor' | 'chair';
  image: string;
  description: string;
  specs: string[];
  rating: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered';
  date: string;
}

export type ViewState = 
  | 'home' 
  | 'shop' 
  | 'product-detail' 
  | 'cart' 
  | 'checkout' 
  | 'login' 
  | 'admin' 
  | 'profile';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}