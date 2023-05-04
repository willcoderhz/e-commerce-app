import React, { useState, useEffect } from 'react';
import axios from 'axios';
function Checkout() {
    const [cartItems, setCartItems] = useState([]);
  
    useEffect(() => {
      const fetchCartItems = async () => {
        try {
          const response = await axios.get('http://localhost:3001/cart');
          setCartItems(response.data);
        } catch (error) {
          console.error(error);
        }
      };
  
      fetchCartItems();
    }, []);
  
    return (
      // 在此处放置您的JSX代码，以显示购物车中的商品信息
    );
  }
  return (
    <div>
      <h1>Checkout</h1>
      <ul>
        {cartItems.map((item) => (
          <li key={item.id}>
            {item.name} - ${item.price} x {item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
  export default Checkout;
  import Checkout from './components/Checkout';

  // 在Switch组件中
  <Route path="/checkout" component={Checkout} />
  