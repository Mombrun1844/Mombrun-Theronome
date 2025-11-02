
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../App';
import StatCard from './shared/StatCard';
import Card from './shared/Card';
import StockProgressBar from './shared/StockProgressBar';
import { DollarSign, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Product } from '../types';

const Dashboard: React.FC = () => {
    const { products, sales, formatCurrency } = useContext(AppContext);

    const stats = useMemo(() => {
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
        const totalSalesCount = sales.length;
        const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
        return { totalRevenue, totalProfit, totalSalesCount, lowStockCount };
    }, [sales, products]);

    const lowStockProducts = useMemo(() => {
        return products.filter(p => p.stock > 0 && p.stock <= 10).sort((a,b) => a.stock - b.stock);
    }, [products]);

    const outOfStockProducts = useMemo(() => {
        return products.filter(p => p.stock === 0);
    }, [products]);
    
    const topSellingProducts = useMemo(() => {
      return [...products]
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 5)
        .map(p => {
            const revenue = p.salePrice * p.totalSales;
            const profit = (p.salePrice - p.purchasePrice) * p.totalSales;
            return { ...p, revenue, profit };
        });
    }, [products]);

    const salesChartData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day

        const dailyRevenue: { [key: string]: number } = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dailyRevenue[date.toISOString().split('T')[0]] = 0;
        }

        sales.forEach(sale => {
            const saleDate = new Date(sale.date);
            saleDate.setHours(0, 0, 0, 0); // Normalize to start of day
            const dateKey = saleDate.toISOString().split('T')[0];
            if (dailyRevenue.hasOwnProperty(dateKey)) {
                dailyRevenue[dateKey] += sale.total;
            }
        });

        const data = Object.keys(dailyRevenue)
            .sort() // Sort dates chronologically
            .map(dateKey => {
                const date = new Date(dateKey);
                const dayOfWeek = date.toLocaleString('fr-FR', { weekday: 'short' });
                return {
                    name: dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1), // Capitalize first letter
                    date: date.toLocaleDateString('fr-FR'),
                    revenue: dailyRevenue[dateKey],
                };
            });
        
        return data;
    }, [sales]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Tableau de Bord</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<DollarSign />} title="Revenus Totaux" value={formatCurrency(stats.totalRevenue)} colorClass="bg-blue-500/50" />
                <StatCard icon={<TrendingUp />} title="Bénéfices Nets" value={formatCurrency(stats.totalProfit)} colorClass="bg-green-500/50" />
                <StatCard icon={<Package />} title="Ventes Totales" value={stats.totalSalesCount} colorClass="bg-purple-500/50" />
                <StatCard icon={<AlertTriangle />} title="Stock Faible" value={stats.lowStockCount} colorClass="bg-orange-500/50" />
            </div>

            <Card className="col-span-full">
                <h2 className="text-xl font-semibold mb-4">Évolution des Revenus (7 Derniers Jours)</h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={salesChartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" tickFormatter={(value) => formatCurrency(value)} />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-slate-700/80 backdrop-blur-sm p-3 rounded-lg border border-white/10 text-white shadow-lg">
                                                <p className="font-semibold">{payload[0].payload.date}</p>
                                                <p>Revenu: <span className="text-purple-400 font-bold">{formatCurrency(payload[0].value as number)}</span></p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                                cursor={{ stroke: '#8884d8', strokeWidth: 2, strokeDasharray: "3 3" }}
                            />
                            <Line type="monotone" dataKey="revenue" stroke="#A78BFA" strokeWidth={2} dot={{ stroke: '#A78BFA', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">Top 5 Produits les Plus Vendus</h2>
                    <div className="space-y-4">
                        {topSellingProducts.map(p => (
                            <div key={p.id} className="p-3 bg-white/5 rounded-lg">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-medium">{p.name}</span>
                                    <span className="text-sm text-gray-400">{p.totalSales} vendus</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-green-400">Profit: {formatCurrency(p.profit)}</span>
                                    <span>Revenu: {formatCurrency(p.revenue)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <h2 className="text-xl font-semibold mb-4 text-orange-400">Alertes de Stock Faible (≤ 10)</h2>
                        <div className="space-y-3 max-h-40 overflow-y-auto">
                           {lowStockProducts.length > 0 ? lowStockProducts.map(p => (
                               <div key={p.id}>
                                   <div className="flex justify-between items-center text-sm mb-1">
                                       <span>{p.name}</span>
                                       <span className="font-bold">{p.stock}</span>
                                   </div>
                                   <StockProgressBar stock={p.stock} />
                               </div>
                           )) : <p className="text-gray-400">Aucun produit en stock faible.</p>}
                        </div>
                    </Card>
                     <Card>
                        <h2 className="text-xl font-semibold mb-4 text-red-500">Produits Épuisés</h2>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {outOfStockProducts.length > 0 ? outOfStockProducts.map(p => (
                                <p key={p.id} className="text-sm">{p.name}</p>
                            )) : <p className="text-gray-400">Aucun produit épuisé.</p>}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;