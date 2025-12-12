import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("api/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Lỗi lấy sản phẩm:", err));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      {products.map((product) => (
        <div key={product.id} className="border rounded shadow p-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-56 object-cover mb-4"
          />
          <h2 className="text-xl font-bold">{product.name}</h2>
          <p className="text-green-600 font-semibold">{product.price.toLocaleString()}₫</p>
          <p className="text-gray-700 mt-2">{product.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
