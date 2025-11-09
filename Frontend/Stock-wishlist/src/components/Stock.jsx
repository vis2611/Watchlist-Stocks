import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Trash2, Star, Search, BarChart3, AlertCircle } from 'lucide-react';

const API_BASE = 'https://watchlist-stocks.onrender.com' || 'http://localhost:3000';


export default function Stock() {
    const [watchlist, setWatchlist] = useState([]);
    const [stockInput, setStockInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);


    useEffect(() => {
        loadWatchlist();
    }, []);

    const validateStock = (symbol) => {
        if (!symbol) return null;
        const trimmed = String(symbol).trim().toUpperCase();
        const regex = /^[A-Z]{1,5}$/;
        return regex.test(trimmed) ? trimmed : null;
    };

    const loadWatchlist = async () => {
        setFetching(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/stocks`);
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();
            const names = Array.isArray(data)
                ? data.map(item => (typeof item === 'string' ? item : item.name))
                : [];
            setWatchlist(names);
        } catch (err) {
            console.error('Error fetching stocks:', err);
            setError('Could not load watchlist from server.');
        } finally {
            setFetching(false);
        }
    };

    const handleAddStock = async () => {
        setError('');
        setSuccess('');
        const validated = validateStock(stockInput);
        if (!validated) {
            setError('Stock symbol must be 1–5 uppercase letters only.');
            return;
        }
        if (watchlist.includes(validated)) {
            setError(`${validated} is already in your watchlist.`);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/stocks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: validated })
            });
            const body = await res.json();
            if (res.status === 201) {
                setSuccess(`${validated} added successfully!`);
                setWatchlist(prev => [...prev, validated]);
                setStockInput('');
            } else {
                setError(body.msg || 'Failed to add stock.');
            }
        } catch (err) {
            console.error(err);
            setError('Server not reachable.');
        } finally {
            setLoading(false);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const handleRemoveStock = async (symbol) => {
        try {
            await fetch(`${API_BASE}/stocks/${symbol}`, { method: 'DELETE' });
            setWatchlist(prev => prev.filter(s => s !== symbol));
            setSuccess(`${symbol} removed successfully!`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error(err);
            setError('Failed to remove stock.');
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm('Are you sure you want to clear your entire watchlist?')) return;
        try {
            await Promise.all(watchlist.map(symbol =>
                fetch(`${API_BASE}/stocks/${symbol}`, { method: 'DELETE' })
            ));
            setWatchlist([]);
            setSuccess('Watchlist cleared.');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error(err);
            setError('Failed to clear watchlist.');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleAddStock();
    };

    const filteredWatchlist = watchlist.filter(stock =>
        stock.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Header */}
            <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Stock Watchlist</h1>
                            <p className="text-slate-400 text-sm">Track your favorite stocks</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <div className="px-4 py-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <p className="text-xs text-slate-400">Total Stocks</p>
                            <p className="text-2xl font-bold text-blue-400">{watchlist.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Add Stock Section */}
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Plus className="w-5 h-5 text-blue-400" />
                        <h2 className="text-xl font-semibold text-white">Add New Stock</h2>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        {/* Input Field */}
                        <input
                            type="text"
                            value={stockInput}
                            onChange={(e) => setStockInput(e.target.value.toUpperCase().slice(0, 5))}
                            
                            placeholder="Enter stock symbol (e.g., TCS, INFY)"
                            className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            maxLength={5}
                        />
                        <div className="flex flex-col sm:flex-row gap-3 sm:ml-4 sm:justify-end w-full sm:w-auto">
                            <button
                                onClick={handleAddStock}
                                disabled={loading}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                {loading ? 'Adding...' : 'Add Stock'}
                            </button>

                            {watchlist.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-xl border border-red-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    Clear All
                                </button>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
                            <Star className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <p className="text-green-300 text-sm">{success}</p>
                        </div>
                    )}
                </div>

                {/* Search Bar */}
                {watchlist.length > 0 && (
                    <div className="mb-6 relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search your watchlist..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                )}

                {/* Watchlist Grid */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-red flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-400" />
                            Your Watchlist
                        </h2>
                        <span className="text-sm text-slate-400">
                            {filteredWatchlist.length} {filteredWatchlist.length === 1 ? 'stock' : 'stocks'}
                        </span>
                    </div>

                    {fetching ? (
                        <div className="p-8 text-center text-slate-400">Loading watchlist...</div>
                    ) : filteredWatchlist.length === 0 ? (
                        <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-12 text-center">
                            <h3 className="text-xl font-semibold text-slate-300 mb-2">
                                {watchlist.length === 0 ? 'No stocks in watchlist' : 'No matching stocks'}
                            </h3>
                            <p className="text-slate-500">
                                {watchlist.length === 0
                                    ? 'Add your first stock to start tracking'
                                    : 'Try a different search term'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredWatchlist.map((stock) => (
                                <div
                                    key={stock}
                                    className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5 hover:border-blue-500/50 transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-lg font-bold text-white">{stock}</h3>
                                        <button
                                            onClick={() => handleRemoveStock(stock)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Remove from watchlist"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                    <p className="text-slate-400 text-sm">No live data yet</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-500">
                        💡 Connected to backend API — no dummy data, real MongoDB integration active
                    </p>
                </div>
            </div>
        </div>
    );
}
