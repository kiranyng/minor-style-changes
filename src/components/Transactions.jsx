import React, { useState, useEffect } from 'react';
    import localforage from 'localforage';
    import { FaChevronDown, FaChevronUp, FaFilter, FaSort, FaSortAlphaDown, FaSortAlphaUp } from 'react-icons/fa';

    function Transactions({ supplierName, expandTransactionId }) {
      const [transactions, setTransactions] = useState([]);
      const [expandedTransactions, setExpandedTransactions] = useState({});
      const [currency, setCurrency] = useState('USD');
      const [currentPage, setCurrentPage] = useState(1);
      const [transactionsPerPage] = useState(10);
      const [selectedStatus, setSelectedStatus] = useState('all');
      const [sortOption, setSortOption] = useState('date');
      const [sortDirection, setSortDirection] = useState('desc');

      useEffect(() => {
        const fetchTransactions = async () => {
          const allTransactions = await localforage.getItem('transactions') || [];
          const filteredTransactions = supplierName ? allTransactions.filter(transaction => transaction.metadata.supplier === supplierName) : allTransactions;
          setTransactions(filteredTransactions);
        };
        const fetchCurrency = async () => {
          const storedCurrency = await localforage.getItem('currency');
          if (storedCurrency) setCurrency(storedCurrency);
        };
        fetchTransactions();
        fetchCurrency();
      }, [supplierName]);

      useEffect(() => {
        if (expandTransactionId) {
          setExpandedTransactions(prev => ({
            ...prev,
            [expandTransactionId]: true
          }));
        }
      }, [expandTransactionId]);

      const handleCompleteTransaction = async (transactionId) => {
        const updatedTransactions = transactions.map(transaction => {
          if (transaction.id === transactionId) {
            return { ...transaction, status: 'completed' };
          }
          return transaction;
        });
        setTransactions(updatedTransactions);
        await localforage.setItem('transactions', updatedTransactions);

        const transaction = updatedTransactions.find(t => t.id === transactionId);
        if (transaction) {
          const materials = await localforage.getItem('rawMaterials') || [];
          const updatedMaterials = materials.map(material => {
            if (material.name === transaction.metadata.materialName) {
              return { ...material, availableQuantity: material.availableQuantity + transaction.metadata.quantity };
            }
            return material;
          });
          await localforage.setItem('rawMaterials', updatedMaterials);
        }
      };

      const toggleTransaction = (transactionId) => {
        setExpandedTransactions(prev => ({
          ...prev,
          [transactionId]: !prev[transactionId]
        }));
      };

      const formatCurrency = (amount) => {
        const formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
        });
        return formatter.format(amount);
      };

      const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
        setCurrentPage(1);
      };

      const handleSortChange = (e) => {
        setSortOption(e.target.value);
        setCurrentPage(1);
      };

      const handleSortDirectionChange = () => {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        setCurrentPage(1);
      };

      const filterAndSortTransactions = () => {
        let filteredTransactions = transactions;
        if (selectedStatus !== 'all') {
          filteredTransactions = transactions.filter(transaction => transaction.status === selectedStatus);
        }

        filteredTransactions.sort((a, b) => {
          let comparison = 0;
          if (sortOption === 'date') {
            comparison = new Date(b.date) - new Date(a.date);
          } else if (sortOption === 'materialName') {
            const nameA = a.metadata?.materialName || '';
            const nameB = b.metadata?.materialName || '';
            comparison = nameA.localeCompare(nameB);
          } else if (sortOption === 'supplier') {
            const supplierA = a.metadata?.supplier || '';
            const supplierB = b.metadata?.supplier || '';
            comparison = supplierA.localeCompare(supplierB);
          }
          return sortDirection === 'asc' ? comparison : -comparison;
        });

        return filteredTransactions;
      };

      const filteredTransactions = filterAndSortTransactions();

      const indexOfLastTransaction = currentPage * transactionsPerPage;
      const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
      const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

      const paginate = (pageNumber) => setCurrentPage(pageNumber);

      const pageNumbers = [];
      for (let i = 1; i <= Math.ceil(filteredTransactions.length / transactionsPerPage); i++) {
        pageNumbers.push(i);
      }

      return (
        <div className="dark:bg-gray-700 p-4">
          <h3 className="text-xl font-semibold mb-4 dark:text-gray-300">Transactions</h3>
          <div className="flex items-center mb-4">
            <label className="mr-2 dark:text-gray-300 flex items-center">
              <FaFilter className="mr-1" />
            </label>
            <select value={selectedStatus} onChange={handleStatusChange} className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <label className="ml-4 mr-2 dark:text-gray-300 flex items-center">
              <FaSort className="mr-1" />
            </label>
            <select value={sortOption} onChange={handleSortChange} className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
              <option value="date">Date</option>
              <option value="materialName">Material</option>
              <option value="supplier">Supplier</option>
            </select>
            <button onClick={handleSortDirectionChange} className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-2 rounded">
              {sortDirection === 'asc' ? <FaSortAlphaDown /> : <FaSortAlphaUp />}
            </button>
          </div>
          {transactions.length === 0 ? (
            <p className="dark:text-gray-300">No transactions available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                <thead>
                  <tr>
                    <th className="border p-2 dark:border-gray-600 dark:text-gray-300">ID</th>
                    <th className="border p-2 dark:border-gray-600 dark:text-gray-300">Type</th>
                    <th className="border p-2 dark:border-gray-600 dark:text-gray-300">Status</th>
                    <th className="border p-2 dark:border-gray-600 dark:text-gray-300">Date</th>
                    <th className="border p-2 dark:border-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.map((transaction) => (
                    <React.Fragment key={transaction.id}>
                      <tr className="hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer" onClick={() => toggleTransaction(transaction.id)}>
                        <td className="border p-2 dark:border-gray-600 dark:text-gray-300">
                          <div className="flex items-center justify-between">
                            <span>{transaction.id}</span>
                            {expandedTransactions[transaction.id] ? <FaChevronUp className="h-4 w-4" /> : <FaChevronDown className="h-4 w-4" />}
                          </div>
                        </td>
                        <td className="border p-2 dark:border-gray-600 dark:text-gray-300">{transaction.type}</td>
                        <td className="border p-2 dark:border-gray-600 dark:text-gray-300">{transaction.status}</td>
                        <td className="border p-2 dark:border-gray-600 dark:text-gray-300">{new Date(transaction.date).toLocaleString()}</td>
                        <td className="border p-2 dark:border-gray-600 dark:text-gray-300">
                          {transaction.status === 'pending' && (
                            <button onClick={() => handleCompleteTransaction(transaction.id)} className="bg-green-500 text-white p-1 rounded">Complete</button>
                          )}
                        </td>
                      </tr>
                      {expandedTransactions[transaction.id] && (
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <td colSpan="5" className="p-4">
                            <div className="flex flex-col">
                              <h4 className="font-bold dark:text-gray-300">Metadata:</h4>
                              {Object.entries(transaction.metadata).map(([key, value]) => (
                                <p key={key} className="dark:text-gray-300">
                                  {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                                </p>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <nav className="flex justify-center mt-4">
            <ul className="flex space-x-2">
              {pageNumbers.map(number => (
                <li key={number}>
                  <button
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 rounded ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  >
                    {number}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      );
    }

    export default Transactions;
