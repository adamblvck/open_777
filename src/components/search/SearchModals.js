import React, { useState } from 'react';

export const InfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold text-white mb-4">Search Help</h3>
        <div className="text-gray-300 space-y-2 text-sm text-left">
          <p className="text-sm">You can search through:</p>
          <ul className="list-disc list-inside ml-4 text-sm">
            <li>Correspondences</li>
            <li>Categories</li>
            <li>Column numbers</li>
          </ul>
          <p className="mt-4 text-sm">Pro tip: Use commas to separate multiple search terms!</p>
          <p className="text-sm text-gray-400">Example: "xiv., xl., xxxix., xli., clxxxii."</p>
		  <p className="text-sm text-gray-400">Example: "Enumeration, Heavens, Planets"</p>
		  <p className="text-sm">For ease, use one of the preset searches, or if needed, you can save your own searches (saved locally to your browser).</p>
        </div>
        <button
          onClick={onClose}
          className="text-sm mt-6 w-full px-4 py-2 bg-primary-600 rounded-lg
                   text-white hover:bg-primary-700 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export const SavePresetModal = ({ isOpen, onClose, onSave, currentSearch }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-4 rounded-lg max-w-sm w-full mx-4">
        <h3 className="text-md font-semibold text-white mb-3">Save Search Preset</h3>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Preset Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-2 py-1.5 bg-gray-700 rounded-lg text-sm text-white"
            placeholder="Enter preset name"
          />
          <p className="text-xs text-gray-400 mt-1">Search term: {currentSearch}</p>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-1.5 bg-gray-700 rounded-lg
                     text-sm text-gray-300 hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave({ name, query: currentSearch });
              onClose();
            }}
            className="flex-1 px-3 py-1.5 bg-primary-600 rounded-lg
                     text-sm text-white hover:bg-primary-700 transition-colors"
            disabled={!name}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export const AllPresetsModal = ({ isOpen, onClose, presets, onSelectPreset, onDeletePreset, onResetPresets }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-md font-semibold text-white mb-4">Saved Search Presets</h3>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {presets.map((preset, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 bg-gray-700/50 
                       rounded-lg hover:bg-gray-700/70 transition-colors"
            >
              <div className="flex-1">
                <h4 className="text-sm text-white font-medium">{preset.name}</h4>
                {preset.description && (
                  <p className="text-xs text-gray-400">{preset.description}</p>
                )}
                <p className="text-xs text-gray-500">Query: {preset.query}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => {
                    onSelectPreset(preset.query);
                    onClose();
                  }}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                {(preset.deletable !== false) && (
                  <button
                    onClick={() => onDeletePreset(index)}
                    className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg
                     text-sm text-gray-300 hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all presets to default? This will remove any custom presets.')) {
                onResetPresets();
                onClose();
              }
            }}
            className="w-full px-4 py-2 bg-red-900/50 rounded-lg
                     text-sm text-red-300 hover:bg-red-900/70 transition-colors"
          >
            Reset to Default Presets
          </button>
        </div>
      </div>
    </div>
  );
}; 