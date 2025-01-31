import React, { useState, useEffect } from 'react';
    import {
      Chart as ChartJS,
      CategoryScale,
      LinearScale,
      BarElement,
      PointElement,
      LineElement,
      Title,
      Tooltip,
      Legend,
    } from 'chart.js';
    import { Bar, Line } from 'react-chartjs-2';
    import { getProducts, getOrders, getRawMaterials } from '../utils/storage';
    import localforage from 'localforage';

    ChartJS.register(
      CategoryScale,
      LinearScale,
      BarElement,
      PointElement,
      LineElement,
      Title,
      Tooltip,
      Legend
    );

    function Dashboard() {
      const [salesData, setSalesData] = useState({
        labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
        datasets: [{
          label: 'Sales',
          data: [12, 19, 3, 5, 2, 3, 7],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        }]
      });

      const [inventoryStats, setInventoryStats] = useState({
        products: { inStock: [], lowStock: [], outOfStock: [] },
        rawMaterials: { inStock: [], lowStock: [], outOfStock: [] },
      });

      const [projectionData, setProjectionData] = useState({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Projected Revenue',
          data: [1000, 1200, 800, 1500, 1300, 1700],
          fill: false,
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        }]
      });

      const [products, setProducts] = useState([]);

      useEffect(() => {
        const fetchSalesData = async () => {
          const transactions = await localforage.getItem('transactions') || [];
          const today = new Date();
          const lastWeek = new Date(today);
          lastWeek.setDate(today.getDate() - 7);

          const sales = {};
          for (let d = new Date(lastWeek); d <= today; d.setDate(d.getDate() + 1)) {
            const date = d.toISOString().split('T')[0];
            sales[date] = 0;
          }

          transactions.forEach(transaction => {
            if (transaction.type === 'order_shipped' && transaction.status === 'completed') {
              const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
              if (sales[transactionDate] !== undefined) {
                const product = products.find(p => p.id === transaction.metadata.productId);
                if (product) {
                  sales[transactionDate] += transaction.metadata.quantity * product.price;
                }
              }
            }
          });

          setSalesData({
            labels: Object.keys(sales),
            datasets: [{
              label: 'Sales',
              data: Object.values(sales),
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            }]
          });
        };

        const fetchInventoryStats = async () => {
          const products = await getProducts();
          const rawMaterials = await getRawMaterials();
          let productInStock = [];
          let productLowStock = [];
          let productOutOfStock = [];
          let rawMaterialInStock = [];
          let rawMaterialLowStock = [];
          let rawMaterialOutOfStock = [];

          products.forEach(product => {
            if (product.availableQuantity > 10) {
              productInStock.push({ name: product.name, quantity: product.availableQuantity });
            } else if (product.availableQuantity > 0) {
              productLowStock.push({ name: product.name, quantity: product.availableQuantity });
            } else {
              productOutOfStock.push({ name: product.name, quantity: product.availableQuantity });
            }
          });

          rawMaterials.forEach(material => {
            if (material.availableQuantity > 50) {
              rawMaterialInStock.push({ name: material.name, quantity: material.availableQuantity });
            } else if (material.availableQuantity > 0) {
              rawMaterialLowStock.push({ name: material.name, quantity: material.availableQuantity });
            } else {
              rawMaterialOutOfStock.push({ name: material.name, quantity: material.availableQuantity });
            }
          });

          setInventoryStats({
            products: { inStock: productInStock, lowStock: productLowStock, outOfStock: productOutOfStock },
            rawMaterials: { inStock: rawMaterialInStock, lowStock: rawMaterialLowStock, outOfStock: rawMaterialOutOfStock },
          });
        };

        const fetchProducts = async () => {
          const products = await getProducts();
          setProducts(products);
        };

        fetchProducts();
        fetchSalesData();
        fetchInventoryStats();
      }, [products]);

      const chartOptions = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      };

      const renderTooltip = (items) => {
        return (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 z-10 w-[250px] overflow-auto max-h-40">
            {items.map((item, index) => (
              <p key={index} className="dark:text-gray-300">
                {item.name}: {item.quantity}
              </p>
            ))}
          </div>
        );
      };

      return (
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4 dark:text-gray-300">Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-2 dark:text-gray-300">Sales Overview</h3>
              <Bar options={chartOptions} data={salesData} />
            </div>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-2 dark:text-gray-300">Inventory Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-lg font-semibold mb-2 dark:text-gray-300">Products</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center relative group">
                      <p className="text-3xl font-bold text-green-500">
                        {inventoryStats.products.inStock.length}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">In Stock</p>
                      {inventoryStats.products.inStock.length > 0 && (
                        <div className="hidden group-hover:block">
                          {renderTooltip(inventoryStats.products.inStock)}
                        </div>
                      )}
                    </div>
                    <div className="text-center relative group">
                      <p className="text-3xl font-bold text-yellow-500">
                        {inventoryStats.products.lowStock.length}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock</p>
                      {inventoryStats.products.lowStock.length > 0 && (
                        <div className="hidden group-hover:block">
                          {renderTooltip(inventoryStats.products.lowStock)}
                        </div>
                      )}
                    </div>
                    <div className="text-center relative group">
                      <p className="text-3xl font-bold text-red-500">
                        {inventoryStats.products.outOfStock.length}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Out of Stock</p>
                      {inventoryStats.products.outOfStock.length > 0 && (
                        <div className="hidden group-hover:block">
                          {renderTooltip(inventoryStats.products.outOfStock)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2 dark:text-gray-300">Raw Materials</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center relative group">
                      <p className="text-3xl font-bold text-green-500">
                        {inventoryStats.rawMaterials.inStock.length}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">In Stock</p>
                      {inventoryStats.rawMaterials.inStock.length > 0 && (
                        <div className="hidden group-hover:block">
                          {renderTooltip(inventoryStats.rawMaterials.inStock)}
                        </div>
                      )}
                    </div>
                    <div className="text-center relative group">
                      <p className="text-3xl font-bold text-yellow-500">
                        {inventoryStats.rawMaterials.lowStock.length}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock</p>
                      {inventoryStats.rawMaterials.lowStock.length > 0 && (
                        <div className="hidden group-hover:block">
                          {renderTooltip(inventoryStats.rawMaterials.lowStock)}
                        </div>
                      )}
                    </div>
                    <div className="text-center relative group">
                      <p className="text-3xl font-bold text-red-500">
                        {inventoryStats.rawMaterials.outOfStock.length}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Out of Stock</p>
                      {inventoryStats.rawMaterials.outOfStock.length > 0 && (
                        <div className="hidden group-hover:block">
                          {renderTooltip(inventoryStats.rawMaterials.outOfStock)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 col-span-2">
              <h3 className="text-xl font-semibold mb-2 dark:text-gray-300">Financial Projections</h3>
              <Line options={chartOptions} data={projectionData} />
            </div>
          </div>
        </div>
      );
    }

    export default Dashboard;
