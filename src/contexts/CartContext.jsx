import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {

  const [cart, setCart] = useState([]);
  const [serverCartCount, setServerCartCount] = useState(0); // Store server cart count
  const [serverCartData, setServerCartData] = useState([]); // Store cart data fetched from the server

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    // Immediately update local cart (localStorage-first UX)
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        toast.success('Updated quantity in cart');
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      toast.success('Added to cart');
      return [...prevCart, { ...product, quantity: 1 }];
    });

    // Fire-and-forget: try to sync with backend in the background. Do not block UX.
    (async () => {
      const token = localStorage.getItem('authToken');
      try {
        const userId = localStorage.getItem('userid'); // adjust if you store userId elsewhere

        const res = await fetch(`/api/cart/add/addToCart?userId=${encodeURIComponent(userId)}&productId=${encodeURIComponent(product.id)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.ok) {
          if (res.status === 200) {
            // Product is already in cart, show a message for update
            alert('Product already added to cart');
          } else if (res.status === 201) {
            // Product successfully added, show success message
            alert('Product added to cart successfully');
          }
        } else {
          // Log server-side error, but keep local cart state
          console.error(`Cart API error ${res.status} ${res.statusText}`);
          // Optionally show a non-blocking toast
          // toast.error('Could not sync cart with server');
        }
      } catch (error) {
        console.error('Network error while syncing cart:', error);
        // Do not revert local change; user remains able to use app offline.
      }
    })();
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    toast.success('Removed from cart');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    toast.success('Cart cleared');
  };

  // const cartTotal = cart.reduce((total, item) => total + (item.price ?? item.basePrice ?? 0) * item.quantity, 0);
  const cartTotal = serverCartData.reduce((total, item) => {
    // Ensure basePrice is valid and quantity is greater than 0
    const price = item.basePrice ? item.basePrice : 0;
    const quantity = item.quantity > 0 ? item.quantity : 1;
    return total + price * quantity;
  }, 0);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Method to sync cart from backend (called after login to update with server cart count)
  const syncCartFromServer = (cartData) => {
    setServerCartData(cartData);
    // Update the server cart count state
    setServerCartCount(cartData.length);
  };

  return (
    <CartContext.Provider
      value={{

        cart, addToCart, removeFromCart, updateQuantity,
        clearCart, cartTotal, cartCount, syncCartFromServer,
        serverCartCount, serverCartData, setServerCartData
        
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
