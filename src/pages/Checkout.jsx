import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import axios from 'axios';

const Checkout = () => {
    const navigate = useNavigate();
    const { clearCart, cartTotal, cart } = useCart();
    const { isAuthenticated } = useAuth();

     const userID = localStorage.getItem('userid');

    const [address, setAddress] = useState({
        fullName: '',
        phone: '',
        postalCode: '',
        houseNo: '',
        area: '',
        landmark: '',
        city: '',
        state: '',
        country: '',
    });

    const [payment, setPayment] = useState({ 
        method: 'cod', 
        cardNumber: '', 
        expiry: '', 
        cvv: '',
        amount:'',
        currency:'INR',
        paymentMethod:'',
        paymentProvider:'',
        paymentStatus:'',
        transactionId:'',
        gatewayPaymentId:'',
        gatewayOrderId:'',
        paymentTime:'',
        failureReason:'',   
        refundStatus:'',
        refundedAmount:'',
    
    
    });



    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });
    const handlePaymentChange = (e) => setPayment({ ...payment, [e.target.name]: e.target.value });

    const validate = () => {
        if (!address.fullName || !address.houseNo || !address.city || !address.postalCode) {
            toast.error('Please complete the address fields');
            return false;
        }
        if (payment.method === 'card' && (!payment.cardNumber || !payment.expiry || !payment.cvv)) {
            toast.error('Please complete the card details');
            return false;
        }
        return true;
    };

     
    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error('Please login to place an order');
            navigate('/auth');
            return;
        }
        if (!validate()) return;
        setLoading(true);
        
        console.log('paayment details in checkout :', payment);
console.log('cart Items in checkout :', cart);

        const orderItems = cart.map(item => ({
    productId: item.id,
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: item.basePrice,
    totalPrice: item.basePrice * item.quantity,
}));

console.log('Order Items:', orderItems);

        const orderData = {
            userId: userID, // Replace with actual userId from auth context
        //    userId: 55, // Replace with actual userId from auth context
            orderNumber: `ORD-${Date.now()}`, // Generating a unique order number
            status: "PENDING",
            totalAmount: cartTotal,
            shippingAmount: 10.00, // You can set this dynamically based on the cart
            shippingFullname: address.fullName,
            shippingPhone: address.phone,
            shippingPincode: address.postalCode,
            shippingHouseNo: address.houseNo,
            shippingArea: address.area,
            shippingLandmark: address.landmark,
            shippingCity: address.city,
            shippingState: address.state,
            shippingCountry: address.country,
            orderItems

        };

        try {
            const response = await axios.post('http://localhost:9090/api/order/createOrderFromCart', orderData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Replace with the actual token
                },
            });
            if (response.status === 201) {
                clearCart();
            //    console.log('Order placed successfully:', response.data);
                navigate('/order-success');
                toast.success('Order placed successfully!');
            }
        } catch (err) {
            console.error('Place order error', err);
            toast.error('Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 ">
            <div className="max-w-7xl mx-auto px-4  text-center ">
                <div className="bg-white rounded-xl shadow-xl p-8 ">
                    <h1 className="text-2xl font-bold mb-6 text-center">Shipping Address</h1><br></br>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <Card className="mb-4 border-0 shadow-none">
                                <CardContent className="p-0">

                                    <form onSubmit={handlePlaceOrder}>
                                        <div className="grid grid-cols-1 gap-3 ">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3  text-center ">
                                                <div>
                                                    <label className="text-sm font-medium ">Full name (First and Last name) </label><br></br>
                                                    <input name="fullName" value={address.fullName} onChange={handleChange} placeholder="Full name (First and Last)" className="input text-center " />
                                                </div>
                                                <div >
                                                    <label className="text-sm font-medium">Mobile number</label><br></br>
                                                    <input name="phone" value={address.phone} onChange={handleChange} placeholder="Mobile number" className="input text-center" />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">Pincode</label><br></br>
                                                    <input name="postalCode" value={address.postalCode} onChange={handleChange} placeholder="6 digits [0-9] PIN code" className="input text-center" />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">Flat, House no., Building, Company, Apartment</label><br></br>
                                                    <input name="houseNo" value={address.houseNo} onChange={handleChange} placeholder="Flat / House no. / Building" className="input text-center" />
                                                </div>
                                                <div >
                                                    <label className="text-sm font-medium">Area, Street, Sector, Village</label><br></br>
                                                    <input name="area" value={address.area || ''} onChange={(e) => setAddress({ ...address, area: e.target.value })} placeholder="Area, Street, Sector, Village" className="input text-center" />
                                                </div>
                                                <div >
                                                    <label className="text-sm font-medium">Landmark (optional)</label><br></br>
                                                    <input name="landmark" value={address.landmark || ''} onChange={(e) => setAddress({ ...address, landmark: e.target.value })} placeholder="Landmark" className="input text-center" />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">Town / City</label><br></br>
                                                    <input name="city" value={address.city} onChange={handleChange} placeholder="Town / City" className="input text-center" />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">State / Province</label><br></br>
                                                    <input name="state" value={address.state} onChange={handleChange} placeholder="State / Province" className="input text-center" />
                                                </div>

                                                <div>
                                                    <label className="text-sm font-medium ">Country / Region </label><br></br>
                                                    <input name="country" value={address.country} onChange={handleChange} placeholder="Country / Region" className="input text-center " />
                                                </div>
                                            </div>
                                        </div>

                                        <h2 className="text-lg font-semibold mt-6 mb-3">Payment</h2>
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2">
                                                <input type="radio" name="method" checked={payment.method === 'cod'} onChange={() => setPayment({ ...payment, method: 'cod' })} />
                                                <span>Cash on Delivery</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="radio" name="method" checked={payment.method === 'card'} onChange={() => setPayment({ ...payment, method: 'card' })} />
                                                <span>Card</span>
                                            </label>

                                            {payment.method === 'card' && (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <input name="cardNumber" value={payment.cardNumber} onChange={handlePaymentChange} placeholder="Card number" className="input w-full md:col-span-2" />
                                                    <input name="expiry" value={payment.expiry} onChange={handlePaymentChange} placeholder="MM/YY" className="input w-full" />
                                                    <input name="cvv" value={payment.cvv} onChange={handlePaymentChange} placeholder="CVV" className="input w-full md:col-span-1" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-6">
                                            <Button type="submit" className="w-full" disabled={loading}>
                                                {loading ? 'Placing order...' : `Place order — ₹ ${cartTotal.toFixed(2)}`}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <Card className="sticky top-6 border-0 shadow-none">
                                <CardContent className="p-0">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                                        <div className="flex justify-between mb-2">
                                            <span>Items total</span>
                                            <span>₹ {cartTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="mt-4">
                                            <strong>Total</strong>
                                            <div className="text-xl font-bold">₹ {cartTotal.toFixed(2)}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
