import React, { useRef, useEffect, useState } from 'react';
import { Clock, Utensils, Activity, Scale, Heart, X, ChevronRight, Check, Edit2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dog } from '../types';
import { calculateDogMetrics } from '../utils/dogCalculations';

interface DogDetailsProps {
  dog: Dog;
  onClose: () => void;
}

interface CustomSchedule {
  time: string;
  amount: number;
  completed: boolean;
}

const DogDetails: React.FC<DogDetailsProps> = ({ dog, onClose }) => {
  const metrics = calculateDogMetrics(dog);
  const modalRef = useRef<HTMLDivElement>(null);
  const [showCustomSchedule, setShowCustomSchedule] = useState(false);
  const [customSchedule, setCustomSchedule] = useState<CustomSchedule[]>(
    metrics.feedingSchedule.map(meal => ({
      ...meal,
      completed: false
    }))
  );
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [useMetric, setUseMetric] = useState(true);

  // Calculate food package duration
  const calculateDuration = (packageSize: number) => {
    const sizeInGrams = packageSize * 1000;
    const days = Math.floor(sizeInGrams / metrics.foodAmount);
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    return { days, weeks, remainingDays };
  };

  const commonPackageSizes = useMetric 
    ? [4, 15, 30] // kg
    : [8.8, 33, 66]; // lbs (converted from kg)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const toggleMealCompletion = (index: number) => {
    setCustomSchedule(prev => 
      prev.map((meal, i) => 
        i === index ? { ...meal, completed: !meal.completed } : meal
      )
    );
  };

  const updateMealTime = (index: number, newTime: string) => {
    setCustomSchedule(prev =>
      prev.map((meal, i) =>
        i === index ? { ...meal, time: newTime } : meal
      )
    );
  };

  const handleRecommendedFoodClick = () => {
    onClose(); // Close the modal before navigation
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div 
        ref={modalRef}
        className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl my-8 sm:my-0"
      >
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 z-10 transition-colors"
          aria-label="Close details"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-100">
              {dog.image ? (
                <img
                  src={dog.image}
                  alt={dog.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100">
                  <Heart className="w-12 h-12 text-blue-500" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-20 p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{dog.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{dog.breed}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Scale className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-sm text-gray-600 dark:text-gray-400">Weight</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {(dog.weight * 2.20462).toFixed(1)} lbs
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Activity className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-sm text-gray-600 dark:text-gray-400">Activity Level</div>
              <div className="font-semibold text-gray-900 dark:text-white">{dog.activityLevel}/10</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Utensils className="w-5 h-5 text-blue-500 mr-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Daily Nutrition</h3>
                </div>
                <Link
                  to={`/search?q=dog+food&category=food`}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  onClick={handleRecommendedFoodClick}
                >
                  View Recommended Food
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Daily Calories</span>
                  <span className="font-medium text-gray-900 dark:text-white">{metrics.dailyCalories} kcal</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Protein</span>
                  <span className="font-medium text-gray-900 dark:text-white">{metrics.protein}g</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Daily Food Amount</span>
                  <span className="font-medium text-gray-900 dark:text-white">{metrics.foodAmount}g</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Weekly Amount</span>
                  <span className="font-medium text-gray-900 dark:text-white">{metrics.weeklyAmount}g</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Monthly Amount</span>
                  <span className="font-medium text-gray-900 dark:text-white">{metrics.monthlyAmount}g</span>
                </li>
              </ul>
            </div>

            <div className="border dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-blue-500 mr-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {showCustomSchedule ? 'Custom Schedule' : 'Recommended Schedule'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowCustomSchedule(!showCustomSchedule)}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Switch to {showCustomSchedule ? 'Recommended' : 'Custom'} Schedule
                </button>
              </div>

              {showCustomSchedule ? (
                <div className="space-y-3">
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => setEditingSchedule(!editingSchedule)}
                      className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      {editingSchedule ? 'Done' : 'Edit Times'}
                    </button>
                  </div>
                  {customSchedule.map((meal, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleMealCompletion(index)}
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            meal.completed
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 dark:border-gray-500'
                          }`}
                        >
                          {meal.completed && <Check className="w-3 h-3 text-white" />}
                        </button>
                        {editingSchedule ? (
                          <input
                            type="time"
                            value={meal.time.split(' ')[1].slice(1, -1)}
                            onChange={(e) => updateMealTime(index, `Meal ${e.target.value}`)}
                            className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                          />
                        ) : (
                          <span className="text-gray-700 dark:text-gray-300">{meal.time}</span>
                        )}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{meal.amount}g</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics.feedingSchedule.map((meal, index) => (
                    <div key={index} className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">{meal.time}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{meal.amount}g</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Food Package Duration</h3>
                <button
                  onClick={() => setUseMetric(!useMetric)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Switch to {useMetric ? 'lbs' : 'kg'}
                </button>
              </div>
              <div className="space-y-3">
                {commonPackageSizes.map(size => {
                  const duration = calculateDuration(useMetric ? size : size / 2.20462);
                  return (
                    <div key={size} className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">
                        {size} {useMetric ? 'kg' : 'lbs'} Package
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {duration.weeks > 0 ? `${duration.weeks} weeks` : ''} 
                        {duration.remainingDays > 0 ? ` ${duration.remainingDays} days` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DogDetails;