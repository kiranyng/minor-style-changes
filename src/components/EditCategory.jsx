import React, { useState, useEffect } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { getCategories, saveCategory } from '../utils/storage';

    function EditCategory() {
      const { categoryTitle } = useParams();
      const navigate = useNavigate();
      const [title, setTitle] = useState('');
      const [description, setDescription] = useState('');
      const [manufacturingStages, setManufacturingStages] = useState([]);

      useEffect(() => {
        const fetchCategory = async () => {
          const categories = await getCategories();
          const category = categories.find(c => c.title === categoryTitle);
          if (category) {
            setTitle(category.title);
            setDescription(category.description);
            setManufacturingStages(category.manufacturingStages || []);
          }
        };
        fetchCategory();
      }, [categoryTitle]);

      const handleStageChange = (index, value) => {
        const newStages = [...manufacturingStages];
        newStages[index] = value;
        setManufacturingStages(newStages);
      };

      const addStage = () => {
        setManufacturingStages([...manufacturingStages, '']);
      };

      const removeStage = (index) => {
        const newStages = [...manufacturingStages];
        newStages.splice(index, 1);
        setManufacturingStages(newStages);
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        const updatedCategory = {
          title,
          description,
          manufacturingStages: manufacturingStages.filter(stage => stage.trim() !== '')
        };
        await saveCategory(updatedCategory);
        navigate('/product-categories');
      };

      if (!title) return <div>Loading...</div>;

      return (
        <div className="dark:bg-gray-700 p-4">
          <h2 className="text-2xl font-bold mb-4 dark:text-gray-300">Edit Category: {title}</h2>
          <form onSubmit={handleSubmit} className="mt-2 p-4 border rounded dark:bg-gray-800 dark:border-gray-600">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Title</label>
              <input type="text" value={title} readOnly className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Description</label>
              <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            </div>
            <div className="mb-4">
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
                  {manufacturingStages.length > 1 && (
                    <button type="button" onClick={() => removeStage(index)} className="bg-red-500 text-white p-1 rounded">Remove</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addStage} className="bg-gray-300 text-gray-700 p-1 rounded dark:bg-gray-700 dark:text-gray-300">Add Stage</button>
            </div>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">Update Category</button>
          </form>
        </div>
      );
    }

    export default EditCategory;
