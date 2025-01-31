import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { getOrders } from '../utils/storage';
import { FaCog, FaBars, FaTimes, FaPlus, FaChevronDown, FaChevronUp, FaList, FaPlusSquare } from 'react-icons/fa';

function Navigation() {
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRawMaterialsSubMenuOpen, setIsRawMaterialsSubMenuOpen] = useState(false);
  const [isSuppliersSubMenuOpen, setIsSuppliersSubMenuOpen] = useState(false);
  const [isProductsSubMenuOpen, setIsProductsSubMenuOpen] = useState(false);
  const [isCategoriesSubMenuOpen, setIsCategoriesSubMenuOpen] = useState(false);
  const navRef = useRef(null);
  const rawMaterialsSubMenuRef = useRef(null);
  const suppliersSubMenuRef = useRef(null);
  const productsSubMenuRef = useRef(null);
  const categoriesSubMenuRef = useRef(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const orders = await getOrders();
      const pendingOrders = orders.filter(order => order.orderItems.some(item => item.status === 'Pending'));
      setNewOrdersCount(pendingOrders.length);
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      const orders = await getOrders();
      const pendingOrders = orders.filter(order => order.orderItems.some(item => item.status === 'Pending'));
      setNewOrdersCount(pendingOrders.length);
    };
    fetchOrders();
  }, [newOrdersCount]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleRawMaterialsSubMenu = () => {
    setIsRawMaterialsSubMenuOpen(!isRawMaterialsSubMenuOpen);
  };

  const toggleSuppliersSubMenu = () => {
    setIsSuppliersSubMenuOpen(!isSuppliersSubMenuOpen);
  };

  const toggleProductsSubMenu = () => {
    setIsProductsSubMenuOpen(!isProductsSubMenuOpen);
  };

  const toggleCategoriesSubMenu = () => {
    setIsCategoriesSubMenuOpen(!isCategoriesSubMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (rawMaterialsSubMenuRef.current && !rawMaterialsSubMenuRef.current.contains(event.target)) {
        setIsRawMaterialsSubMenuOpen(false);
      }
      if (suppliersSubMenuRef.current && !suppliersSubMenuRef.current.contains(event.target)) {
        setIsSuppliersSubMenuOpen(false);
      }
      if (productsSubMenuRef.current && !productsSubMenuRef.current.contains(event.target)) {
        setIsProductsSubMenuOpen(false);
      }
      if (categoriesSubMenuRef.current && !categoriesSubMenuRef.current.contains(event.target)) {
        setIsCategoriesSubMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navRef, rawMaterialsSubMenuRef, suppliersSubMenuRef, productsSubMenuRef, categoriesSubMenuRef]);

  const handleSubMenuClick = () => {
    setIsRawMaterialsSubMenuOpen(false);
    setIsSuppliersSubMenuOpen(false);
    setIsProductsSubMenuOpen(false);
    setIsCategoriesSubMenuOpen(false);
  };

  return (
    <nav ref={navRef} className="bg-gray-800 p-4 mb-4 dark:bg-gray-900 relative z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white font-bold text-xl">Business App</Link>
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
          </button>
        </div>
        <div className={`md:flex space-x-4 items-center absolute md:relative top-full left-0 md:top-0 md:left-auto w-full md:w-auto bg-gray-800 dark:bg-gray-900 p-4 md:p-0 z-20 ${isMenuOpen ? 'block' : 'hidden' } md:block`}>
          <div className="md:flex md:items-center md:space-x-4 md:ml-auto">
            <div className="relative">
              <button onClick={toggleRawMaterialsSubMenu} className="nav-link flex items-center">
                Raw Materials
                {isRawMaterialsSubMenuOpen ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
              </button>
              {isRawMaterialsSubMenuOpen && (
                <div ref={rawMaterialsSubMenuRef} className="absolute left-0 mt-2 bg-gray-700 dark:bg-gray-800 rounded-md shadow-md p-2 z-30 w-max">
                  <NavLink to="/raw-materials" onClick={handleSubMenuClick} className={({ isActive }) => isActive ? 'nav-link active flex items-center' : 'nav-link flex items-center'}>
                    <FaList className="mr-1" />
                    List
                  </NavLink>
                  <NavLink to="/raw-materials/add" onClick={handleSubMenuClick} className={({ isActive }) => isActive ? 'nav-link active flex items-center' : 'nav-link flex items-center'}>
                    <FaPlusSquare className="mr-1" />
                    New
                  </NavLink>
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={toggleSuppliersSubMenu} className="nav-link flex items-center">
                Suppliers
                {isSuppliersSubMenuOpen ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
              </button>
              {isSuppliersSubMenuOpen && (
                <div ref={suppliersSubMenuRef} className="absolute left-0 mt-2 bg-gray-700 dark:bg-gray-800 rounded-md shadow-md p-2 z-30 w-max">
                  <NavLink to="/suppliers" onClick={handleSubMenuClick} className={({ isActive }) => isActive ? 'nav-link active flex items-center' : 'nav-link flex items-center'}>
                    <FaList className="mr-1" />
                    List
                  </NavLink>
                  <NavLink to="/suppliers/add" onClick={handleSubMenuClick} className={({ isActive }) => isActive ? 'nav-link active flex items-center' : 'nav-link flex items-center'}>
                    <FaPlusSquare className="mr-1" />
                    New
                  </NavLink>
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={toggleCategoriesSubMenu} className="nav-link flex items-center">
                Categories
                {isCategoriesSubMenuOpen ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
              </button>
              {isCategoriesSubMenuOpen && (
                <div ref={categoriesSubMenuRef} className="absolute left-0 mt-2 bg-gray-700 dark:bg-gray-800 rounded-md shadow-md p-2 z-30 w-max">
                  <NavLink to="/product-categories" onClick={handleSubMenuClick} className={({ isActive }) => isActive ? 'nav-link active flex items-center' : 'nav-link flex items-center'}>
                    <FaList className="mr-1" />
                    List
                  </NavLink>
                  <NavLink to="/product-categories/add" onClick={handleSubMenuClick} className={({ isActive }) => isActive ? 'nav-link active flex items-center' : 'nav-link flex items-center'}>
                    <FaPlusSquare className="mr-1" />
                    New
                  </NavLink>
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={toggleProductsSubMenu} className="nav-link flex items-center">
                Products
                {isProductsSubMenuOpen ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
              </button>
              {isProductsSubMenuOpen && (
                <div ref={productsSubMenuRef} className="absolute left-0 mt-2 bg-gray-700 dark:bg-gray-800 rounded-md shadow-md p-2 z-30 w-max">
                  <NavLink to="/products" onClick={handleSubMenuClick} className={({ isActive }) => isActive ? 'nav-link active flex items-center' : 'nav-link flex items-center'}>
                    <FaList className="mr-1" />
                    List
                  </NavLink>
                  <NavLink to="/products/add" onClick={handleSubMenuClick} className={({ isActive }) => isActive ? 'nav-link active flex items-center' : 'nav-link flex items-center'}>
                    <FaPlusSquare className="mr-1" />
                    New
                  </NavLink>
                </div>
              )}
            </div>
            <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Orders
            </NavLink>
            <NavLink to="/production" className={({ isActive }) => isActive ? 'nav-link active relative' : 'nav-link relative'}>
              Production
              {newOrdersCount > 0 && (
                <span className="absolute top-[-5px] right-[-5px] bg-red-500 text-white rounded-full px-2 text-xs">{newOrdersCount}</span>
              )}
            </NavLink>
            <NavLink to="/transactions" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Transactions</NavLink>
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <FaCog className="text-xl" />
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
