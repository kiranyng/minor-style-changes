import React from 'react';
    import { Routes, Route } from 'react-router-dom';
    import RawMaterials from './components/RawMaterials';
    import Products from './components/Products';
    import Orders from './components/Orders';
    import Production from './components/Production';
    import Navigation from './components/Navigation';
    import ProductCategories from './components/ProductCategories';
    import Settings from './components/Settings';
    import Suppliers from './components/Suppliers';
    import SupplierDetails from './components/SupplierDetails';
    import AddSupplier from './components/AddSupplier';
    import ReplenishRawMaterial from './components/ReplenishRawMaterial';
    import AddProduct from './components/AddProduct';
    import AddCategory from './components/AddCategory';
    import AddRawMaterial from './components/AddRawMaterial';
    import EditProduct from './components/EditProduct';
    import EditRawMaterial from './components/EditRawMaterial';
    import EditSupplier from './components/EditSupplier';
    import EditCategory from './components/EditCategory';
    import Transactions from './components/Transactions';
    import Dashboard from './components/Dashboard';

    function App() {
      return (
        <div className="container">
          <Navigation />
          <Routes>
            <Route path="/raw-materials" element={<RawMaterials />} />
            <Route path="/raw-materials/add" element={<AddRawMaterial />} />
            <Route path="/raw-materials/:materialName/replenish" element={<ReplenishRawMaterial />} />
            <Route path="/raw-materials/edit/:materialName" element={<EditRawMaterial />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/add" element={<AddProduct />} />
            <Route path="/products/edit/:productName" element={<EditProduct />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/production" element={<Production />} />
            <Route path="/product-categories" element={<ProductCategories />} />
            <Route path="/product-categories/add" element={<AddCategory />} />
            <Route path="/product-categories/edit/:categoryTitle" element={<EditCategory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/suppliers/add" element={<AddSupplier />} />
            <Route path="/suppliers/edit/:supplierName" element={<EditSupplier />} />
            <Route path="/suppliers/:supplierName" element={<SupplierDetails />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </div>
      );
    }

    export default App;
