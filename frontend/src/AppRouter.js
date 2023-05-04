import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Register from './components/Register';
import Login from './components/Login';
import ProductDetails from './components/ProductDetails';
import ProductList from './components/ProductList';
import Checkout from './components/Checkout';
import OrderHistory from './components/OrderHistory';

function AppRouter() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/product/:id" component={ProductDetails} />
        <Route path="/products" component={ProductList} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/order-history" component={OrderHistory} />
      </Switch>
    </Router>
  );
}

export default AppRouter;