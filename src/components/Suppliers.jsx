import React, { useState, useEffect } from 'react';
    import { getSuppliers } from '../utils/storage';
    import { Link } from 'react-router-dom';
    import { FaEdit } from 'react-icons/fa';

    function Suppliers() {
      const [suppliers, setSuppliers] = useState([]);

      useEffect(() => {
        const fetchSuppliers = async () => {
          const suppliers = await getSuppliers();
          setSuppliers(suppliers);
        };
        fetchSuppliers();
      }, []);

      return (
        <div className="dark:bg-gray-700 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold dark:text-gray-300">Suppliers</h2>
          </div>
          <ul className="space-y-2">
            {suppliers.map((supplier, index) => (
              <li key={index} className="border p-2 flex items-center justify-between dark:bg-gray-800 dark:border-gray-600">
                <Link to={`/suppliers/${supplier.name}`} className="dark:text-gray-300">
                  <h3 className="font-bold">{supplier.name}</h3>
                  <p>{supplier.address}</p>
                  <p>Contact: {supplier.phone}</p>
                </Link>
                <Link to={`/suppliers/edit/${supplier.name}`} className="text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-500">
                  <FaEdit className="text-lg" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    export default Suppliers;
