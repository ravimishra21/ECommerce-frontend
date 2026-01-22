import React, { useEffect } from 'react';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const Cart = () => {
  const navigate = useNavigate();

  const { cart, serverCartData, setServerCartData, syncCartFromServer, updateQuantity,
         removeFromCart, cartTotal, clearCart } = useCart();

  const { isAuthenticated } = useAuth();

  // Sync cart data on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userid');

    // Only fetch cart data if the user is authenticated
    if (token && userId) {
      const fetchCartData = async () => {
        try {
          // Fetch the cart data from the server
          const res = await fetch(`http://localhost:9090/api/cart/findAllCartOfSpecificUser/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`, // Use the auth token for the request
            },
          });

          const data = await res.json();

          if (res.ok) {
            // Sync cart data with the context
            syncCartFromServer(data); // Sync the cart data to the context
          } else {
            console.error('Failed to load cart data:', data);
            toast.error('Failed to load cart data');
          }
        } catch (error) {
          console.error('Error loading cart data:', error);
          toast.error('Error syncing cart with server');
        }
      };

      fetchCartData(); // Call the function to fetch the cart data from the server
    }
  }, []); // Run this effect when `syncCartFromServer` changes


  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      navigate('/auth');
      return;
    }
    toast.success('Order placed successfully!');
  //  clearCart();
  //  navigate('/profile');
  };


  const handleUpdateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(cartId);
      return;
    }

    // Update local cart first
    updateQuantity(cartId, newQuantity);

    // Sync with server in the background
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`http://localhost:9090/api/cart/updateCartQuantity/${cartId}?quantity=${newQuantity}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error('Failed to update quantity on server:', await res.text());
        toast.error('Failed to update quantity on server');
      } else {
        // After successful update, fetch updated cart data of particular specific user from the server 
        const updatedCartData = await fetch(`http://localhost:9090/api/cart/findAllCartOfSpecificUser/${localStorage.getItem('userid')}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }).then(res => res.json());

        if (updatedCartData) {
          syncCartFromServer(updatedCartData); // Sync the updated cart data with the context
          toast.success('Quantity updated successfully on server');
        } else {
          toast.error('Failed to fetch updated cart data');
        }
      }
    } catch (error) {
      console.error('Error updating quantity on server:', error);
      toast.error('Error syncing cart with server');
    }
  };

  // Remove item from cart and delete it from server
  const handleRemoveItem = async (cartId) => {

    const token = localStorage.getItem('authToken');
  
    try {
      // API Call to delete cart item by cartId
      const res = await fetch(`http://localhost:9090/api/cart/deleteCartByCartId/${cartId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success('Item removed from cart');
        // Optionally, you can update the cart state here to remove the item
        removeFromCart(cartId); // If you want to immediately remove it from the local state
      } else {
        console.error('Failed to remove item from cart:', await res.json());
        toast.error('Failed to remove item from cart');
      }
    } catch (error) {
      console.error('Error while removing item:', error);
      toast.error('Error while removing item from cart');
    }
  };
  
  if (!Array.isArray(serverCartData) && serverCartData === null) {
    console.error('Expected serverCartData to be an array but got:', serverCartData);
    return <div>Failed to load cart data</div>;
  }


  if (serverCartData.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
        <Button onClick={() => navigate('/')}>Continue Shopping</Button>
      </div>
    );
  }

  console.log('Cart Items:', serverCartData); // Debugging: Log cart items

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {serverCartData.map((item) => (
            <Card key={item.id} className="mb-4">
              <CardContent className="p-4">
                <div className="grid grid-cols-[100px_1fr_auto] gap-4 items-center">
                  <img src={item.imageUrl} alt={item.productName} className="w-full object-contain" />
                  <div>
                    <h3 className="font-semibold mb-1">{item.productName}</h3>
                    <p className="text-xl font-normal">
                      ₹ {item.basePrice ? item.quantity * item.basePrice : '0.00'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex items-center gap-2 border rounded">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="min-w-[30px] text-center">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4 mr-1" />Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div>
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal ({serverCartData.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-xl font-bold mb-6">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="lg" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;

