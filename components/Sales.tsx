import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import Modal from './shared/Modal';
import { Plus, ShoppingCart } from 'lucide-react';

const NewSaleForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { products, addSale } = useContext(AppContext);
    const [productId, setProductId] = useState(products.length > 0 ? products[0].id : '');
    const [quantity, setQuantity] = useState(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId || quantity <= 0) {
            alert("Veuillez sélectionner un produit et une quantité valide.");
            return;
        }
        // FIX: Removed unitPrice from the object passed to addSale, as it's now calculated internally.
        addSale({ productId, quantity });
        onClose();
    };
    
    const selectedProduct = products.find(p => p.id === productId);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300">Produit</label>
                <select value={productId} onChange={e => setProductId(e.target.value)} required className="w-full mt-1 bg-white/10 p-2 rounded-md border border-white/20 focus:ring-purple-500 focus:border-purple-500">
                    {products.filter(p => p.stock > 0).map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-300">Quantité</label>
                <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required min="1" max={selectedProduct?.stock || 1} className="w-full mt-1 bg-white/10 p-2 rounded-md border border-white/20 focus:ring-purple-500 focus:border-purple-500" />
            </div>
            
            {selectedProduct && (
                 <div className="p-4 bg-white/5 rounded-lg space-y-2">
                    <div className="flex justify-between"><span>Total:</span><span className="font-bold">{selectedProduct.salePrice * quantity} HTG</span></div>
                    <div className="flex justify-between"><span>Profit estimé:</span><span className={`font-bold ${(selectedProduct.salePrice - selectedProduct.purchasePrice) > 0 ? 'text-green-400' : 'text-red-400'}`}>{(selectedProduct.salePrice - selectedProduct.purchasePrice) * quantity} HTG</span></div>
                </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors">Annuler</button>
                <button type="submit" className="py-2 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors font-semibold">Enregistrer la Vente</button>
            </div>
        </form>
    );
}

const Sales: React.FC = () => {
    const { sales, formatCurrency } = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold">Gestion des Ventes</h1>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 py-2 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors font-semibold">
                    <Plus size={20} />
                    Nouvelle Vente
                </button>
            </div>

            <div className="overflow-x-auto bg-white/5 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 p-4">
                <h2 className="text-xl font-semibold mb-4 p-2">Historique des Ventes</h2>
                 <table className="w-full text-left">
                    <thead className="border-b border-white/10">
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Produit</th>
                            <th className="p-4">Qté</th>
                            <th className="p-4">Prix Unit.</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Profit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map(sale => (
                            <tr key={sale.id} className="border-b border-white/10 hover:bg-white/5">
                                <td className="p-4 text-sm text-gray-300">{new Date(sale.date).toLocaleString('fr-FR')}</td>
                                <td className="p-4 font-medium">{sale.productName}</td>
                                <td className="p-4">{sale.quantity}</td>
                                <td className="p-4">{formatCurrency(sale.unitPrice)}</td>
                                <td className="p-4">{formatCurrency(sale.total)}</td>
                                <td className={`p-4 font-semibold ${sale.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(sale.profit)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {sales.length === 0 && <div className="text-center p-8 text-gray-400 flex flex-col items-center gap-4"><ShoppingCart size={48} /><p>Aucune vente enregistrée pour le moment.</p></div>}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Enregistrer une Nouvelle Vente">
                <NewSaleForm onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Sales;