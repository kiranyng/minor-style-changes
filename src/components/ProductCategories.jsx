import React, { useState, useEffect } from 'react';
    import { getCategories } from '../utils/storage';
    import { Link } from 'react-router-dom';
    import { FaEdit } from 'react-icons/fa';

    function ProductCategories() {
      const [categories, setCategories] = useState([]);

      useEffect(() => {
        const fetchCategories = async () => {
          const categories = await getCategories();
          setCategories(categories);
        };
        fetchCategories();
      }, []);

      return (
        <div className="dark:bg-gray-700 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold mb-4 dark:text-gray-300">Product Categories</h2>
          </div>
          <ul className="space-y-2">
            {categories.map((category, index) => (
              <li key={index} className="border p-2 flex items-center justify-between dark:bg-gray-800 dark:border-gray-600">
                <div>
                  <h3 className="text-xl font-semibold mb-2 dark:text-gray-300">{category.title}</h3>
                  <p className="dark:text-gray-300">{category.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manufacturing Steps: {category.manufacturingStages.join(', ')}</p>
                </div>
                <Link to={`/product-categories/edit/${category.title}`} className="text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-500">
                  <FaEdit className="text-lg" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    export default ProductCategories;
