"use client";
import Modal from "./components/newCardModal";
import React, { act, useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
export default function BuilderPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [curColor, setCurColor] = useState("#000000");
  const [open, setOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 600,
      height: 600,
      backgroundColor: "#0f172a",
      selection: true
    });

    fabricRef.current = canvas;

    return () => {
      canvas.dispose();
    };
  }, []);
  const handleNewFile = (width: number, height: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setWidth(width)
    canvas.setHeight(height)
    canvas.clear();
    canvas.backgroundColor = '#0f172a';
    canvas.renderAll()
  }
  const addRectangle = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const rect = new fabric.Rect({
      height: 100,
      width: 100,
      fill: curColor,
      editable: true,

    })
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll()
  }
  const addTriangle = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const triangle = new fabric.Triangle({
      height: 100,
      width: 100,
      fill: curColor,
      editable: true
    })
    canvas.add(triangle)
    canvas.setActiveObject(triangle)
    canvas.renderAll();
  }
  const addCircle = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const circle = new fabric.Circle({
      radius: 100,
      fill: curColor,
      editable: true
    })
    canvas.add(circle)
    canvas.setActiveObject(circle)
    canvas.renderAll()
  }
  const addText = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const text = new fabric.Textbox("Merry Christmas 🎄", {
      left: 100,
      top: 100,
      fill: "#ffffff",
      fontSize: 36,
      editable: true
    });

    canvas.add(text);
    canvas.setActiveObject(text);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('no file')
      return
    };

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const img = await fabric.FabricImage.fromURL(
        reader.result as string,
        { crossOrigin: 'anonymous' }
      );
      img.scaleToWidth(300);
      img.set({ left: 150, top: 150 })
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll()
    }



  };

  const downloadPNG = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: "png",
      multiplier: 3
    });

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "christmas-card.png";
    link.click();
  };

  const changeBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const color = e.target.value;
    canvas.backgroundColor = color;
    canvas.renderAll()
  }
  const changeColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const color = e.target.value;
    setCurColor(color)
    const active = canvas.getActiveObject();
    if (!active) return;
    if (active.type === 'textbox' || active.type === 'rect' || active.type === 'text') {
      active.set({ fill: color });
    }
    if ('set' in active) {
      active.set({ fill: color });
    }
    canvas.renderAll()
  }
  const deleteSelected = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const actives = canvas.getActiveObjects();
    if (!actives.length) return;
    actives.forEach(obj => {
      canvas.remove(obj);
    })
    canvas.discardActiveObject();
    canvas.renderAll()
  };
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 text-white flex flex-col">

      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              🎄 Jõulukaardi Looja
            </h1>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>


      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full gap-4 p-4 sm:p-6 overflow-hidden">

        <aside className="hidden lg:flex flex-col gap-3 w-72 bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 shadow-2xl border border-slate-800 h-fit">
          <div className="space-y-3">
            <div className="pb-3 border-b border-slate-700">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Fail</h2>
              <button
                onClick={() => setOpen(true)}
                className="w-full px-4 py-3 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-semibold transition-all shadow-lg shadow-green-900/30 hover:shadow-green-800/40 hover:scale-[1.02]"
              >
                📄 Uus fail
              </button>
            </div>

            <div className="pb-3 border-b border-slate-700">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Sisu</h2>
              <div className="space-y-2">
                <button
                  onClick={addText}
                  className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors text-left flex items-center gap-2"
                >
                  <span className="text-xl">✏️</span> Lisa tekst
                </button>
                <label className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2">
                  <span className="text-xl">🖼️</span> Lisa pilt
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>

            <div className="pb-3 border-b border-slate-700">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Kujundid</h2>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={addRectangle}
                  className="px-3 py-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-lg transition-all hover:scale-105"
                  title="Ristkülik"
                >
                  <div className="w-6 h-6 bg-purple-500 rounded mx-auto"></div>
                </button>
                <button
                  onClick={addCircle}
                  className="px-3 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 rounded-lg transition-all hover:scale-105"
                  title="Ring"
                >
                  <div className="w-6 h-6 bg-blue-500 rounded-full mx-auto"></div>
                </button>
                <button
                  onClick={addTriangle}
                  className="px-3 py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 rounded-lg transition-all hover:scale-105"
                  title="Kolmnurk"
                >
                  <div className="w-0 h-0 border-l-12 border-l-transparent border-r-12 border-r-transparent border-b-20 border-b-green-500 mx-auto"></div>
                </button>
              </div>
            </div>

            <div className="pb-3 border-b border-slate-700">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Värv</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium">Objekti värv</span>
                  <input
                    type="color"
                    value={curColor}
                    onChange={changeColor}
                    className="w-10 h-10 rounded cursor-pointer border-2 border-slate-600"
                  />
                </div>
                <div className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium">Taustavärv</span>
                  <input
                    type="color"
                    onChange={changeBackground}
                    className="w-10 h-10 rounded cursor-pointer border-2 border-slate-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Toimingud</h2>
              <div className="space-y-2">
                <button
                  onClick={deleteSelected}
                  className="w-full px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg font-medium transition-all text-red-300 hover:text-red-200"
                >
                  🗑️ Kustuta valitud
                </button>
                <button
                  onClick={downloadPNG}
                  className="w-full px-4 py-3 bg-linear-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-900 rounded-xl font-bold transition-all shadow-lg shadow-yellow-900/30 hover:shadow-yellow-800/40 hover:scale-[1.02]"
                >
                  ⬇️ Laadi alla PNG
                </button>
              </div>
            </div>
          </div>
        </aside>


        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-slate-900 shadow-2xl p-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="space-y-3 mt-12">
                <div className="pb-3 border-b border-slate-700">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Fail</h2>
                  <button
                    onClick={() => { setOpen(true); setIsMobileMenuOpen(false); }}
                    className="w-full px-4 py-3 bg-linear-to-r from-green-600 to-emerald-600 rounded-xl font-semibold"
                  >
                    📄 Uus fail
                  </button>
                </div>

                <div className="pb-3 border-b border-slate-700">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Sisu</h2>
                  <div className="space-y-2">
                    <button onClick={addText} className="w-full px-4 py-2.5 bg-slate-800 rounded-lg text-left flex items-center gap-2">
                      <span className="text-xl">✏️</span> Lisa tekst
                    </button>
                    <label className="w-full px-4 py-2.5 bg-slate-800 rounded-lg cursor-pointer flex items-center gap-2">
                      <span className="text-xl">🖼️</span> Lisa pilt
                      <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>

                <div className="pb-3 border-b border-slate-700">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Kujundid</h2>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={addRectangle} className="px-3 py-3 bg-purple-600/20 border border-purple-500/50 rounded-lg">
                      <div className="w-6 h-6 bg-purple-500 rounded mx-auto"></div>
                    </button>
                    <button onClick={addCircle} className="px-3 py-3 bg-blue-600/20 border border-blue-500/50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-500 rounded-full mx-auto"></div>
                    </button>
                    <button onClick={addTriangle} className="px-3 py-3 bg-green-600/20 border border-green-500/50 rounded-lg">
                      <div className="w-0 h-0 border-l-12 border-l-transparent border-r-12 border-r-transparent border-b-20 border-b-green-500 mx-auto"></div>
                    </button>
                  </div>
                </div>

                <div className="pb-3 border-b border-slate-700">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Värv</h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2">
                      <span className="text-sm">Objekti värv</span>
                      <input type="color" value={curColor} onChange={changeColor} className="w-10 h-10 rounded" />
                    </div>
                    <div className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2">
                      <span className="text-sm">Taustavärv</span>
                      <input type="color" onChange={changeBackground} className="w-10 h-10 rounded" />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Toimingud</h2>
                  <div className="space-y-2">
                    <button onClick={deleteSelected} className="w-full px-4 py-2.5 bg-red-600/20 border border-red-500/50 rounded-lg text-red-300">
                      🗑️ Kustuta valitud
                    </button>
                    <button onClick={downloadPNG} className="w-full px-4 py-3 bg-linear-to-r from-yellow-500 to-amber-500 text-slate-900 rounded-xl font-bold">
                      ⬇️ Laadi alla PNG
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center min-h-0"> <canvas ref={canvasRef} width={600} height={600} style={{ maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto", border: "4px solid rgb(51 65 85)" }} className="rounded shadow-inner " /> </div>
      </div>

      <Modal open={open} onCloseAction={() => setOpen(false)} onConfirmAction={handleNewFile} />
    </div>
  );
}
