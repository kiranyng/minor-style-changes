import React, { useState, useEffect } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { getProduct, saveProduct, getRawMaterials, getCategories } from '../utils/storage';

    function EditProduct() {
      const { productName } = useParams();
      const navigate = useNavigate();
      const [name, setName] = useState('');
      const [image, setImage] = useState('');
      const [price, setPrice] = useState('');
      const [selectedRawMaterials, setSelectedRawMaterials] = useState({});
      const [selectedCategory, setSelectedCategory] = useState('');
      const [availableQuantity, setAvailableQuantity] = useState('');
      const [containers, setContainers] = useState([]);
      const [rawMaterials, setRawMaterials] = useState([]);
      const [categories, setCategories] = useState([]);
      const [defaultBatchSize, setDefaultBatchSize] = useState(1);
      const [productId, setProductId] = useState('');

      useEffect(() => {
        const fetchProduct = async () => {
          const product = await getProduct(productName);
          if (product) {
            setName(product.name);
            setImage(product.image);
            setPrice(product.price.toString());
            setSelectedRawMaterials(product.rawMaterials);
            setSelectedCategory(product.category);
            setAvailableQuantity(product.availableQuantity.toString());
            setContainers(product.containers || []);
            setDefaultBatchSize(product.defaultBatchSize || 1);
            setProductId(product.id);
          }
        };

        const fetchRawMaterials = async () => {
          const materials = await getRawMaterials();
          setRawMaterials(materials);
        };

        const fetchCategories = async () => {
          const fetchedCategories = await getCategories();
          setCategories(fetchedCategories);
        };

        fetchProduct();
        fetchRawMaterials();
        fetchCategories();
      }, [productName]);

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
        const updatedProduct = {
          name,
          image,
          price: parseFloat(price),
          rawMaterials: selectedRawMaterials,
          category: selectedCategory,
          availableQuantity: parseFloat(availableQuantity),
          containers: containers.filter(container => container.location.trim() !== '' && container.quantity !== ''),
          defaultBatchSize: parseInt(defaultBatchSize, 10),
          id: productId,
        };
        await saveProduct(updatedProduct);
        navigate('/products');
      };

      return (
        <div className="dark:bg-gray-700 p-4">
          <h2 className="text-2xl font-bold mb-4 dark:text-gray-300">Edit Product: {name}</h2>
          <form onSubmit={handleSubmit} className="mt-2 p-4 border rounded dark:bg-gray-800 dark:border-gray-600">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Name</label>
              <input type="text" value={name} readOnly className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Image URL</label>
              <input type="text" placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Price</label>
              <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Available Quantity</label>
              <input type="number" placeholder="Available Quantity" value={availableQuantity} onChange={(e) => setAvailableQuantity(e.target.value)} className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-300">Raw Materials</h3>
              {rawMaterials.map((material) => (
                <div key={material.name} className="flex items-center mb-2">
                  <label className="mr-2 dark:text-gray-300">{material.name}:</label>
                  <input
                    type="number"
                    placeholder="Quantity"
                    step="0.01"
                    value={selectedRawMaterials[material.name] || ''}
                    onChange={(e) => handleRawMaterialChange(material.name, e.target.value)}
                    className="border p-1 w-20 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  />
                </div>
              ))}
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-300">Category</h3>
              <select value={selectedCategory} onChange={handleCategoryChange} className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.title} value={category.title}>{category.title}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-300">Containers</h3>
              {containers.map((container, index) => (
                <div key={index} className="flex items-center mb-2">
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
                  <button type="button" onClick={() => removeContainer(index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={addContainer} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-2 rounded">Add Container</button>
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
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">Update Product</button>
          </form>
        </div>
      );
    }

    export default EditProduct;
