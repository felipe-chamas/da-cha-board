// Derlivery Service Types
export interface DeliveryOrder {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_address: string
  items: OrderItem[]
  total_amount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
  delivery_date: string
  delivery_time_slot: string
  driver_id?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  notes?: string
}

export interface DeliveryDriver {
  id: string
  name: string
  phone: string
  vehicle_type: string
  is_active: boolean
  current_location?: {
    lat: number
    lng: number
  }
  created_at: string
  updated_at: string
}
