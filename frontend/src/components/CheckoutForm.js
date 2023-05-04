import React from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';

const cartItems = [
  {
    id: 1,
    name: 'Product 1',
    price: 10,
    quantity: 1,
  },
  {
    id: 2,
    name: 'Product 2',
    price: 20,
    quantity: 2,
  },
];

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.error('[error]', error);
    } else {
      try {
        const response = await axios.post('http://localhost:3001/payment', {
          paymentMethodId: paymentMethod.id,
          cartItems: cartItems,
        });

        console.log('Payment successful:', response.data);
        // 处理付款成功后的操作，例如清空购物车，显示付款成功信息等
      } catch (error) {
        console.error('Payment failed:', error.message);
        // 处理付款失败后的操作，例如显示错误信息等
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Card details
        <CardElement />
      </label>
      <button type="submit" disabled={!stripe}>
        Pay
      </button>
    </form>
  );
}

export default CheckoutForm;

  