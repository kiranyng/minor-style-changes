import React, { useState, useEffect } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { getSupplier, saveSupplier, getRawMaterials } from '../utils/storage';

    function EditSupplier() {
      const { supplierName } = useParams();
      const navigate = useNavigate();
      const [name, setName] = useState('');
      const [address, setAddress] = useState('');
      const [phone, setPhone] = useState('');
      const [contactPersons, setContactPersons] = useState([]);
      const [gstId, setGstId] = useState('');
      const [rating, setRating] = useState('');
      const [selectedRawMaterials, setSelectedRawMaterials] = useState([]);
      const [allRawMaterials, setAllRawMaterials] = useState([]);

      useEffect(() => {
        const fetchSupplier = async () => {
          const supplier = await getSupplier(supplierName);
          if (supplier) {
            setName(supplier.name);
            setAddress(supplier.address);
            setPhone(supplier.phone);
            setContactPersons(supplier.contactPersons || []);
            setGstId(supplier.gstId);
            setRating(supplier.rating.toString());
            setSelectedRawMaterials(supplier.rawMaterials || []);
          }
        };

        const fetchRawMaterials = async () => {
          const materials = await getRawMaterials();
          setAllRawMaterials(materials);
        };

        fetchSupplier();
        fetchRawMaterials();
      }, [supplierName]);

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
        const updatedSupplier = {
          name,
          address,
          phone,
          contactPersons,
          gstId,
          rating: parseFloat(rating),
          rawMaterials: selectedRawMaterials,
        };
        await saveSupplier(updatedSupplier);
        navigate('/suppliers');
      };

      if (!name) return <div>Loading...</div>;

      return (
        <div className="dark:bg-gray-700 p-4">
          <h2 className="text-2xl font-bold mb-4 dark:text-gray-300">Edit Supplier: {name}</h2>
          <form onSubmit={handleSubmit} className="mt-2 p-4 border rounded dark:bg-gray-800 dark:border-gray-600">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Name</label>
              <input type="text" value={name} readOnly className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Address</label>
              <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Phone</label>
              <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            </div>
            <div className="mb-4">
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
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">GST ID</label>
              <input type="text" placeholder="GST ID" value={gstId} onChange={(e) => setGstId(e.target.value)} className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Rating</label>
              <input type="number" placeholder="Rating" value={rating} onChange={(e) => setRating(e.target.value)} className="border p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" />
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-300">Raw Materials</h3>
              <div className="flex flex-wrap">
                {allRawMaterials.map((material) => (
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
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">Update Supplier</button>
          </form>
        </div>
      );
    }

    export default EditSupplier;
