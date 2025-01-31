import React, { useState } from 'react';
    import { saveCategory } from '../utils/storage';
    import { useNavigate } from 'react-router-dom';

    function AddCategory() {
      const [title, setTitle] = useState('');
      const [description, setDescription] = useState('');
      const [manufacturingStages, setManufacturingStages] = useState(['']);
      const navigate = useNavigate();

      const handleStageChange = (index, value) => {
        const newStages = [...manufacturingStages];
        newStages[index] = value;
        setManufacturingStages(newStages);
      };

      const addStage = () => {
        setManufacturingStages([...manufacturingStages, '']);
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        const newCategory = {
          title,
          description,
          manufacturingStages: manufacturingStages.filter(stage => stage.trim() !== '')
        };
        await saveCategory(newCategory);
        navigate('/product-categories');
      };

      return (
        <div className="dark:bg-gray-700 p-4">
          <h2 className="text-2xl font-bold mb-4 dark:text-gray-300">Add Product Category</h2>
          <form onSubmit={handleSubmit} className="mt-2 p-4 border rounded dark:bg-gray-800 dark:border-gray-600">
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="border p-2 mr-2 mb-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="border p-2 mr-2 mb-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            <div className="mb-2">
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-300">Manufacturing Stages</h3>
              {manufacturingStages.map((stage, index) => (
                <div key={index} className="flex items-center mb-1">
                  <input
                    type="text"
                    placeholder={`Stage ${index + 1}`}
                    value={stage}
                    onChange={(e) => handleStageChange(index, e.target.value)}
                    className="border p-1 mr-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  />
                </div>
              ))}
              <button type="button" onClick={addStage} className="bg-gray-300 text-gray-700 p-1 rounded dark:bg-gray-700 dark:text-gray-300">Add Stage</button>
            </div>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Category</button>
          </form>
        </div>
      );
    }

    export default AddCategory;
