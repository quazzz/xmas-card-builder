'use client'
import React, { useState, useRef, useCallback } from 'react';
import * as fabric from 'fabric';

interface Layer {
  object: fabric.FabricObject;
  name: string;
  visible: boolean;
}

interface LayerPanelProps {
  canvas: fabric.Canvas | null;
  layers: Layer[];
  onLayerUpdate: () => void;
  onRenameLayer?: (objectId: string, newName: string) => void;
  onDeleteLayer?: (objectId: string) => void;
}

function LayerPanel({ canvas, layers, onLayerUpdate, onRenameLayer, onDeleteLayer }: LayerPanelProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const isSubmittingRef = useRef(false);

  const handleVisibilityToggle = (layer: Layer) => {
    if (!canvas) return;
    const obj = layer.object;
    obj.visible = !obj.visible;
    canvas.renderAll();
    onLayerUpdate();
  };

  const handleRenameStart = (layer: Layer) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const objId = (layer.object as any).__layerId || '';
    isSubmittingRef.current = false;
    setEditingId(objId);
    setEditName(layer.name);
  };

  const handleRenameSubmit = (layer: Layer, e?: React.FocusEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    
    if (!canvas) {
      isSubmittingRef.current = false;
      return;
    }
    
    const newName = editName.trim() || getDefaultName(layer.object);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const objectId = (layer.object as any).__layerId || '';
    if (onRenameLayer && objectId && newName) {
      onRenameLayer(objectId, newName);
    }
    
    setEditingId(null);
    setEditName('');
    isSubmittingRef.current = false;
    canvas.renderAll();
  };

  const handleRenameCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  const touchStartY = useRef<number | null>(null);
  const touchStartIndex = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const performReorder = useCallback((startIndex: number, dropIndex: number) => {
    if (!canvas || startIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }


    const objects = canvas.getObjects();
    const reversedObjects = [...objects].reverse();
    
    const draggedObj = reversedObjects[startIndex];
    const targetObj = reversedObjects[dropIndex];
    const targetCanvasIndex = objects.indexOf(targetObj);
    let newIndex: number;
    if (dropIndex > startIndex) {
      newIndex = targetCanvasIndex;
    } else {
      newIndex = targetCanvasIndex + 1;
    }
    
    newIndex = Math.max(0, Math.min(newIndex, objects.length - 1));

    const allObjects = canvas.getObjects();
    const objectsWithoutDragged = allObjects.filter(obj => obj !== draggedObj);
    
    const reorderedObjects = [
      ...objectsWithoutDragged.slice(0, newIndex),
      draggedObj,
      ...objectsWithoutDragged.slice(newIndex)
    ];
    
    allObjects.forEach(obj => canvas.remove(obj));
    reorderedObjects.forEach(obj => canvas.add(obj));
  
    canvas.renderAll();
    setDraggedIndex(null);
    onLayerUpdate();
  }, [canvas, onLayerUpdate]);

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!canvas || draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }
    performReorder(draggedIndex, dropIndex);
  };

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent, index: number) => {
    // Prevent default to avoid scrolling while dragging
    const target = e.target as HTMLElement;
    // Don't start drag if clicking on interactive elements
    if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('button') || target.closest('input')) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    touchStartY.current = e.touches[0].clientY;
    touchStartIndex.current = index;
    setDraggedIndex(index);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null || touchStartIndex.current === null) return;
    e.preventDefault();
    e.stopPropagation();
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    const itemHeight = 60; // Approximate height of each layer item
    
    // Use direction-based movement for simplicity on mobile
    if (Math.abs(deltaY) > itemHeight / 2) {
      const direction = deltaY > 0 ? 1 : -1;
      const newIndex = touchStartIndex.current + direction;
      const maxIndex = layers.length - 1;
      
      if (newIndex >= 0 && newIndex <= maxIndex && newIndex !== touchStartIndex.current) {
        touchStartIndex.current = newIndex;
        touchStartY.current = currentY;
        setDraggedIndex(newIndex);
      }
    }
  }, [layers.length]);

  const handleTouchEnd = useCallback(() => {
    if (touchStartIndex.current === null || draggedIndex === null) {
      touchStartY.current = null;
      touchStartIndex.current = null;
      setDraggedIndex(null);
      return;
    }

    const dropIndex = draggedIndex;
    const startIndex = touchStartIndex.current;
    
    touchStartY.current = null;
    touchStartIndex.current = null;
    
    if (startIndex !== dropIndex && canvas) {
      performReorder(startIndex, dropIndex);
    } else {
      setDraggedIndex(null);
    }
  }, [draggedIndex, canvas, performReorder]);

  const handleLayerSelect = (layer: Layer) => {
    if (!canvas) return;
    canvas.setActiveObject(layer.object);
    canvas.renderAll();
  };

  const handleDelete = (layer: Layer) => {
    if (!canvas) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const objId = (layer.object as any).__layerId;
    canvas.remove(layer.object);
    if (onDeleteLayer && objId) {
      onDeleteLayer(objId);
    }
    canvas.renderAll();
    onLayerUpdate();
  };

  const getDefaultName = (obj: fabric.FabricObject): string => {
    const type = obj.type || 'object';
    const typeNames: Record<string, string> = {
      'rect': 'Ristkülik',
      'circle': 'Ring',
      'triangle': 'Kolmnurk',
      'textbox': 'Tekst',
      'text': 'Tekst',
      'image': 'Pilt',
      'path': 'Joonistus',
      'group': 'Grupp',
    };
    return typeNames[type] || 'Kiht';
  };

  const getLayerIcon = (obj: fabric.FabricObject): string => {
    const type = obj.type || 'object';
    const icons: Record<string, string> = {
      'rect': '▭',
      'circle': '●',
      'triangle': '▲',
      'textbox': 'T',
      'text': 'T',
      'image': '🖼️',
      'path': '✏️',
      'group': '📦',
    };
    return icons[type] || '▢';
  };

  if (!canvas) return null;

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 shadow-2xl border border-slate-800">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Kihid ({layers.length})
      </h2>
      <div className="layer-container space-y-1 max-h-100 overflow-y-auto overscroll-contain will-change-scroll">
        {layers.length === 0 ? (
          <div className="text-sm text-slate-500 text-center py-4">
            Kihid puuduvad
          </div>
        ) : (
          layers.map((layer, index) => {

            const objId = (layer.object as any).__layerId || '';
            const isEditing = editingId === objId;
            const isActive = canvas.getActiveObject() === layer.object;
            const layerName = layer.name || getDefaultName(layer.object);

            return (
              <div

                key={(layer.object as any).__layerId || index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onTouchStart={(e) => handleTouchStart(e, index)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`
                  group flex items-center gap-2 p-2 rounded-lg transition-all cursor-move touch-none
                  ${isActive ? 'bg-emerald-600/30 border border-emerald-500/50' : 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50'}
                  ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
                `}
                onClick={() => handleLayerSelect(layer)}
              >

                <div className="drag-handle text-slate-500 cursor-grab active:cursor-grabbing touch-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVisibilityToggle(layer);
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                  title={layer.visible ? 'Peida' : 'Näita'}
                >
                  {layer.visible ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>

                <span className="text-lg">{getLayerIcon(layer.object)}</span>

                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={(e) => {
                      setTimeout(() => {
                        if (!isSubmittingRef.current) {
                          handleRenameSubmit(layer, e);
                        }
                      }, 100);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleRenameSubmit(layer, e);
                      } else if (e.key === 'Escape') {
                        handleRenameCancel();
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="flex-1 min-w-0 max-w-30 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                ) : (
                  <span
                    className="flex-1 min-w-0 text-sm text-slate-300 truncate"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleRenameStart(layer);
                    }}
                    title="Topeltklõpsa, et ümber nimetada"
                  >
                    {layerName}
                  </span>
                )}

             
                <button
                  onClick={(e) => {
                    e.stopPropagation();`asdasd`
                    handleDelete(layer);
                  }}
                  className={`opacity-0  text-red-400 hover:text-red-300 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}
                  title="Kustuta"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default React.memo(LayerPanel);