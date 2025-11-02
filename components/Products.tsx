
import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../App';
import type { Product } from '../types';
import Modal from './shared/Modal';
import Card from './shared/Card';
import StockProgressBar from './shared/StockProgressBar';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

const ProductForm: React.FC<{ product?: Product; onSave: (product: Omit<Product, 'id'|'totalSales'> | Product) => void; onClose: () => void }> = ({ product, onSave, onClose }) => {
    const { categories } = useContext(AppContext);
    const [name, setName] = useState(product?.name || '');
    const [categoryId, setCategoryId] = useState(product?.categoryId || (categories[0]?.id || ''));
    const [stock, setStock] = useState(product?.stock || 0);
    const [salePrice, setSalePrice] = useState(product?.salePrice || 0);
    const [purchasePrice, setPurchasePrice] = useState(product?.purchasePrice || 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const productData = { name, categoryId, stock, salePrice, purchasePrice };
        if (product) {
            onSave({ ...product, ...productData });
        } else {
            onSave(productData);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300">Nom du produit</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 bg-white/10 p-2 rounded-md border border-white/20 focus:ring-purple-500 focus:border-purple-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300">Catégorie</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required className="w-full mt-1 bg-white/10 p-2 rounded-md border border-white/20 focus:ring-purple-500 focus:border-purple-500">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Stock</label>
                    <input type="number" value={stock} onChange={e => setStock(Number(e.target.value))} required min="0" className="w-full mt-1 bg-white/10 p-2 rounded-md border border-white/20 focus:ring-purple-500 focus:border-purple-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Prix de vente (HTG)</label>
                    <input type="number" value={salePrice} onChange={e => setSalePrice(Number(e.target.value))} required min="0" className="w-full mt-1 bg-white/10 p-2 rounded-md border border-white/20 focus:ring-purple-500 focus:border-purple-500" />
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-300">Prix d'achat (HTG)</label>
                <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(Number(e.target.value))} required min="0" className="w-full mt-1 bg-white/10 p-2 rounded-md border border-white/20 focus:ring-purple-500 focus:border-purple-500" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors">Annuler</button>
                <button type="submit" className="py-2 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors font-semibold">Sauvegarder</button>
            </div>
        </form>
    );
};


const Products: React.FC = () => {
    const { products, categories, addProduct, updateProduct, deleteProduct, formatCurrency } = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

    const filteredProducts = useMemo(() => {
        return products
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(p => filterCategory === 'all' || p.categoryId === filterCategory);
    }, [products, searchTerm, filterCategory]);

    const handleSaveProduct = (productData: Omit<Product, 'id'|'totalSales'> | Product) => {
        if ('id' in productData) {
            updateProduct(productData);
        } else {
            addProduct(productData);
        }
        setIsModalOpen(false);
        setEditingProduct(undefined);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold">Gestion des Produits</h1>
                <button onClick={() => { setEditingProduct(undefined); setIsModalOpen(true); }} className="flex items-center gap-2 py-2 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors font-semibold">
                    <Plus size={20} />
                    Ajouter un Produit
                </button>
            </div>
            
            <Card>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Rechercher un produit..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/5 p-2 pl-10 rounded-md border border-white/20 focus:ring-purple-500 focus:border-purple-500" />
                    </div>
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full md:w-auto bg-white/5 p-2 rounded-md border border-white/20 focus:ring-purple-500 focus:border-purple-500">
                        <option value="all">Toutes les catégories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </Card>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-white/10">
                        <tr>
                            <th className="p-4">Produit</th>
                            <th className="p-4">Catégorie</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4">Prix Vente</th>
                            <th className="p-4">Marge</th>
                            <th className="p-4">Ventes</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(p => {
                            const margin = p.salePrice - p.purchasePrice;
                            return (
                                <tr key={p.id} className="border-b border-white/10 hover:bg-white/5">
                                    <td className="p-4 font-medium">{p.name}</td>
                                    <td className="p-4 text-gray-300">{categoryMap.get(p.categoryId)?.name || 'N/A'}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span>{p.stock}</span>
                                            <StockProgressBar stock={p.stock} />
                                        </div>
                                    </td>
                                    <td className="p-4">{formatCurrency(p.salePrice)}</td>
                                    <td className={`p-4 font-semibold ${margin > 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(margin)}</td>
                                    <td className="p-4">{p.totalSales}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 text-blue-400 hover:text-blue-300"><Edit size={18} /></button>
                                            <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {filteredProducts.length === 0 && <p className="text-center p-8 text-gray-400">Aucun produit trouvé.</p>}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? "Modifier le Produit" : "Ajouter un Produit"}>
                <ProductForm product={editingProduct} onSave={handleSaveProduct} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Products;
