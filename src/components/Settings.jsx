import React, { useState, useEffect } from 'react';
    import localforage from 'localforage';
    import {
      saveRawMaterial,
      saveProduct,
      saveOrder,
      saveCategory,
      saveSupplier,
      getCategories,
    } from '../utils/storage';
    import { v4 as uuidv4 } from 'uuid';

    function Settings() {
      const [currency, setCurrency] = useState('USD');
      const [theme, setTheme] = useState('light');
      const [showConfirmation, setShowConfirmation] = useState(false);

      useEffect(() => {
        const fetchSettings = async () => {
          const storedCurrency = await localforage.getItem('currency');
          const storedTheme = await localforage.getItem('theme');
          if (storedCurrency) setCurrency(storedCurrency);
          if (storedTheme) {
            setTheme(storedTheme);
            if (storedTheme === 'dark') {
              document.documentElement.classList.add('dark');
            }
          }
        };
        fetchSettings();
      }, []);

      const handleCurrencyChange = async (e) => {
        const newCurrency = e.target.value;
        setCurrency(newCurrency);
        await localforage.setItem('currency', newCurrency);
      };

      const handleThemeChange = async (e) => {
        const newTheme = e.target.value;
        setTheme(newTheme);
        await localforage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };

      const handleResetData = () => {
        setShowConfirmation(true);
      };

      const confirmResetData = async () => {
        await localforage.clear();
        setShowConfirmation(false);
        alert('All data has been reset.');
        window.location.reload();
      };

      const cancelResetData = () => {
        setShowConfirmation(false);
      };

      const insertDummyData = async () => {
        await localforage.clear();

        let rawMaterials = [];
        let categories = [];
        let products = [];
        let orders = [];
        let suppliers = [];
        let transactions = [];

          rawMaterials = Array.from({ length: 20 }, (_, i) => ({
            name: `Raw Material ${i + 1}`,
            unit: ['meter', 'piece', 'kg', 'liter', 'sqft'][i % 5],
            pricePerUnit: Math.random() * 10 + 1,
            availableQuantity: Math.floor(Math.random() * 10000),
            id: uuidv4(),
          }));
          categories = Array.from({ length: 5 }, (_, i) => ({
            title: `Category ${i + 1}`,
            description: `Description for Category ${i + 1}`,
            manufacturingStages: ['Design', 'Cut', 'Sew', 'Assemble', 'Package'].slice(0, Math.floor(Math.random() * 5) + 1),
            id: uuidv4(),
          }));
          products = Array.from({ length: 40 }, (_, i) => ({
            name: `Product ${i + 1}`,
            image: 'https://via.placeholder.com/150',
            price: Math.random() * 100 + 10,
            rawMaterials: rawMaterials.slice(0, Math.floor(Math.random() * 5) + 1).reduce((acc, material) => ({ ...acc, [material.name]: Math.floor(Math.random() * 10) + 1 }), {}),
            category: categories[i % categories.length].title,
            availableQuantity: Math.floor(Math.random() * 500),
            containers: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({ location: `Warehouse ${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`, quantity: Math.floor(Math.random() * 100) })),
            defaultBatchSize: Math.floor(Math.random() * 20) + 1,
            id: uuidv4(),
          }));
          suppliers = Array.from({ length: 10 }, (_, i) => ({
            name: `Supplier ${i + 1}`,
            address: `${Math.floor(Math.random() * 1000)} Random St`,
            phone: `555-${Math.floor(Math.random() * 9000) + 1000}`,
            contactPersons: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({ name: `Contact ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`, phone: `555-${Math.floor(Math.random() * 9000) + 1000}`, email: `contact${Math.floor(Math.random() * 100)}@example.com` })),
            gstId: `GST${Math.floor(Math.random() * 1000)}`,
            rating: Math.floor(Math.random() * 5) + 1,
            rawMaterials: rawMaterials.slice(0, Math.floor(Math.random() * 5) + 1).map(material => material.name),
            id: uuidv4(),
          }));
          const generateRandomDate = (startDate, endDate) => {
            const start = startDate ? new Date(startDate) : new Date(2023, 0, 1);
            const end = endDate ? new Date(endDate) : new Date();
            return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
          };
          orders = Array.from({ length: 50 }, (_, i) => ({
            orderId: uuidv4(),
            orderItems: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => {
              const product = products[Math.floor(Math.random() * products.length)];
              return {
                orderItemId: uuidv4(),
                orderId: `order-${i + 1}`,
                productName: product.name,
                productId: product.id,
                status: ['Pending', 'Shipped', 'complete-shipped', 'complete-inventory-updated'][Math.floor(Math.random() * 4)],
                date: generateRandomDate(),
                containerId: '',
                quantity: Math.floor(Math.random() * 10) + 1,
                price: product.price,
              };
            }),
            orderDate: generateRandomDate(),
            source: ['placed', 'shipped'][Math.floor(Math.random() * 2)],
          }));
          transactions = Array.from({ length: 200 }, (_, i) => {
            const type = ['replenishment', 'order_shipped', 'inventory_update'][Math.floor(Math.random() * 3)];
            const date = type === 'order_shipped' ? generateRandomDate(new Date('2025-01-24'), new Date('2025-01-31')) : generateRandomDate();
            let metadata = {};
            if (type === 'replenishment') {
              const material = rawMaterials[Math.floor(Math.random() * rawMaterials.length)];
              const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
              metadata = {
                materialName: material.name,
                quantity: Math.floor(Math.random() * 1000) + 100,
                supplier: supplier.name,
                estimatedPrice: Math.random() * 1000,
                actualPrice: Math.random() * 1000,
                invoiceNo: `INV-${Math.floor(Math.random() * 10000)}`,
                bankTransactionId: `BANK-TXN-${Math.floor(Math.random() * 10000)}`,
                shippingId: `SHIP-ID-${Math.floor(Math.random() * 10000)}`,
              };
            } else if (type === 'order_shipped') {
              const order = orders[Math.floor(Math.random() * orders.length)];
              const orderItem = order.orderItems[Math.floor(Math.random() * order.orderItems.length)];
              metadata = {
                productName: orderItem.productName,
                quantity: orderItem.quantity,
                orderId: order.orderId,
                orderItemId: orderItem.orderItemId,
                action: 'ship',
                productId: orderItem.productId,
              };
            } else if (type === 'inventory_update') {
              const product = products[Math.floor(Math.random() * products.length)];
              metadata = {
                productName: product.name,
                quantity: Math.floor(Math.random() * 100) + 1,
                containerId: `Warehouse ${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`,
                action: 'add',
                productId: product.id,
              };
            }
            return {
              id: uuidv4(),
              type,
              status: ['pending', 'completed'][Math.floor(Math.random() * 2)],
              date,
              metadata,
            };
          });

        for (const material of rawMaterials) {
          await saveRawMaterial(material);
        }

        for (const category of categories) {
          await saveCategory(category);
        }

        for (const product of products) {
          await saveProduct(product);
        }

        for (const order of orders) {
          await saveOrder(order);
        }

        for (const supplier of suppliers) {
          await saveSupplier(supplier);
        }

        for (const transaction of transactions) {
          const allTransactions = await localforage.getItem('transactions') || [];
          await localforage.setItem('transactions', [...allTransactions, transaction]);
        }

        alert('Dummy data inserted successfully.');
        window.location.reload();
      };

      return (
        <div className="p-4 dark:bg-gray-700">
          <h2 className="text-2xl font-bold mb-4">Settings</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Currency</label>
            <select value={currency} onChange={handleCurrencyChange} className="border p-2 rounded w-full text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Theme</label>
            <select value={theme} onChange={handleThemeChange} className="border p-2 rounded w-full text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div className="border-t pt-4 mt-4 dark:border-gray-600">
            <h3 className="text-xl font-semibold mb-2 text-blue-600">Data Management</h3>
            <button onClick={insertDummyData} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-2 mr-2">
              Insert Dummy Data
            </button>
            <h3 className="text-xl font-semibold mb-2 text-red-600">Danger Zone</h3>
            <button onClick={handleResetData} className="bg-red-500 text-white p-2 rounded">Reset All Data</button>
            {showConfirmation && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-4 rounded dark:bg-gray-800 dark:text-gray-300">
                  <p className="mb-4">Are you sure you want to reset all application data?</p>
                  <div className="flex justify-end">
                    <button onClick={confirmResetData} className="bg-red-500 text-white p-2 rounded mr-2">Yes</button>
                    <button onClick={cancelResetData} className="bg-gray-300 text-gray-700 p-2 rounded dark:bg-gray-700 dark:text-gray-300">No</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    export default Settings;
