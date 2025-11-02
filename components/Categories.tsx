
import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../App';
import type { Category } from '../types';
import Modal from './shared/Modal';
import { EMOJI_OPTIONS } from '../constants';
import { Plus, Trash2, Package } from 'lucide-react';

const CategoryForm: React.FC<{ onSave: (category: Omit<Category, 'id'>) => void; onClose: () => void }> = ({ onSave, onClose }) => {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState(EMOJI_OPTIONS[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, icon });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300">Nom de la catégorie</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 bg-white/10 p-2 rounded-md border border-white/20 focus:ring-purple-500 focus:border-purple-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300">Icône Emoji</label>
                <div className="grid grid-cols-5 gap-2 p-2 mt-1 bg-white/5 rounded-md">
                    {EMOJI_OPTIONS.map(emoji => (
                        <button key={emoji} type="button" onClick={() => setIcon(emoji)} className={`text-2xl p-2 rounded-md transition-all ${icon === emoji ? 'bg-purple-600 ring-2 ring-purple-400' : 'hover:bg-white/10'}`}>
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors">Annuler</button>
                <button type="submit" className="py-2 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors font-semibold">Sauvegarder</button>
            </div>
        </form>
    );
};

const Categories: React.FC = () => {
    const { categories, products, addCategory, deleteCategory } = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const productCounts = useMemo(() => {
        const counts = new Map<string, number>();
        products.forEach(p => {
            counts.set(p.categoryId, (counts.get(p.categoryId) || 0) + 1);
        });
        return counts;
    }, [products]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold">Gestion des Catégories</h1>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 py-2 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors font-semibold">
                    <Plus size={20} />
                    Nouvelle Catégorie
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map(cat => (
                    <div key={cat.id} className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 p-6 flex flex-col items-center justify-center text-center relative group">
                         <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => deleteCategory(cat.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-full"><Trash2 size={18} /></button>
                         </div>
                        <div className="text-5xl mb-3">{cat.icon}</div>
                        <h3 className="text-lg font-semibold">{cat.name}</h3>
                        <p className="text-sm text-gray-400 flex items-center gap-2"><Package size={14} />{productCounts.get(cat.id) || 0} produits</p>
                    </div>
                ))}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajouter une Catégorie">
                <CategoryForm onSave={(data) => { addCategory(data); setIsModalOpen(false); }} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Categories;
