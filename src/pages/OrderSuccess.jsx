import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const OrderSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center px-4">
            <Card className="max-w-lg w-full shadow-xl rounded-2xl">
                <CardContent className="p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="text-green-500 w-16 h-16" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Order Placed Successfully 🎉
                    </h1>

                    <p className="text-gray-600 mb-6">
                        Thank you for your purchase! Your order has been placed successfully
                        and is now being processed.
                    </p>

                    <div className="bg-gray-100 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-700">
                            You will receive an order confirmation and delivery updates shortly.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button onClick={() => navigate('/cart')}>
                            View My Orders
                        </Button>

                        <Button variant="outline" onClick={() => navigate('/')}>
                            Continue Shopping
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OrderSuccess;
