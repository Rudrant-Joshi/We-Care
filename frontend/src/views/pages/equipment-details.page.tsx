import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, MapPin, Wrench, Star, Calendar, Clock } from 'lucide-react';
import type { Equipment } from '../../models/equipment.model';
import { EquipmentController } from '../../controllers/equipment.controller';

export interface EquipmentDetailsProps {
  equipment: Equipment;
  onClose: () => void;
}

export default function EquipmentDetails({ equipment, onClose }: EquipmentDetailsProps) {
  const [duration, setDuration] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reserved, setReserved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReserve = async () => {
    setLoading(true);
    const result = await EquipmentController.submitReservation(equipment.id, {
      date,
      reservedBy: 'WeCare Clinical Team',
      durationDays: duration
    });
    setLoading(false);
    if (result.success) {
      setReserved(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Image & Badges */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/60 shadow-lg">
              <img
                src={equipment.imageUrl}
                alt={equipment.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/doctor-images/ant-man.jpg';
                }}
              />
              <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
                {equipment.category}
              </div>
            </div>

            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/40 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{equipment.location}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Compliance: {equipment.complianceCertifications?.join(', ') || 'FDA & ISO 13485'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Reservation */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                {equipment.departmentName}
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">{equipment.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {equipment.rating}
                </div>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400">{equipment.reviewsCount} verified clinical logs</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {equipment.description}
            </p>

            {/* Specifications */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Technical Specs</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(equipment.specifications || {}).map(([key, val]) => (
                  <div key={key} className="bg-slate-800/40 border border-slate-700/50 p-2 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase">{key}</span>
                    <span className="font-semibold text-slate-200">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking / Reservation Form */}
            <div className="border-t border-slate-800 pt-6">
              {reserved ? (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold">Equipment Reserved Successfully!</h4>
                    <p className="text-xs text-emerald-300/80 mt-0.5">
                      Log entry created for {date} ({duration} days). Confirmation code: EQ-{Math.floor(1000 + Math.random() * 9000)}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Access Fee</span>
                      <div className="text-2xl font-black text-white">${equipment.dailyRate * duration}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Start Date</label>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="bg-slate-800 border border-slate-700 text-xs px-2.5 py-1.5 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Days</label>
                        <select
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          className="bg-slate-800 border border-slate-700 text-xs px-2.5 py-1.5 rounded-lg text-white"
                        >
                          {[1, 2, 3, 5, 7, 14].map((d) => (
                            <option key={d} value={d}>{d}d</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleReserve}
                    disabled={loading || equipment.status !== 'available'}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Wrench className="w-4 h-4" />
                    {loading ? 'Processing...' : 'Confirm Equipment Reservation'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { EquipmentDetails };
