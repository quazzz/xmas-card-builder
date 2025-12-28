'use client'
import { useState } from "react";
type Props = {
  open: boolean;
  onCloseAction: () => void;
  onConfirmAction: (width: number, height: number) => void;
};

export default function Modal({ open, onCloseAction, onConfirmAction }: Props) {
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(600);

  if (!open) return null;

  const handleConfirm = () => {
    onConfirmAction(width, height);
    onCloseAction();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-700">
        <h2 className="text-2xl font-bold mb-6 text-white">Uus jõulukaart</h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Laius (px)
            </label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
           
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Kõrgus (px)
            </label>
            <input
                type="numer"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCloseAction}
            className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors"
          >
            Tühista
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors shadow-lg shadow-green-900/30"
          >
            Loo
          </button>
        </div>
      </div>
    </div>
  );
}
