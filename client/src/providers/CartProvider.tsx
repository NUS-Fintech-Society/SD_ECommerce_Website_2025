import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface CartItem {
  listingId: string;
  title: string;
  image: string;
  specification: {
    colour: string;
    size: string;
    quantity: string;
  };
  deliveryMethod: "shipping" | "selfCollection";
  quantity: number;
  price: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (
    listingId: string,
    specification: CartItem["specification"]
  ) => void;
  updateQuantity: (
    listingId: string,
    specification: CartItem["specification"],
    quantity: number
  ) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "cart_items";

export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage if available
  const [items, setItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (newItem: CartItem) => {
    setItems((currentItems) => {
      // Check if item already exists in cart
      const existingItemIndex = currentItems.findIndex(
        (item) =>
          item.listingId === newItem.listingId &&
          item.specification.colour === newItem.specification.colour &&
          item.specification.size === newItem.specification.size
      );

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const updatedItems = [...currentItems];
        const existingItem = updatedItems[existingItemIndex];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + newItem.quantity,
        };
        return updatedItems;
      }

      // Add new item if it doesn't exist
      return [...currentItems, newItem];
    });
  };

  const removeFromCart = (
    listingId: string,
    specification: CartItem["specification"]
  ) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          !(
            item.listingId === listingId &&
            item.specification.colour === specification.colour &&
            item.specification.size === specification.size
          )
      )
    );
  };

  const updateQuantity = (
    listingId: string,
    specification: CartItem["specification"],
    quantity: number
  ) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.listingId === listingId &&
        item.specification.colour === specification.colour &&
        item.specification.size === specification.size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use the cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
