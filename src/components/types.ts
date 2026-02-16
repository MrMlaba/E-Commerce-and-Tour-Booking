// @/components/types.ts or @/types/orders.ts

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
  }
  
  export interface OrderProfile {
    first_name: string;
    last_name: string;
    email?: string;
  }
  
  export interface Order {
    id: string;
    order_number: string;
    status: string;
    total_amount: number;
    created_at: string;
    delivery_method: string;
    delivery_address?: string;
    phone?: string;
    payment_proof_url?: string;
    user_id?: string;
    items: OrderItem[];
    profiles: OrderProfile;
  }