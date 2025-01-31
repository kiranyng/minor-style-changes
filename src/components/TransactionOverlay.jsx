import React from 'react';
    import { FaTimes } from 'react-icons/fa';

    function TransactionOverlay({ transaction, onClose }) {
      if (!transaction) return null;

      return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100">
              <FaTimes className="h-6 w-6" />
            </button>
            <h3 className="text-xl font-semibold mb-4 dark:text-gray-300">Transaction Details</h3>
            <div className="dark:text-gray-300">
              <p>Material: {transaction.materialName}</p>
              <p>Quantity: {transaction.quantity}</p>
              <p>Supplier: {transaction.supplier}</p>
              <p>Estimated Price: {transaction.estimatedPrice}</p>
              <p>Actual Price: {transaction.actualPrice}</p>
              <p>Date: {new Date(transaction.date).toLocaleString()}</p>
              <p>Status: {transaction.status}</p>
              <p>Invoice No: {transaction.invoiceNo || 'N/A'}</p>
              <p>Bank Transaction ID: {transaction.bankTransactionId || 'N/A'}</p>
              <p>Shipping ID: {transaction.shippingId || 'N/A'}</p>
            </div>
          </div>
        </div>
      );
    }

    export default TransactionOverlay;
