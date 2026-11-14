import React, { useState, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import Footer from '../components/Footer';
import EquipmentCard from '../components/EquipmentCard';
import EquipmentDetails from './EquipmentDetails';
import { useEquipment } from '../../hooks/useEquipment';
import type { Equipment as EquipmentType } from '../../models/equipmentModel';
import { Search, Filter, Wrench, ShieldCheck, Cpu } from 'lucide-react';

export default function Equipment() {
  const { equipment, loading } = useEquipment();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeModalItem, setActiveModalItem] = useState<EquipmentType | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    equipment.forEach(item => set.add(item.category));
    return ['all', ...Array.from(set)];
  }, [equipment]);

  const filtered = useMemo(() => {
    return equipment.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchesSearch = !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.departmentName.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [equipment, selectedCategory, search]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-emerald-500/30">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5" /> High-Precision Clinical Apparatus
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Specialized Medical <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Equipment</span>
          </h1>
          <p className="text-base text-slate-400 leading-relaxed">
            Explore and reserve advanced surgical suites, 3.0T MRI neuroimaging arrays, and telemetry-guided diagnostic machinery across all hospital wards.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 mb-10 flex flex-col md:flex-row items-center gap-4 justify-between shadow-xl">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search equipment, MRI, robotic OR..."
              className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat === 'all' ? 'All Apparatus' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800">
            <Wrench className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-300">No equipment found</h3>
            <p className="text-xs text-slate-500 mt-1">Try refining your keyword query or category selection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <EquipmentCard
                key={item.id}
                equipment={item}
                onSelect={(eq) => setActiveModalItem(eq)}
                onReserve={(eq) => setActiveModalItem(eq)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Equipment Details Modal */}
      {activeModalItem && (
        <EquipmentDetails
          equipment={activeModalItem}
          onClose={() => setActiveModalItem(null)}
        />
      )}

      <Footer />
    </div>
  );
}

export { Equipment };
