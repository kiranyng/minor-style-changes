import React, { useState, useEffect } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { getRawMaterials, saveRawMaterial } from '../utils/storage';

    function EditRawMaterial() {
      const { materialName } = useParams();
      const navigate = useNavigate();
      const [name, setName] = useState('');
      const [unit, setUnit] = useState('');
      const [pricePerUnit, setPricePerUnit] = useState('');
      const [availableQuantity, setAvailableQuantity] = useState('');

      useEffect(() => {
        const fetchRawMaterial = async () => {
          const materials = await getRawMaterials();
          const material = materials.find(m => m.name === materialName);
          if (material) {
            setName(material.name);
            setUnit(material.unit);
            setPricePerUnit(material.pricePerUnit.toString());
            setAvailableQuantity(material.availableQuantity.toString());
          }
        };
        fetchRawMaterial();
      }, [materialName]);

      const handleSubmit = async (e) => {
        e.preventDefault();
        const updatedMaterial = {
          name,
          unit,
          pricePerUnit: parseFloat(pricePerUnit),
          availableQuantity: parseFloat(availableQuantity)
        };
        await saveRawMaterial(updatedMaterial);
        navigate('/raw-materials');
      };

      if (!name) return <div>Loading...</div>;

      return (
        <div className="dark:bg-gray-700 p-4">
          <h2 className="text-2xl font-bold mb-4 dark:text-gray-300">Edit Raw Material: {name}</h2>
          <form onSubmit={handleSubmit} className="mt-2 p-4 border rounded dark:bg-gray-800 dark:border-gray-600">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Name</label>
              <input type="text" value={name} readOnly className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Unit</label>
              <input type="text" placeholder="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Price Per Unit</label>
              <input type="number" placeholder="Price per unit" value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)} className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Available Quantity</label>
              <input type="number" placeholder="Available Quantity" value={availableQuantity} onChange={(e) => setAvailableQuantity(e.target.value)} className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            </div>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">Update Material</button>
          </form>
        </div>
      );
    }

    export default EditRawMaterial;
