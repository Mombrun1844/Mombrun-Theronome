import React, { useState, useMemo, useCallback } from 'react';
import type { Category, Product, Sale, AppNotification, NotificationType, AppSettings } from './types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';
import Dashboard from './components/Dashboard.tsx';
import Products from './components/Products.tsx';
import Sales from './components/Sales.tsx';
import Categories from './components/Categories.tsx';
import Notifications from './components/Notifications.tsx';
import Settings from './components/Settings.tsx';
import { Package, ShoppingCart, LayoutGrid, Bell, Settings as SettingsIcon, Menu, X } from 'lucide-react';

export const AppContext = React.createContext<{
    categories: Category[];
    products: Product[];
    sales: Sale[];
    notifications: AppNotification[];
    settings: AppSettings;
    addCategory: (category: Omit<Category, 'id'>) => void;
    deleteCategory: (id: string) => void;
    addProduct: (product: Omit<Product, 'id' | 'totalSales'>) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (id: string) => void;
    // FIX: Updated addSale definition to omit 'unitPrice' as it's derived internally.
    addSale: (sale: Omit<Sale, 'id' | 'date' | 'productName' | 'total' | 'profit' | 'unitPrice'>) => void;
    formatCurrency: (amount: number) => string;
    addNotification: (message: string, type: NotificationType) => void;
    updateSettings: (settings: AppSettings) => void;
}>({
    categories: [],
    products: [],
    sales: [],
    notifications: [],
    settings: { notificationEmail: '' },
    addCategory: () => {},
    deleteCategory: () => {},
    addProduct: () => {},
    updateProduct: () => {},
    deleteProduct: () => {},
    addSale: () => {},
    formatCurrency: () => '',
    addNotification: () => {},
    updateSettings: () => {},
});

type View = 'dashboard' | 'products' | 'sales' | 'categories' | 'notifications' | 'settings';

// Define the props interface for NavItem
interface NavItemProps {
    icon: React.ElementType;
    label: string;
    view: View;
    // FIX: Added activeView, setActiveView, and setIsMenuOpen to NavItemProps.
    activeView: View;
    setActiveView: (view: View) => void;
    setIsMenuOpen: (isOpen: boolean) => void;
}

// Define the NavItem component using React.FC
const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, view, activeView, setActiveView, setIsMenuOpen }) => (
    <li className="w-full">
        <button
            // FIX: Removed global references and used props setActiveView and setIsMenuOpen.
            onClick={() => { setActiveView(view); setIsMenuOpen(false); }}
            className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 ${
                // FIX: Used props activeView.
                activeView === view
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
        >
            <Icon className="w-6 h-6 mr-3" />
            <span className="font-medium">{label}</span>
        </button>
    </li>
);

export default function App() {
    const [categories, setCategories] = useLocalStorage<Category[]>('pos-categories', INITIAL_CATEGORIES);
    const [products, setProducts] = useLocalStorage<Product[]>('pos-products', INITIAL_PRODUCTS);
    const [sales, setSales] = useLocalStorage<Sale[]>('pos-sales', []);
    const [notifications, setNotifications] = useLocalStorage<AppNotification[]>('pos-notifications', []);
    const [settings, setSettings] = useLocalStorage<AppSettings>('pos-settings', { notificationEmail: 'admin@example.com' });

    const [activeView, setActiveView] = useState<View>('dashboard');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const addNotification = useCallback((message: string, type: NotificationType) => {
        const newNotification: AppNotification = {
            id: Date.now().toString(),
            message,
            type,
            timestamp: new Date().toISOString(),
        };
        setNotifications(prev => [newNotification, ...prev]);

        if (settings.notificationEmail && (type === 'error' || type === 'warning')) {
            const emailNotification: AppNotification = {
                id: (Date.now() + 1).toString(),
                message: `[Email Simulé] Envoyé à ${settings.notificationEmail}: ${message}`,
                type: 'info',
                timestamp: new Date().toISOString(),
            };
            setNotifications(prev => [emailNotification, ...prev]);
        }
    }, [setNotifications, settings.notificationEmail]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-HT', { style: 'currency', currency: 'HTG' }).format(amount);
    };

    const addCategory = (category: Omit<Category, 'id'>) => {
        const newCategory = { ...category, id: Date.now().toString() };
        setCategories(prev => [...prev, newCategory]);
        addNotification(`Catégorie "${category.name}" ajoutée avec succès.`, 'success');
    };

    const deleteCategory = (id: string) => {
        const categoryToDelete = categories.find(c => c.id === id);
        if (products.some(p => p.categoryId === id)) {
            addNotification(`Impossible de supprimer la catégorie "${categoryToDelete?.name}". Elle contient des produits.`, 'error');
            return;
        }
        setCategories(prev => prev.filter(c => c.id !== id));
        addNotification(`Catégorie "${categoryToDelete?.name}" supprimée.`, 'info');
    };

    const addProduct = (product: Omit<Product, 'id'|'totalSales'>) => {
        const newProduct = { ...product, id: Date.now().toString(), totalSales: 0 };
        setProducts(prev => [...prev, newProduct]);
        addNotification(`Produit "${product.name}" ajouté avec succès.`, 'success');
    };

    const updateProduct = (updatedProduct: Product) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        addNotification(`Produit "${updatedProduct.name}" mis à jour.`, 'info');
    };
    
    const deleteProduct = (id: string) => {
        const productToDelete = products.find(p => p.id === id);
        setProducts(prev => prev.filter(p => p.id !== id));
        addNotification(`Produit "${productToDelete?.name}" supprimé.`, 'info');
    };

    // FIX: Updated the type of the 'sale' parameter to omit 'unitPrice' since it's calculated.
    const addSale = (sale: Omit<Sale, 'id' | 'date' | 'productName' | 'total' | 'profit' | 'unitPrice'>) => {
        const product = products.find(p => p.id === sale.productId);
        if (!product || product.stock < sale.quantity) {
            addNotification(`Stock insuffisant pour "${product?.name}". Vente annulée.`, 'error');
            return;
        }
        
        const profit = (product.salePrice - product.purchasePrice) * sale.quantity;
        const newSale: Sale = {
            ...sale,
            id: Date.now().toString(),
            productName: product.name,
            date: new Date().toISOString(),
            total: product.salePrice * sale.quantity,
            unitPrice: product.salePrice, // unitPrice is calculated here.
            profit: profit,
        };
        setSales(prev => [newSale, ...prev]);

        const updatedProduct: Product = {
            ...product,
            stock: product.stock - sale.quantity,
            totalSales: product.totalSales + sale.quantity,
        };
        setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
        addNotification(`Vente de ${sale.quantity}x "${product.name}" enregistrée.`, 'success');

        if (updatedProduct.stock <= 10 && updatedProduct.stock > 0) {
            addNotification(`Stock faible pour "${product.name}" (${updatedProduct.stock} restants).`, 'warning');
        } else if (updatedProduct.stock === 0) {
            addNotification(`Stock épuisé pour "${product.name}".`, 'error');
        }
    };
    
    const updateSettings = (newSettings: AppSettings) => {
        setSettings(newSettings);
        addNotification('Paramètres mis à jour.', 'success');
    };

    const contextValue = useMemo(() => ({
        categories, products, sales, notifications, settings,
        addCategory, deleteCategory, addProduct, updateProduct, deleteProduct, addSale, formatCurrency, addNotification, updateSettings
    }), [categories, products, sales, notifications, settings, addNotification, deleteCategory, updateProduct, deleteProduct, addSale]);

    const renderView = () => {
        switch (activeView) {
            case 'dashboard': return <Dashboard />;
            case 'products': return <Products />;
            case 'sales': return <Sales />;
            case 'categories': return <Categories />;
            case 'notifications': return <Notifications />;
            case 'settings': return <Settings />;
            default: return <Dashboard />;
        }
    };

    // Define a type for elements in navItems for clearer type inference
    interface NavItemData {
        icon: React.ElementType;
        label: string;
        view: View;
    }

    const navItems: NavItemData[] = [
        { icon: LayoutGrid, label: 'Tableau de Bord', view: 'dashboard' },
        { icon: Package, label: 'Produits', view: 'products' },
        { icon: ShoppingCart, label: 'Ventes', view: 'sales' },
        { icon: LayoutGrid, label: 'Catégories', view: 'categories' },
        { icon: Bell, label: 'Notifications', view: 'notifications' },
        { icon: SettingsIcon, label: 'Paramètres', view: 'settings' },
    ];

    return (
        <AppContext.Provider value={contextValue}>
            <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm p-4 flex justify-between items-center shadow-md">
                    <h1 className="text-xl font-bold text-white">POS Haïti</h1>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </header>

                <aside className={`fixed top-0 left-0 h-full z-40 lg:relative lg:z-auto lg:translate-x-0 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} w-64 bg-slate-800/50 backdrop-blur-lg border-r border-white/10 p-4 lg:flex flex-col`}>
                    <div className="hidden lg:flex items-center mb-8">
                         <h1 className="text-2xl font-bold text-white">POS Haïti</h1>
                    </div>
                    <nav className="mt-16 lg:mt-0">
                        <ul className="space-y-2">
                            {/* FIX: Clarified NavItem component definition and explicitly typed navItems array to resolve potential TypeScript ambiguity. */}
                            {/* The 'key' prop is a special React attribute and is correctly handled; the previous error indicated a type inference issue. */}
                            {/* FIX: Passed activeView, setActiveView, and setIsMenuOpen as props to NavItem. */}
                            {navItems.map(item => <NavItem key={item.view} icon={item.icon} label={item.label} view={item.view} activeView={activeView} setActiveView={setActiveView} setIsMenuOpen={setIsMenuOpen} />)}
                        </ul>
                    </nav>
                </aside>
                
                <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 overflow-y-auto">
                    {renderView()}
                </main>
            </div>
        </AppContext.Provider>
    );
}