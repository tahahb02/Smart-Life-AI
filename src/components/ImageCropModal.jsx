import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, ZoomIn, ZoomOut, Check } from 'lucide-react';

const ImageCropModal = ({ imageSrc, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = useCallback((crop) => setCrop(crop), []);
  const onZoomChange = useCallback((zoom) => setZoom(zoom), []);

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    onCropComplete(croppedAreaPixels);
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recadrer la photo</h3>
            <button onClick={onCancel}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              <X size={18} />
            </button>
          </div>

          {/* Cropper */}
          <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={handleCropComplete}
            />
          </div>

          {/* Controls */}
          <div className="px-5 py-4 space-y-4">
            {/* Zoom */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <ZoomIn size={13} /> Zoom
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{zoom.toFixed(1)}x</span>
              </div>
              <input type="range" min={1} max={3} step={0.01} value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500" />
            </div>

            {/* Rotation */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <RotateCcw size={13} /> Rotation
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{rotation}°</span>
              </div>
              <input type="range" min={0} max={360} step={1} value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500" />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <button onClick={onCancel}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                Annuler
              </button>
              <button onClick={handleConfirm}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5">
                <Check size={15} /> Appliquer
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageCropModal;
