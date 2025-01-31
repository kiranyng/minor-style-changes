import React, { useState, useEffect } from 'react';
    import { getSuppliers, getRawMaterials } from '../utils/storage';
    import { useParams, useNavigate } from 'react-router-dom';
    import { v4 as uuidv4 } from 'uuid';
    import localforage from 'localforage';

    function ReplenishRawMaterial() {
      const { materialName } = useParams();
      const [suppliers, setSuppliers] = useState([]);
      const [quantity, setQuantity] = useState('');
      const [selectedSupplier, setSelectedSupplier] = useState('');
      const [estimatedPrice, setEstimatedPrice] = useState('');
      const [actualPrice, setActualPrice] = useState('');
      const [invoiceNo, setInvoiceNo] = useState('');
      const [bankTransactionId, setBankTransactionId] = useState('');
      const [shippingId, setShippingId] = useState('');
      const [rawMaterial, setRawMaterial] = useState(null);
      const navigate = useNavigate();
      const [currency, setCurrency] = useState('USD');

      useEffect(() => {
        const fetchSuppliers = async () => {
          const suppliers = await getSuppliers();
          setSuppliers(suppliers);
        };
        const fetchRawMaterial = async () => {
          const materials = await getRawMaterials();
          const foundMaterial = materials.find(material => material.name === materialName);
          setRawMaterial(foundMaterial);
        };
        const fetchCurrency = async () => {
          const storedCurrency = await localforage.getItem('currency');
          if (storedCurrency) setCurrency(storedCurrency);
        };
        fetchSuppliers();
        fetchRawMaterial();
        fetchCurrency();
      }, [materialName]);

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rawMaterial) return;

        const newTransaction = {
          id: uuidv4(),
          type: 'replenishment',
          status: 'pending',
          date: new Date().toISOString(),
          metadata: {
            materialName: rawMaterial.name,
            quantity: parseFloat(quantity),
            supplier: selectedSupplier,
            estimatedPrice: parseFloat(estimatedPrice),
            actualPrice: parseFloat(actualPrice),
            invoiceNo,
            bankTransactionId,
            shippingId,
          }
        };

        const transactions = await localforage.getItem('transactions') || [];
        await localforage.setItem('transactions', [...transactions, newTransaction]);
        navigate('/suppliers/' + selectedSupplier);
      };

      if (!rawMaterial) {
        return <div className="dark:bg-gray-700 p-4">Loading...</div>;
      }

      const formatCurrency = (amount) => {
        const formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
        });
        return formatter.format(amount);
      };

      return (
        <div className="dark:bg-gray-700 p-4">
          <h2 className="text-2xl font-bold mb-4 dark:text-gray-300">Replenish {rawMaterial.name}</h2>
          <form onSubmit={handleSubmit} className="mt-2 p-4 border rounded dark:bg-gray-800 dark:border-gray-600">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Quantity</label>
              <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Supplier</label>
              <select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)} className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
                <option value="">Select a supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.name} value={supplier.name}>{supplier.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Estimated Price</label>
              <input type="number" placeholder="Estimated Price" value={estimatedPrice} onChange={(e) => setEstimatedPrice(e.target.value)} className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Actual Price</label>
              <input type="number" placeholder="Actual Price" value={actualPrice} onChange={(e) => setActualPrice(e.target.value)} className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Invoice No</label>
              <input type="text" placeholder="Invoice No" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Bank Transaction ID</label>
              <input type="text" placeholder="Bank Transaction ID" value={bankTransactionId} onChange={(e) => setBankTransactionId(e.target.value)} className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Shipping ID</label>
              <input type="text" placeholder="Shipping ID" value={shippingId} onChange={(e) => setShippingId(e.target.value)} className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" />
            </div>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">Create Transaction</button>
          </form>
        </div>
      );
    }

    export default ReplenishRawMaterial;
