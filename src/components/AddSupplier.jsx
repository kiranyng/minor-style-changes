import React, { useState, useEffect } from 'react';
    import { saveSupplier, getRawMaterials } from '../utils/storage';
    import { useNavigate } from 'react-router-dom';
    import { FaPlus } from 'react-icons/fa';

    function AddSupplier() {
      const [rawMaterials, setRawMaterials] = useState([]);
      const [name, setName] = useState('');
      const [address, setAddress] = useState('');
      const [phone, setPhone] = useState('');
      const [contactPersons, setContactPersons] = useState([{ name: '', phone: '', email: '' }]);
      const [gstId, setGstId] = useState('');
      const [rating, setRating] = useState('');
      const [selectedRawMaterials, setSelectedRawMaterials] = useState([]);
      const navigate = useNavigate();

      useEffect(() => {
        const fetchRawMaterials = async () => {
          const materials = await getRawMaterials();
          setRawMaterials(materials);
        };
        fetchRawMaterials();
      }, []);

      const handleContactPersonChange = (index, field, value) => {
        const newContactPersons = [...contactPersons];
        newContactPersons[index][field] = value;
        setContactPersons(newContactPersons);
      };

      const addContactPerson = () => {
        setContactPersons([...contactPersons, { name: '', phone: '', email: '' }]);
      };

      const removeContactPerson = (index) => {
        const newContactPersons = [...contactPersons];
        newContactPersons.splice(index, 1);
        setContactPersons(newContactPersons);
      };

      const handleRawMaterialChange = (e) => {
        const materialName = e.target.value;
        if (selectedRawMaterials.includes(materialName)) {
          setSelectedRawMaterials(selectedRawMaterials.filter(name => name !== materialName));
        } else {
          setSelectedRawMaterials([...selectedRawMaterials, materialName]);
        }
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        const newSupplier = {
          name,
          address,
          phone,
          contactPersons,
          gstId,
          rating,
          rawMaterials: selectedRawMaterials,
        };
        await saveSupplier(newSupplier);
        navigate('/suppliers');
      };

      return (
        <div className="dark:bg-gray-700 p-4">
          <h2 className="text-2xl font-bold mb-4 dark:text-gray-300">Add Supplier</h2>
          <form onSubmit={handleSubmit} className="mt-2 p-4 border rounded dark:bg-gray-800 dark:border-gray-600">
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="border p-2 mr-2 mb-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="border p-2 mr-2 mb-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="border p-2 mr-2 mb-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            <div className="mb-2">
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-300">Contact Persons</h3>
              {contactPersons.map((person, index) => (
                <div key={index} className="mb-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={person.name}
                    onChange={(e) => handleContactPersonChange(index, 'name', e.target.value)}
                    className="border p-1 mr-2 w-1/3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={person.phone}
                    onChange={(e) => handleContactPersonChange(index, 'phone', e.target.value)}
                    className="border p-1 mr-2 w-1/3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={person.email}
                    onChange={(e) => handleContactPersonChange(index, 'email', e.target.value)}
                    className="border p-1 mr-2 w-1/3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    required
                  />
                  {contactPersons.length > 1 && (
                    <button type="button" onClick={() => removeContactPerson(index)} className="bg-red-500 text-white p-1 rounded">Remove</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addContactPerson} className="bg-gray-300 text-gray-700 p-1 rounded dark:bg-gray-700 dark:text-gray-300">Add Contact</button>
            </div>
            <input type="text" placeholder="GST ID" value={gstId} onChange={(e) => setGstId(e.target.value)} className="border p-2 mr-2 mb-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" />
            <input type="number" placeholder="Rating" value={rating} onChange={(e) => setRating(e.target.value)} className="border p-2 mr-2 mb-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" />
            <div className="mb-2">
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-300">Raw Materials</h3>
              <div className="flex flex-wrap">
                {rawMaterials.map((material) => (
                  <label key={material.name} className="mr-2 dark:text-gray-300">
                    <input
                      type="checkbox"
                      value={material.name}
                      checked={selectedRawMaterials.includes(material.name)}
                      onChange={handleRawMaterialChange}
                      className="mr-1"
                    />
                    {material.name}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Supplier</button>
          </form>
        </div>
      );
    }

    export default AddSupplier;
