import React, { useState, useEffect } from 'react';
    import { getOrders, getProducts, getCategories, saveProduct } from '../utils/storage';
    import localforage from 'localforage';
    import { FaChevronDown, FaChevronUp, FaTruck, FaShoppingCart } from 'react-icons/fa';
    import { v4 as uuidv4 } from 'uuid';

    function Production() {
      const [orders, setOrders] = useState([]);
      const [products, setProducts] = useState([]);
      const [categories, setCategories] = useState([]);
      const [productionStatus, setProductionStatus] = useState({});
      const [currency, setCurrency] = useState('USD');
      const [containerId, setContainerId] = useState('');
      const [selectedProduct, setSelectedProduct] = useState(null);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [productContainers, setProductContainers] = useState([]);
      const [batchSize, setBatchSize] = useState(1);
      const [isShipFromInventoryModalOpen, setIsShipFromInventoryModalOpen] = useState(false);
      const [selectedShipContainer, setSelectedShipContainer] = useState('');

      useEffect(() => {
        const fetchOrders = async () => {
          const orders = await getOrders();
          setOrders(orders);
        };
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
        const fetchProductionStatus = async () => {
          const storedStatus = await localforage.getItem('productionStatus');
          if (storedStatus) setProductionStatus(storedStatus);
        };
        fetchOrders();
        fetchProducts();
        fetchCategories();
        fetchCurrency();
        fetchProductionStatus();

        const handleNewOrder = () => {
          fetchOrders();
        };

        window.addEventListener('newOrderPlaced', handleNewOrder);

        return () => {
          window.removeEventListener('newOrderPlaced', handleNewOrder);
        };
      }, []);

      const getProductManufacturingSteps = (productName) => {
        const product = products.find(p => p.name === productName);
        if (product) {
          const category = categories.find(c => c.title === product.category);
          return category ? category.manufacturingStages : [];
        }
        return [];
      };

      const handleCheckboxChange = async (productName, orderId, orderItemId, stepIndex, checked) => {
        setProductionStatus(prevStatus => {
          const newStatus = { ...prevStatus };
          if (!newStatus[productName]) {
            newStatus[productName] = {};
          }
          if (!newStatus[productName][orderId]) {
            newStatus[productName][orderId] = {};
          }
          if (!newStatus[productName][orderId][orderItemId]) {
            newStatus[productName][orderId][orderItemId] = new Map();
          }
          newStatus[productName][orderId][orderItemId].set(stepIndex, checked);
          localforage.setItem('productionStatus', newStatus);
          return newStatus;
        });
      };

      const isOrderComplete = (productName, orderId, orderItemId, steps) => {
        if (!productionStatus[productName] || !productionStatus[productName][orderId] || !productionStatus[productName][orderId][orderItemId]) {
          return false;
        }
        return steps.every((_, stepIndex) => productionStatus[productName][orderId][orderItemId].get(stepIndex));
      };

      const handleAction = async (order, orderItem, itemIndex) => {
        if (order.source === 'shipped') {
          const products = await localforage.getItem('products') || [];
          const product = products.find(p => p.name === orderItem.productName);
          if (product && product.containers) {
            setProductContainers(product.containers.map(c => c.location));
          } else {
            setProductContainers([]);
          }
          setSelectedProduct({ productName: orderItem.productName, order, itemIndex, orderItemId: orderItem.orderItemId, defaultBatchSize: product?.defaultBatchSize || 1, quantity: orderItem.quantity, orderId: order.orderId, productId: product.id });
          setIsShipFromInventoryModalOpen(true);
        } else if (order.source === 'placed') {
          const products = await localforage.getItem('products') || [];
          const product = products.find(p => p.name === orderItem.productName);
          if (product && product.containers) {
            setProductContainers(product.containers.map(c => c.location));
          } else {
            setProductContainers([]);
          }
          setSelectedProduct({ productName: orderItem.productName, order, itemIndex, orderItemId: orderItem.orderItemId, defaultBatchSize: product?.defaultBatchSize || 1, productId: product.id });
          setIsModalOpen(true);
          setBatchSize(product?.defaultBatchSize || 1);
        }
      };

      const handleAddToInventory = async () => {
        if (!selectedProduct) return;
        const { productName, order, itemIndex, orderItemId, defaultBatchSize, productId } = selectedProduct;
        const products = await localforage.getItem('products') || [];
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
          const product = products[productIndex];
          const updatedProduct = {
            ...product,
            availableQuantity: (parseFloat(product.availableQuantity) || 0) + batchSize,
            containers: (product.containers || []).map(container => {
              if (container.location === containerId) {
                return { ...container, quantity: parseFloat(container.quantity) + batchSize };
              }
              return container;
            }),
          };
          products[productIndex] = updatedProduct;
          await localforage.setItem('products', products);
          setProducts(products);

          // Create a new transaction with the updated structure
          const newTransaction = {
            id: uuidv4(),
            type: 'inventory_update',
            status: 'completed',
            date: new Date().toISOString(),
            metadata: {
              productName: productName,
              quantity: batchSize,
              containerId: containerId,
              action: 'add',
              productId: productId,
            }
          };

          const transactions = await localforage.getItem('transactions') || [];
          await localforage.setItem('transactions', [...transactions, newTransaction]);

          alert(`Product ${productName} added to container ${containerId} and inventory.`);
          setContainerId('');
          setIsModalOpen(false);
          setBatchSize(defaultBatchSize);

          // Update order status in local storage
          const updatedOrders = orders.map(prevOrder => {
            if (prevOrder.orderId === order.orderId) {
              const updatedOrderItems = prevOrder.orderItems.map(item => {
                if (item.orderItemId === orderItemId) {
                  return { ...item, status: 'complete-inventory-updated' };
                }
                return item;
              });
              return { ...prevOrder, orderItems: updatedOrderItems };
            }
            return prevOrder;
          });
          setOrders(updatedOrders);
          await localforage.setItem('orders', updatedOrders);

          // Update production status to mark all steps as completed
          setProductionStatus(prevStatus => {
            const newStatus = { ...prevStatus };
            if (newStatus[productName] && newStatus[productName][order.orderId]) {
              const steps = getProductManufacturingSteps(productName);
              steps.forEach((_, stepIndex) => {
                if (!newStatus[productName][order.orderId][orderItemId]) {
                  newStatus[productName][order.orderId][orderItemId] = new Map();
                }
                newStatus[productName][order.orderId][orderItemId].set(stepIndex, true);
              });
            }
            localforage.setItem('productionStatus', newStatus);
            return newStatus;
          });
        }
      };

      const handleShipOrder = async (order, orderItem, itemIndex) => {
        if (!order || !orderItem) return;
        const { productName, orderId, orderItemId, quantity, productId } = orderItem;

        // Create a new transaction with the updated structure
        const newTransaction = {
          id: uuidv4(),
          type: 'order_shipped',
          status: 'completed',
          date: new Date().toISOString(),
          metadata: {
            productName: productName,
            orderId: orderId,
            orderItemId: orderItemId,
            action: 'ship',
            quantity: quantity,
            productId: productId,
          }
        };

        const transactions = await localforage.getItem('transactions') || [];
        await localforage.setItem('transactions', [...transactions, newTransaction]);

        const updatedOrders = orders.map(prevOrder => {
          if (prevOrder.orderId === order.orderId) {
            const updatedOrderItems = prevOrder.orderItems.map(item => {
              if (item.orderItemId === orderItemId) {
                return { ...item, status: 'complete-shipped' };
              }
              return item;
            });
            return { ...prevOrder, orderItems: updatedOrderItems };
          }
          return prevOrder;
        });
        setOrders(updatedOrders);
        await localforage.setItem('orders', updatedOrders);
        alert(`Product ${productName} has been shipped.`);
      };

      const handleShipFromInventory = async () => {
        if (!selectedProduct) return;
        const { productName, order, itemIndex, orderItemId, quantity, orderId, productId } = selectedProduct;
        const products = await localforage.getItem('products') || [];
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
          const product = products[productIndex];
          const updatedProduct = {
            ...product,
            availableQuantity: (parseFloat(product.availableQuantity) || 0) - quantity,
            containers: (product.containers || []).map(container => {
              if (container.location === selectedShipContainer) {
                return { ...container, quantity: parseFloat(container.quantity) - quantity };
              }
              return container;
            }),
          };
          products[productIndex] = updatedProduct;
          await localforage.setItem('products', products);
          setProducts(products);

          // Create a new transaction with the updated structure
          const newTransaction = {
            id: uuidv4(),
            type: 'order_shipped',
            status: 'completed',
            date: new Date().toISOString(),
            metadata: {
              productName: productName,
              quantity: quantity,
              containerId: selectedShipContainer,
              action: 'ship',
              orderId: orderId,
              orderItemId: orderItemId,
              productId: productId,
            }
          };

          const transactions = await localforage.getItem('transactions') || [];
          await localforage.setItem('transactions', [...transactions, newTransaction]);

          alert(`Product ${productName} shipped from container ${selectedShipContainer} and inventory.`);
          setSelectedShipContainer('');
          setIsShipFromInventoryModalOpen(false);

          // Update order status in local storage
          const updatedOrders = orders.map(prevOrder => {
            if (prevOrder.orderId === order.orderId) {
              const updatedOrderItems = prevOrder.orderItems.map(item => {
                if (item.orderItemId === orderItemId) {
                  return { ...item, status: 'complete-shipped' };
                }
                return item;
              });
              return { ...prevOrder, orderItems: updatedOrderItems };
            }
            return prevOrder;
          });
          setOrders(updatedOrders);
          await localforage.setItem('orders', updatedOrders);

          // Update production status to mark all steps as completed
          setProductionStatus(prevStatus => {
            const newStatus = { ...prevStatus };
            if (newStatus[productName] && newStatus[productName][order.orderId]) {
              const steps = getProductManufacturingSteps(productName);
              steps.forEach((_, stepIndex) => {
                if (!newStatus[productName][order.orderId][orderItemId]) {
                  newStatus[productName][order.orderId][orderItemId] = new Map();
                }
                newStatus[productName][order.orderId][orderItemId].set(stepIndex, true);
              });
            }
            localforage.setItem('productionStatus', newStatus);
            return newStatus;
          });
        }
      };

      const handleCancelModal = () => {
        setIsModalOpen(false);
        setContainerId('');
        setBatchSize(selectedProduct?.defaultBatchSize || 1);
      };

      const handleCancelShipFromInventoryModal = () => {
        setIsShipFromInventoryModalOpen(false);
        setSelectedShipContainer('');
      };

      const formatCurrency = (amount) => {
        const formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
        });
        return formatter.format(amount);
      };

      const getBatchColor = (orderId) => {
        const colors = ['bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-pink-200'];
        const orderIds = orders.map(order => order.orderId);
        const orderIndex = orderIds.indexOf(orderId);
        return colors[orderIndex % colors.length];
      };

      const getGroupedOrders = () => {
        return orders.reduce((acc, order) => {
          order.orderItems.forEach((orderItem) => {
            if (orderItem.status !== 'complete-shipped' && orderItem.status !== 'complete-inventory-updated') {
              if (!acc[orderItem.productName]) {
                acc[orderItem.productName] = [];
              }
              acc[orderItem.productName].push({ order, orderItem });
            }
          });
          return acc;
        }, {});
      };

      const groupedOrders = getGroupedOrders();

      return (
        <div className="dark:bg-gray-700 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold dark:text-gray-300">Production</h2>
          </div>
          {Object.entries(groupedOrders).map(([productName, items]) => (
            <div key={productName} className="mb-8">
              <h3 className="text-xl font-semibold mb-2 dark:text-gray-300">Product: {productName}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                  <thead>
                    <tr>
                      <th className="border p-2 dark:border-gray-600 dark:text-gray-300">Batch</th>
                      <th className="border p-2 dark:border-gray-600 dark:text-gray-300">Order ID</th>
                      <th className="border p-2 dark:border-gray-600 dark:text-gray-300">Item ID</th>
                      {getProductManufacturingSteps(productName).map((step, stepIndex) => (
                        <th key={stepIndex} className="border p-2 dark:border-gray-600 dark:text-gray-300">{step}</th>
                      ))}
                      <th className="border p-2 dark:border-gray-600 dark:text-gray-300">Status</th>
                      <th className="border p-2 dark:border-gray-600 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(({ order, orderItem, itemIndex }) => {
                      const batchColor = getBatchColor(order.orderId);
                      const steps = getProductManufacturingSteps(orderItem.productName);
                      return (
                        <React.Fragment key={orderItem.orderItemId}>
                          <tr>
                            <td className={`border p-2 ${batchColor} relative dark:border-gray-600 dark:text-gray-300 z-10`}>
                              <span className="font-bold">{new Date(order.orderDate).toLocaleTimeString()}</span>
                              <div className="absolute top-0 left-0 p-1 text-xs bg-gray-700 text-white rounded opacity-0 hover:opacity-100 transition-opacity duration-200">
                                Batch: {new Date(order.orderDate).toLocaleString()}
                              </div>
                            </td>
                            <td className="border p-2 dark:border-gray-600 dark:text-gray-300">{order.orderId}</td>
                            <td className="border p-2 dark:border-gray-600 dark:text-gray-300">{orderItem.orderItemId}</td>
                            {steps.map((step, stepIndex) => (
                              <td key={stepIndex} className="border p-2 text-center dark:border-gray-600">
                                <input
                                  type="checkbox"
                                  id={`${orderItem.orderItemId}-${stepIndex}`}
                                  checked={productionStatus[orderItem.productName]?.[order.orderId]?.[orderItem.orderItemId]?.get(stepIndex) || false}
                                  onChange={(e) => handleCheckboxChange(orderItem.productName, order.orderId, orderItem.orderItemId, stepIndex, e.target.checked)}
                                />
                              </td>
                            ))}
                            <td className="border p-2 text-center dark:border-gray-600 dark:text-gray-300">
                              {isOrderComplete(orderItem.productName, order.orderId, orderItem.orderItemId, steps) ? 'Completed' : 'In Progress'}
                            </td>
                            <td className="border p-2 text-center dark:border-gray-600 dark:text-gray-300">
                              {order.source === 'shipped' ? (
                                <div className="flex flex-col">
                                  <button
                                    onClick={() => handleShipOrder(order, orderItem, itemIndex)}
                                    className={`bg-blue-500 text-white p-1 rounded ${!isOrderComplete(orderItem.productName, order.orderId, orderItem.orderItemId, steps) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={!isOrderComplete(orderItem.productName, order.orderId, orderItem.orderItemId, steps)}
                                  >
                                    Ship
                                  </button>
                                  <button
                                    onClick={() => handleAction(order, orderItem, itemIndex)}
                                    className={`bg-blue-500 text-white p-1 rounded`}
                                  >
                                    Ship from Inventory
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleAction(order, orderItem, itemIndex)}
                                  className={`bg-green-500 text-white p-1 rounded ${!isOrderComplete(orderItem.productName, order.orderId, orderItem.orderItemId, steps) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  disabled={!isOrderComplete(orderItem.productName, order.orderId, orderItem.orderItemId, steps)}
                                >
                                  Add to Inventory
                                </button>
                              )}
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {isModalOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4 dark:text-gray-300">Select Container ID</h3>
                <select
                  value={containerId}
                  onChange={(e) => setContainerId(e.target.value)}
                  className="border p-2 mb-4 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                >
                  <option value="">Select a container</option>
                  {productContainers.map((container, index) => (
                    <option key={index} value={container}>{container}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Batch Size"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value, 10))}
                  className="border p-2 mb-4 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                />
                <div className="flex justify-end">
                  <button onClick={handleAddToInventory} className="bg-blue-500 text-white p-2 rounded mr-2">Add to Inventory</button>
                  <button onClick={handleCancelModal} className="bg-gray-300 text-gray-700 p-2 rounded dark:bg-gray-700 dark:text-gray-300">Cancel</button>
                </div>
              </div>
            </div>
          )}
          {isShipFromInventoryModalOpen && selectedProduct && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4 dark:text-gray-300">Ship from Inventory</h3>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Select Container</label>
                  <select
                    value={selectedShipContainer}
                    onChange={(e) => setSelectedShipContainer(e.target.value)}
                    className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  >
                    <option value="">Select a container</option>
                    {productContainers.map((container, index) => (
                      <option key={index} value={container}>{container}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Quantity</label>
                  <input
                    type="number"
                    value={selectedProduct.quantity}
                    readOnly
                    className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  />
                </div>
                <div className="flex justify-end">
                  <button onClick={handleShipFromInventory} disabled={!selectedShipContainer} className={`bg-blue-500 text-white p-2 rounded mr-2 ${!selectedShipContainer ? 'opacity-50 cursor-not-allowed' : ''}`}>Ship from Inventory</button>
                  <button onClick={handleCancelShipFromInventoryModal} className="bg-gray-300 text-gray-700 p-2 rounded dark:bg-gray-700 dark:text-gray-300">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    export default Production;
