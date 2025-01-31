import React, { useState, useEffect, useRef } from 'react';
    import { getOrders, getProducts, getCategories, saveOrder, getRawMaterials } from '../utils/storage';
    import { FaShoppingCart, FaTruck, FaChevronLeft, FaChevronRight, FaFilter, FaSort, FaSortAlphaDown, FaSortAlphaUp, FaTimes } from 'react-icons/fa';
    import localforage from 'localforage';
    import { v4 as uuidv4 } from 'uuid';

    function Orders() {
      const [products, setProducts] = useState([]);
      const [orders, setOrders] = useState([]);
      const [droppedProducts, setDroppedProducts] = useState({});
      const [totalPrice, setTotalPrice] = useState(0);
      const [totalProfit, setTotalProfit] = useState(0);
      const dropZoneRef = useRef(null);
      const [categories, setCategories] = useState([]);
      const [currency, setCurrency] = useState('USD');
      const [quantities, setQuantities] = useState({});
      const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
      const [selectedCategory, setSelectedCategory] = useState('all');
      const [sortOption, setSortOption] = useState('name');
      const [sortDirection, setSortDirection] = useState('asc');

      useEffect(() => {
        const fetchProducts = async () => {
          const products = await getProducts();
          setProducts(products);
        };
        const fetchOrders = async () => {
          const orders = await getOrders();
          setOrders(orders);
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
        fetchOrders();
        fetchCategories();
        fetchCurrency();
      }, []);

      const calculatePriceAndProfit = async (products) => {
        let price = 0;
        let profit = 0;
        const rawMaterials = await getRawMaterials();

        products.forEach(product => {
          price += product.price * product.quantity;
          let cost = 0;
          for (const materialName in product.rawMaterials) {
            const material = rawMaterials.find(mat => mat.name === materialName);
            if (material) {
              cost += material.pricePerUnit * product.rawMaterials[materialName] * product.quantity;
            }
          }
          profit += (product.price - cost) * product.quantity;
        });
        setTotalPrice(price);
        setTotalProfit(profit);
      };

      const handlePlaceOrder = async () => {
        if (Object.keys(droppedProducts).length === 0) return;
      
        const orderId = uuidv4();
        const orderDate = new Date().toISOString();
        const newOrderItems = [];
      
        // Group order items by product and calculate batches
        for (const productName in droppedProducts) {
          const product = products.find(p => p.name === productName);
          const quantity = droppedProducts[productName];
          const defaultBatchSize = product.defaultBatchSize || 1;
          const numBatches = Math.ceil(quantity / defaultBatchSize);
      
          for (let i = 0; i < numBatches; i++) {
            const batchQuantity = i === numBatches - 1 ? quantity - i * defaultBatchSize : defaultBatchSize;
            newOrderItems.push({
              orderItemId: uuidv4(),
              orderId,
              productName: product.name,
              productId: product.id,
              status: 'Pending',
              date: orderDate,
              containerId: '',
              price: product.price,
              quantity: batchQuantity,
            });
          }
        }
      
        const newOrder = {
          orderId,
          orderItems: newOrderItems,
          orderDate,
          source: 'placed',
        };
      
        await saveOrder(newOrder);
        setOrders([...orders, newOrder]);
        setDroppedProducts({});
        setTotalPrice(0);
        setTotalProfit(0);
      
        // Dispatch a custom event to notify other components about the new order
        window.dispatchEvent(new Event('newOrderPlaced'));
      };

      const handleShipOrder = async () => {
        if (Object.keys(droppedProducts).length === 0) return;

        const orderId = uuidv4();
        const orderDate = new Date().toISOString();
        const newOrderItems = [];

        // Group order items by product and calculate batches
        for (const productName in droppedProducts) {
          const product = products.find(p => p.name === productName);
          const quantity = droppedProducts[productName];
          const defaultBatchSize = product.defaultBatchSize || 1;
          const numBatches = Math.ceil(quantity / defaultBatchSize);

          for (let i = 0; i < numBatches; i++) {
            const batchQuantity = i === numBatches - 1 ? quantity - i * defaultBatchSize : defaultBatchSize;
            newOrderItems.push({
              orderItemId: uuidv4(),
              orderId,
              productName: product.name,
              productId: product.id,
              status: 'Shipped',
              date: orderDate,
              containerId: '',
              price: product.price,
              quantity: batchQuantity,
            });
          }
        }

        const newOrder = {
          orderId,
          orderItems: newOrderItems,
          orderDate,
          source: 'shipped',
        };

        await saveOrder(newOrder);
        setOrders([...orders, newOrder]);
        setDroppedProducts({});
        setTotalPrice(0);
        setTotalProfit(0);
      };

      const clearDropZone = () => {
        setDroppedProducts({});
        setTotalPrice(0);
        setTotalProfit(0);
      };

      const formatCurrency = (amount) => {
        const formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
        });
        return formatter.format(amount);
      };

      const handleQuantityChange = (e, product) => {
        setQuantities({ ...quantities, [product.name]: parseInt(e.target.value, 10) });
      };

      const handleAddProduct = (product) => {
        const quantityToAdd = quantities[product.name] || 1;
        setDroppedProducts(prev => {
          const newProducts = { ...prev };
          newProducts[product.name] = (newProducts[product.name] || 0) + quantityToAdd;
          calculatePriceAndProfit(Object.keys(newProducts).map(key => ({ ...product, quantity: newProducts[key] })));
          return newProducts;
        });
        setQuantities({ ...quantities, [product.name]: '' });
      };

      const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
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
        <div className="flex">
          <div className={`p-4 ${isSidebarCollapsed ? 'w-full' : 'w-1/2'}`}>
            <h2 className="text-2xl font-bold mb-4 dark:text-gray-300">Products</h2>
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
            {Object.entries(groupedProducts).map(([category, products]) => (
              <div key={category} className="mb-8">
                <h3 className="text-xl font-semibold mb-2 dark:text-gray-300">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <div
                      key={product.name}
                      className="border p-2 flex flex-col"
                    >
                      <h3 className="font-bold">{product.name}</h3>
                      <img src={product.image} alt={product.name} className="w-24 h-24 object-cover mb-2" />
                      <p>Price: {formatCurrency(product.price)}</p>
                      <div className="flex items-center mt-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          value={quantities[product.name] || ''}
                          onChange={(e) => handleQuantityChange(e, product)}
                          className="border p-1 mr-2 w-16"
                        />
                        <button onClick={() => handleAddProduct(product)} className="bg-blue-500 text-white p-1 rounded">Add</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className={`p-4 ${isSidebarCollapsed ? 'w-24' : 'w-1/2'}`}>
            <div className="flex justify-between items-center mb-4">
              {!isSidebarCollapsed && <h2 className="text-2xl font-bold dark:text-gray-300">Order List</h2>}
              <button onClick={toggleSidebar} className="focus:outline-none">
                {isSidebarCollapsed ? <FaChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-300" /> : <FaChevronRight className="h-6 w-6 text-gray-700 dark:text-gray-300" />}
              </button>
            </div>
            <div
              ref={dropZoneRef}
              className={`border-2 border-dashed border-gray-400 p-4 min-h-[200px] mb-4 flex flex-col`}
            >
              {Object.keys(droppedProducts).length === 0 ? (
                <p className={`text-gray-500 text-center ${isSidebarCollapsed ? 'hidden' : ''}`}>Add products to create an order</p>
              ) : (
                <ul className={`space-y-2 flex-grow ${isSidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
                  {Object.entries(droppedProducts).map(([productName, quantity]) => {
                    const product = products.find(p => p.name === productName);
                    return (
                      <li key={productName} className={`flex items-center ${isSidebarCollapsed ? 'flex-col' : ''}`}>
                        {product && <img src={product.image} alt={productName} className={`w-8 h-8 object-cover ${isSidebarCollapsed ? 'mb-1' : 'mr-2'}`} />}
                        {isSidebarCollapsed ? (
                          <span className="badge badge-primary">{quantity}</span>
                        ) : (
                          <>
                            <span>{productName}</span>
                            <span className="badge badge-primary ml-2">{quantity}</span>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
              {!isSidebarCollapsed && (
                <div className="mb-2">
                  <p>Total Price: {formatCurrency(totalPrice)}</p>
                  <p>Total Profit: {formatCurrency(totalProfit)}</p>
                </div>
              )}
              <div className={`flex ${isSidebarCollapsed ?'flex-col items-center' : 'justify-between'} mt-2`}>
                <button onClick={handlePlaceOrder} className={`bg-blue-500 text-white p-2 rounded ${isSidebarCollapsed ? 'mb-2' : ''} flex items-center justify-center`}>
                  {isSidebarCollapsed ? <FaShoppingCart className="h-4 w-4" /> : <><FaShoppingCart className="mr-2" />Place Order</>}
                </button>
                <button onClick={handleShipOrder} className={`bg-green-500 text-white p-2 rounded ${isSidebarCollapsed ? 'mb-2' : ''} flex items-center justify-center`}>
                  {isSidebarCollapsed ? <FaTruck className="h-4 w-4" /> : <><FaTruck className="mr-2" />Ship Order</>}
                </button>
                <button onClick={clearDropZone} className={`bg-gray-300 text-gray-700 p-2 rounded flex items-center justify-center`}>
                  {isSidebarCollapsed ? <FaTimes className="h-4 w-4" /> : 'Clear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    export default Orders;
