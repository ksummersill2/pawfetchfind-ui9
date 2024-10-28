import React from 'react';
import { SplitSquareHorizontal } from 'lucide-react';

interface CompareButtonProps {
  selectedCount: number;
  onClick: () => void;
}

const CompareButton: React.FC<CompareButtonProps> = ({ selectedCount, onClick }) => {
  if (selectedCount < 2) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-40 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
    >
      <SplitSquareHorizontal className="w-5 h-5 mr-2" />
      Compare {selectedCount} Products
    </button>
  );
};

export default CompareButton;