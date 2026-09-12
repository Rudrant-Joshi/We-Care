import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Sparkles, Send } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'demo' | 'learn';
}

export const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  mode = 'demo',
}) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          id="demo-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md p-8 rounded-3xl bg-white/25 backdrop-blur-3xl shadow-[0_25px_70px_rgba(0,25,70,0.3)] text-white border-0"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 text-white/70 hover:text-white rounded-full hover:bg-white/15 transition-colors cursor-pointer border-0"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="py-8 flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/25 flex items-center justify-center text-emerald-300 mb-2 border-0">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold">Access Granted</h3>
                <p className="text-white/80 text-sm max-w-xs">
                  Our healthcare operations specialist will reach out to schedule your consultation.
                </p>
              </div>
            ) : (
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-4 border-0">
                  <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                  <span>{mode === 'demo' ? 'We Care Clinical Solutions' : 'Platform Documentation'}</span>
                </div>

                <h3 className="text-2xl font-bold tracking-tight mb-2">
                  {mode === 'demo' ? 'Book an Appointment' : 'Explore We Care Healthcare'}
                </h3>
                <p className="text-sm text-white/80 leading-relaxed mb-6">
                  {mode === 'demo' 
                    ? 'Schedule a consultation with our world-class medical specialists and care teams.' 
                    : 'Experience intelligent healthcare workflows coordinating patient care, clinical summaries, and operations.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1.5 uppercase tracking-wider">
                      Work Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@healthcare.org"
                      className="w-full px-4 py-3 rounded-xl bg-white/15 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-colors border-0"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-slate-950 bg-white shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 border-0"
                  >
                    <span>{mode === 'demo' ? 'Book Appointment' : 'Access Documentation'}</span>
                    <Send className="w-4 h-4 text-slate-950" />
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
