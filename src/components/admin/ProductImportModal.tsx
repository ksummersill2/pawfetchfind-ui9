import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, Check, AlertTriangle } from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from '../../lib/supabaseClient';
import { generateAffiliateLink } from '../../lib/amazonAffiliateLink';

interface ProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ProductImportModal: React.FC<ProductImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [duplicates, setDuplicates] = useState<string[]>([]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const checkForDuplicates = async (products: any[]) => {
    const productNames = [...new Set(products.map(p => p.name))];
    const { data: existingProducts } = await supabase
      .from('products')
      .select('name')
      .in('name', productNames);

    if (existingProducts) {
      const duplicateNames = existingProducts.map(p => p.name);
      setDuplicates(duplicateNames);
      return duplicateNames;
    }
    return [];
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing CSV file: ' + results.errors[0].message);
          return;
        }
        setFile(selectedFile);
        setPreviewData(results.data);
        setError(null);
        await checkForDuplicates(results.data);
      },
      error: (error) => {
        setError('Error parsing CSV file: ' + error.message);
      }
    });
  };

  const handleImport = async () => {
    if (!previewData.length) {
      setError('No data to import');
      return;
    }

    setImporting(true);
    setError(null);

    try {
      for (const product of previewData) {
        // Skip if product exists and skipDuplicates is true
        if (duplicates.includes(product.name) && skipDuplicates) {
          continue;
        }

        // Generate proper affiliate link if it's an Amazon product
        if (product.affiliate_type === 'amazon' && product.affiliate_link) {
          product.affiliate_link = generateAffiliateLink(product.affiliate_link);
        }

        const { error: importError } = await supabase
          .from('products')
          .upsert([product], {
            onConflict: 'name',
            ignoreDuplicates: skipDuplicates
          });

        if (importError) throw importError;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to import products');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-xl">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Import Products</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!file ? (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center w-full h-full space-y-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Click to select a CSV file
                </span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 dark:text-gray-400">Selected file:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{file.name}</span>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setPreviewData([]);
                    setDuplicates([]);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Found {previewData.length} products to import
                </p>
              </div>

              {duplicates.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2" />
                    <div>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                        Found {duplicates.length} existing products
                      </p>
                      <div className="mt-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={skipDuplicates}
                            onChange={(e) => setSkipDuplicates(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Skip existing products
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-400 p-4 rounded-lg flex items-center">
              <Check className="w-5 h-5 mr-2 flex-shrink-0" />
              <p>Import completed successfully!</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            disabled={importing}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file || importing || success}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {importing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Importing...
              </>
            ) : (
              'Import'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductImportModal;