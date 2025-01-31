import React, { useState } from 'react';
    import { saveRawMaterial } from '../utils/storage';
    import { useNavigate } from 'react-router-dom';

    function AddRawMaterial() {
      const [name, setName] = useState('');
      const [unit, setUnit] = useState('');
      const [pricePerUnit, setPricePerUnit] = useState('');
      const [availableQuantity, setAvailableQuantity] = useState('');
      const navigate = useNavigate();

      const handleSubmit = async (e) => {
        e.preventDefault();
        const newMaterial = { name, unit, pricePerUnit: parseFloat(pricePerUnit), availableQuantity: parseFloat(availableQuantity) };
        await saveRawMaterial(newMaterial);
        navigate('/raw-materials');
      };

      return (
        <div className="dark:bg-gray-700 p-4">
          <h2 className="text-2xl font-bold mb-4 dark:text-gray-300">Add Raw Material</h2>
          <form onSubmit={handleSubmit} className="mt-2 p-4 border rounded dark:bg-gray-800 dark:border-gray-600">
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="border p-2 mr-2 mb-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            <input type="text" placeholder="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="border p-2 mr-2 mb-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            <input type="number" placeholder="Price per unit" value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)} className="border p-2 mr-2 mb-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            <input type="number" placeholder="Available Quantity" value={availableQuantity} onChange={(e) => setAvailableQuantity(e.target.value)} className="border p-2 mr-2 mb-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Material</button>
          </form>
        </div>
      );
    }

    export default AddRawMaterial;
