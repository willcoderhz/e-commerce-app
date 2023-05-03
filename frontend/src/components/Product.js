import React from 'react';

function Product({ product }) {
  return (
    <li>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <img src={product.image} alt={product.name} />
    </li>
  );
}

export default Product;
