import React from 'react';
import { Star, Shield, ArrowUpRight, Wrench, CheckCircle2, Clock } from 'lucide-react';
import type { Equipment } from '../../models/equipment.model';

export interface EquipmentCardProps {
  equipment: Equipment;
  onSelect?: (equipment: Equipment) => void;
  onReserve?: (equipment: Equipment) => void;
}

export function EquipmentCard({ equipment, onSelect, onReserve }: EquipmentCardProps) {
  const isAvailable = equipment.status === 'available';

  return (
    <div className="group relative rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors pointer-events-none" />

      <div>
        {/* Image / Header banner */}
        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-4">
          <img
            src={equipment.imageUrl}
            alt={equipment.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/doctor-images/ant-man.jpg';
            }}
          />
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border flex items-center gap-1 ${
                isAvailable
                  ? 'bg-emerald-500/80 text-white border-emerald-400/30'
                  : 'bg-amber-500/80 text-white border-amber-400/30'
              }`}
            >
              {isAvailable ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              {equipment.status.toUpperCase()}
            </span>
          </div>

          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-amber-300 px-2 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{equipment.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Category & Title */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            {equipment.category}
          </span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-500 transition-colors">
            {equipment.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {equipment.description}
          </p>
        </div>

        {/* Specs Pill List */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {equipment.features.slice(0, 2).map((feat, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60"
            >
              {feat}
            </span>
          ))}
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 block">Daily Access Rate</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              ${equipment.dailyRate}
            </span>
            <span className="text-xs text-slate-400">/day</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSelect && (
            <button
              onClick={() => onSelect(equipment)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="View Specifications"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onReserve ? onReserve(equipment) : onSelect?.(equipment)}
            disabled={!isAvailable}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isAvailable
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            {isAvailable ? 'Reserve' : 'In Use'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EquipmentCard;
