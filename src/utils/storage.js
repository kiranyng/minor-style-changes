import localforage from 'localforage';
    import { v4 as uuidv4 } from 'uuid';

    const rawMaterialsKey = 'rawMaterials';
    const productsKey = 'products';
    const ordersKey = 'orders';
    const categoriesKey = 'categories';
    const suppliersKey = 'suppliers';

    export const saveRawMaterial = async (material) => {
      try {
        const materials = await getRawMaterials();
        const existingMaterialIndex = materials.findIndex(m => m.name === material.name);
        if (existingMaterialIndex > -1) {
          materials[existingMaterialIndex] = material;
          await localforage.setItem(rawMaterialsKey, materials);
        } else {
          const newMaterial = { ...material, id: uuidv4() };
          await localforage.setItem(rawMaterialsKey, [...materials, newMaterial]);
        }
      } catch (error) {
        console.error('Error saving raw material:', error);
      }
    };

    export const getRawMaterials = async () => {
      try {
        const materials = await localforage.getItem(rawMaterialsKey);
        return materials || [];
      } catch (error) {
        console.error('Error getting raw materials:', error);
        return [];
      }
    };

    export const saveProduct = async (product) => {
      try {
        const products = await getProducts();
        const existingProductIndex = products.findIndex(p => p.id === product.id);
        if (existingProductIndex > -1) {
          products[existingProductIndex] = product;
          await localforage.setItem(productsKey, products);
        } else {
          const newProduct = { ...product, id: uuidv4() };
          await localforage.setItem(productsKey, [...products, newProduct]);
        }
      } catch (error) {
        console.error('Error saving product:', error);
      }
    };

    export const getProducts = async () => {
      try {
        const products = await localforage.getItem(productsKey);
        return products || [];
      } catch (error) {
        console.error('Error getting products:', error);
        return [];
      }
    };

    export const getProduct = async (productName) => {
      try {
        const products = await getProducts();
        return products.find(product => product.name === productName);
      } catch (error) {
        console.error('Error getting product:', error);
        return null;
      }
    };

    export const saveOrder = async (order) => {
      try {
        const orders = await getOrders();
        const newOrder = {
          ...order,
          orderItems: order.orderItems.map(item => ({ ...item, orderItemId: uuidv4() }))
        };
        await localforage.setItem(ordersKey, [...orders, newOrder]);
      } catch (error) {
        console.error('Error saving order:', error);
      }
    };

    export const getOrders = async () => {
      try {
        const orders = await localforage.getItem(ordersKey);
        return orders || [];
      } catch (error) {
        console.error('Error getting orders:', error);
        return [];
      }
    };

    export const saveCategory = async (category) => {
      try {
        const categories = await getCategories();
        const existingCategoryIndex = categories.findIndex(c => c.title === category.title);
        if (existingCategoryIndex > -1) {
          categories[existingCategoryIndex] = category;
          await localforage.setItem(categoriesKey, categories);
        } else {
          await localforage.setItem(categoriesKey, [...categories, category]);
        }
      } catch (error) {
        console.error('Error saving category:', error);
      }
    };

    export const getCategories = async () => {
      try {
        const categories = await localforage.getItem(categoriesKey);
        return categories || [];
      } catch (error) {
        console.error('Error getting categories:', error);
        return [];
      }
    };

    export const saveSupplier = async (supplier) => {
      try {
        const suppliers = await getSuppliers();
        const existingSupplierIndex = suppliers.findIndex(s => s.name === supplier.name);
        if (existingSupplierIndex > -1) {
          suppliers[existingSupplierIndex] = supplier;
          await localforage.setItem(suppliersKey, suppliers);
        } else {
          await localforage.setItem(suppliersKey, [...suppliers, supplier]);
        }
      } catch (error) {
        console.error('Error saving supplier:', error);
      }
    };

    export const getSuppliers = async () => {
      try {
        const suppliers = await localforage.getItem(suppliersKey);
        return suppliers || [];
      } catch (error) {
        console.error('Error getting suppliers:', error);
        return [];
      }
    };

    export const getSupplier = async (supplierName) => {
      try {
        const suppliers = await getSuppliers();
        return suppliers.find(supplier => supplier.name === supplierName);
      } catch (error) {
        console.error('Error getting supplier:', error);
        return null;
      }
    };

    export const getCategory = async (categoryTitle) => {
      try {
        const categories = await getCategories();
        return categories.find(category => category.title === categoryTitle);
      } catch (error) {
        console.error('Error getting category:', error);
        return null;
      }
    };

    export const getRawMaterial = async (materialName) => {
      try {
        const materials = await getRawMaterials();
        return materials.find(material => material.name === materialName);
      } catch (error) {
        console.error('Error getting raw material:', error);
        return null;
      }
    };
