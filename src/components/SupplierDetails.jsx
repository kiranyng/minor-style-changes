import React, { useState, useEffect } from 'react';
    import { useParams } from 'react-router-dom';
    import { getSuppliers, saveSupplier, getRawMaterials } from '../utils/storage';
    import Transactions from './Transactions';

    function SupplierDetails() {
      const { supplierName } = useParams();
      const [supplier, setSupplier] = useState(null);
      const [activeTab, setActiveTab] = useState('Details');
      const [conversationNotes, setConversationNotes] = useState('');
      const [conversationHistory, setConversationHistory] = useState([]);
      const [lastConversationSummary, setLastConversationSummary] = useState('');
      const [rawMaterials, setRawMaterials] = useState([]);

      useEffect(() => {
        const fetchSupplier = async () => {
          const suppliers = await getSuppliers();
          const foundSupplier = suppliers.find(supplier => supplier.name === supplierName);
          setSupplier(foundSupplier);
          if (foundSupplier) {
            setConversationHistory(foundSupplier.conversationHistory || []);
            setLastConversationSummary(foundSupplier.lastConversationSummary || '');
          }
        };
        const fetchRawMaterials = async () => {
          const materials = await getRawMaterials();
          setRawMaterials(materials);
        };
        fetchSupplier();
        fetchRawMaterials();
      }, [supplierName]);

      const handleAddNote = async () => {
        if (!supplier) return;
        const newHistory = [...conversationHistory, { note: conversationNotes, date: new Date().toISOString() }];
        setConversationHistory(newHistory);
        setLastConversationSummary(conversationNotes);
        setConversationNotes('');
        const updatedSupplier = { ...supplier, conversationHistory: newHistory, lastConversationSummary: conversationNotes };
        const suppliers = await getSuppliers();
        const updatedSuppliers = suppliers.map(s => s.name === supplier.name ? updatedSupplier : s);
        await saveSupplier(updatedSuppliers.find(s => s.name === supplier.name));
        setSupplier(updatedSupplier);
      };

      if (!supplier) {
        return <div className="dark:bg-gray-700 p-4">Loading...</div>;
      }

      return (
        <div className="dark:bg-gray-700 p-4">
          <h2 className="text-2xl font-bold mb-4 dark:text-gray-300">{supplier.name}</h2>
          <div className="flex border-b border-gray-300 dark:border-gray-600 mb-4">
            <button
              onClick={() => setActiveTab('Details')}
              className={`py-2 px-4 ${activeTab === 'Details' ? 'border-b-2 border-blue-500 text-blue-500 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('Conversations')}
              className={`py-2 px-4 ${activeTab === 'Conversations' ? 'border-b-2 border-blue-500 text-blue-500 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}
            >
              Conversations
            </button>
            <button
              onClick={() => setActiveTab('Transactions')}
              className={`py-2 px-4 ${activeTab === 'Transactions' ? 'border-b-2 border-blue-500 text-blue-500 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}
            >
              Transactions
            </button>
          </div>
          {activeTab === 'Details' && (
            <div className="dark:text-gray-300">
              <p>Address: {supplier.address}</p>
              <p>Phone: {supplier.phone}</p>
              <p>GST ID: {supplier.gstId}</p>
              <p>Rating: {supplier.rating}</p>
              <h4 className="text-lg font-semibold mt-4 mb-2 dark:text-gray-300">Raw Materials</h4>
              <ul className="list-disc list-inside">
                {supplier.rawMaterials && supplier.rawMaterials.map((material, index) => (
                  <li key={index} className="dark:text-gray-300">{material}</li>
                ))}
              </ul>
            </div>
          )}
          {activeTab === 'Conversations' && (
            <div>
              <textarea
                placeholder="Add conversation notes"
                value={conversationNotes}
                onChange={(e) => setConversationNotes(e.target.value)}
                className="border p-2 mb-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              />
              <button onClick={handleAddNote} className="bg-blue-500 text-white p-2 rounded">Add Note</button>
              {conversationHistory.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-lg font-semibold mb-2 dark:text-gray-300">Conversation History</h4>
                  <ul className="space-y-2">
                    {conversationHistory.map((item, index) => (
                      <li key={index} className="border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
                        <p>{item.note}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(item.date).toLocaleString()}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {lastConversationSummary && (
                <div className="mt-4">
                  <h4 className="text-lg font-semibold mb-2 dark:text-gray-300">Last Conversation Summary</h4>
                  <p className="border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">{lastConversationSummary}</p>
                </div>
              )}
            </div>
          )}
          {activeTab === 'Transactions' && (
            <Transactions supplierName={supplierName} />
          )}
        </div>
      );
    }

    export default SupplierDetails;
