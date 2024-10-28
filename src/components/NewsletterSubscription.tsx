import React, { useState } from 'react';
import { Mail, Bell, CheckCircle, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import BreedSelect from './BreedSelect';

interface NewsletterSubscriptionProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewsletterSubscription: React.FC<NewsletterSubscriptionProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [breed, setBreed] = useState('');
  const [preferences, setPreferences] = useState({
    deals: true,
    newProducts: true,
    breedTips: true,
    events: false
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !breed) {
      setErrorMessage('Email and breed selection are required');
      return;
    }

    setStatus('loading');

    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([
          {
            email,
            breed,
            preferences,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setEmail('');
        setBreed('');
      }, 2000);
    } catch (err) {
      console.error('Error subscribing to newsletter:', err);
      setStatus('error');
      setErrorMessage('Failed to subscribe. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-6">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full mx-auto mb-4">
            <Bell className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>

          <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Get Breed-Specific Updates
          </h3>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Stay informed about deals, tips, and products perfect for your dog
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dog Breed
              </label>
              <BreedSelect
                value={breed}
                onChange={setBreed}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                I'm interested in:
              </label>
              <div className="space-y-2">
                {Object.entries({
                  deals: 'Exclusive Deals & Discounts',
                  newProducts: 'New Product Releases',
                  breedTips: 'Breed-Specific Tips & Advice',
                  events: 'Local Pet Events'
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences[key as keyof typeof preferences]}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        [key]: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {status === 'error' && (
              <div className="text-red-500 text-sm">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-lg text-white transition-colors ${
                status === 'success'
                  ? 'bg-green-500'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {status === 'loading' ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : status === 'success' ? (
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Subscribed!
                </div>
              ) : (
                'Subscribe'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewsletterSubscription;