import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Dog } from '../types';

interface DogProfileProps {
  dog: Dog;
}

const DogProfile: React.FC<DogProfileProps> = ({ dog }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
      <div className="aspect-w-1 aspect-h-1 bg-gray-200">
        <img
          src={dog.image || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"}
          alt={dog.name}
          className="object-cover w-full h-48"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{dog.name}</h3>
            <p className="text-sm text-gray-600">{dog.breed}</p>
          </div>
          <div className="flex space-x-2">
            <button className="p-1 text-gray-400 hover:text-blue-500 transition-colors">
              <Edit2 className="h-4 w-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-600">Age: {dog.age} years</p>
          <p className="text-sm text-gray-600">Weight: {dog.weight} kg</p>
        </div>
      </div>
    </div>
  );
};

export default DogProfile;