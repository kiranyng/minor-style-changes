import React, { useState, useEffect } from 'react';
    import { getProducts, getCategories } from '../utils/storage';
    import { FaFilter, FaSort, FaSortAlphaDown, FaSortAlphaUp, FaEdit } from 'react-icons/fa';
    import localforage from 'localforage';
    import { Link } from 'react-router-dom';

    function Products() {
      const [products, setProducts] = useState([]);
      const [categories, setCategories] = useState([]);
      const [currency, setCurrency] = useState('USD');
      const [selectedCategory, setSelectedCategory] = useState('all');
      const [sortOption, setSortOption] = useState('name');
      const [sortDirection, setSortDirection] = useState('asc');

      useEffect(() => {
        const fetchProducts = async () => {
          const products = await getProducts();
          setProducts(products);
        };
        const fetchCategories = async () => {
          const categories = await getCategories();
          setCategories(categories);
        };
        const fetchCurrency = async () => {
          const storedCurrency = await localforage.getItem('currency');
          if (storedCurrency) setCurrency(storedCurrency);
        };
        fetchProducts();
        fetchCategories();
        fetchCurrency();
      }, []);

      const formatCurrency = (amount) => {
        const formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
        });
        return formatter.format(amount);
      };

      const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
      };

      const handleSortChange = (e) => {
        setSortOption(e.target.value);
      };

      const handleSortDirectionChange = () => {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      };

      const filterAndSortProducts = () => {
        let filteredProducts = products;
        if (selectedCategory !== 'all') {
          filteredProducts = products.filter(product => product.category === selectedCategory);
        }

        filteredProducts.sort((a, b) => {
          let comparison = 0;
          if (sortOption === 'name') {
            comparison = a.name.localeCompare(b.name);
          } else if (sortOption === 'price') {
            comparison = a.price - b.price;
          } else if (sortOption === 'availableQuantity') {
            comparison = a.availableQuantity - b.availableQuantity;
          }
          return sortDirection === 'asc' ? comparison : -comparison;
        });

        return filteredProducts;
      };

      const groupedProducts = filterAndSortProducts().reduce((acc, product) => {
        if (!acc[product.category]) {
          acc[product.category] = [];
        }
        acc[product.category].push(product);
        return acc;
      }, {});

      return (
        <div className="dark:bg-gray-700 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold dark:text-gray-300">Products</h2>
          </div>
          <div className="flex items-center mb-4">
            <label className="mr-2 dark:text-gray-300 flex items-center">
              <FaFilter className="mr-1" />
            </label>
            <select value={selectedCategory} onChange={handleCategoryChange} className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
              <option value="all">All</option>
              {categories.map(category => (
                <option key={category.title} value={category.title}>{category.title}</option>
              ))}
            </select>
            <label className="ml-4 mr-2 dark:text-gray-300 flex items-center">
              <FaSort className="mr-1" />
            </label>
            <select value={sortOption} onChange={handleSortChange} className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="availableQuantity">Available Quantity</option>
            </select>
            <button onClick={handleSortDirectionChange} className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-2 rounded">
              {sortDirection === 'asc' ? <FaSortAlphaDown /> : <FaSortAlphaUp />}
            </button>
          </div>
          <div>
            {Object.entries(groupedProducts).map(([category, products]) => (
              <div key={category} className="mb-8">
                <h3 className="text-xl font-semibold mb-2 dark:text-gray-300">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product, index) => (
                    <div key={index} className="border p-2 flex flex-col dark:bg-gray-800 dark:border-gray-600">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold dark:text-gray-300">{product.name}</h3>
                        <Link to={`/products/edit/${product.name}`} className="text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-500">
                          <FaEdit className="text-lg" />
                        </Link>
                      </div>
                      <img src={product.image} alt={product.name} className="w-32 h-32 object-cover mb-2" />
                      <p className="dark:text-gray-300">Price: {formatCurrency(product.price)}</p>
                      <p className="dark:text-gray-300">Available Quantity: {product.availableQuantity}</p>
                      <p className="dark:text-gray-300">Raw Materials: {Object.entries(product.rawMaterials).map(([name, quantity]) => `${name}: ${quantity}`).join(', ')}</p>
                      <p className="dark:text-gray-300">Containers: {product.containers && product.containers.map(container => `${container.location}: ${container.quantity}`).join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    export default Products;
