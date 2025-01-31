import React, { useState, useEffect } from 'react';
    import { saveProduct, getRawMaterials, getCategories } from '../utils/storage';
    import { useNavigate } from 'react-router-dom';

    function AddProduct() {
      const [rawMaterials, setRawMaterials] = useState([]);
      const [categories, setCategories] = useState([]);
      const [name, setName] = useState('');
      const [image, setImage] = useState('');
      const [price, setPrice] = useState('');
      const [selectedRawMaterials, setSelectedRawMaterials] = useState({});
      const [selectedCategory, setSelectedCategory] = useState('');
      const [availableQuantity, setAvailableQuantity] = useState('');
      const [containers, setContainers] = useState([{ location: '', quantity: '' }]);
      const [defaultBatchSize, setDefaultBatchSize] = useState(1);
      const navigate = useNavigate();

      useEffect(() => {
        const fetchRawMaterials = async () => {
          const materials = await getRawMaterials();
          setRawMaterials(materials);
        };
        const fetchCategories = async () => {
          const categories = await getCategories();
          setCategories(categories);
        };
        fetchRawMaterials();
        fetchCategories();
      }, []);

      const handleRawMaterialChange = (materialName, quantity) => {
        setSelectedRawMaterials({ ...selectedRawMaterials, [materialName]: parseFloat(quantity) });
      };

      const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
      };

      const handleContainerChange = (index, field, value) => {
        const newContainers = [...containers];
        newContainers[index][field] = value;
        setContainers(newContainers);
      };

      const addContainer = () => {
        setContainers([...containers, { location: '', quantity: '' }]);
      };

      const removeContainer = (index) => {
        const newContainers = [...containers];
        newContainers.splice(index, 1);
        setContainers(newContainers);
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        const newProduct = {
          name,
          image,
          price: parseFloat(price),
          rawMaterials: selectedRawMaterials,
          category: selectedCategory,
          availableQuantity: parseFloat(availableQuantity),
          containers: containers.filter(container => container.location.trim() !== '' && container.quantity !== ''),
          defaultBatchSize: parseInt(defaultBatchSize, 10),
        };
        await saveProduct(newProduct);
        navigate('/products');
      };

      const calculateEstimatedPrice = () => {
        let estimatedPrice = 0;
        for (const materialName in selectedRawMaterials) {
          const material = rawMaterials.find(mat => mat.name === materialName);
          if (material) {
            estimatedPrice += material.pricePerUnit * selectedRawMaterials[materialName];
          }
        }
        return estimatedPrice;
      };

      return (
        <div className="dark:bg-gray-700 p-4">
          <h2 className="text-2xl font-bold mb-4 dark:text-gray-300">Add Product</h2>
          <form onSubmit={handleSubmit} className="mt-2 p-4 border rounded dark:bg-gray-800 dark:border-gray-600">
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="border p-2 mr-2 mb-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            <input type="text" placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} className="border p-2 mr-2 mb-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="border p-2 mr-2 mb-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            <input type="number" placeholder="Available Quantity" value={availableQuantity} onChange={(e) => setAvailableQuantity(e.target.value)} className="border p-2 mr-2 mb-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            <div className="mb-2">
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-300">Raw Materials</h3>
              {rawMaterials.map((material) => (
                <div key={material.name} className="flex items-center mb-1">
                  <label className="mr-2 dark:text-gray-300">{material.name}:</label>
                  <input
                    type="number"
                    placeholder="Quantity"
                    step="0.01"
                    className="border p-1 w-20 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    onChange={(e) => handleRawMaterialChange(material.name, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div className="mb-2">
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-300">Category</h3>
              <select value={selectedCategory} onChange={handleCategoryChange} className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.title} value={category.title}>{category.title}</option>
                ))}
              </select>
            </div>
            <div className="mb-2">
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-300">Containers</h3>
              {containers.map((container, index) => (
                <div key={index} className="flex items-center mb-1">
                  <input
                    type="text"
                    placeholder="Location"
                    value={container.location}
                    onChange={(e) => handleContainerChange(index, 'location', e.target.value)}
                    className="border p-1 mr-2 w-1/2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={container.quantity}
                    onChange={(e) => handleContainerChange(index, 'quantity', e.target.value)}
                    className="border p-1 mr-2 w-1/4 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  />
                  {containers.length > 1 && (
                    <button type="button" onClick={() => removeContainer(index)} className="bg-red-500 text-white p-1 rounded">Remove</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addContainer} className="bg-gray-300 text-gray-700 p-1 rounded dark:bg-gray-700 dark:text-gray-300">Add Container</button>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Default Batch Size</label>
              <input
                type="number"
                placeholder="Default Batch Size"
                value={defaultBatchSize}
                onChange={(e) => setDefaultBatchSize(e.target.value)}
                className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              />
            </div>
            <p className="mb-2 dark:text-gray-300">Estimated Price: {calculateEstimatedPrice()}</p>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Product</button>
          </form>
        </div>
      );
    }

    export default AddProduct;
