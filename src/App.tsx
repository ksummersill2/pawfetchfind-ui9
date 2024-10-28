import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Dog, Menu, Bone, Sun, Moon, Shield, UserCircle, Bell, Home, Users, Tag, X } from 'lucide-react';
import DogSelector from './components/DogSelector';
import SearchBar from './components/SearchBar';
import CategoryGrid from './components/CategoryGrid';
import HeroSlideshow from './components/HeroSlideshow';
import CategoryPage from './pages/CategoryPage';
import FavoritesPage from './pages/FavoritesPage';
import SearchPage from './pages/SearchPage';
import ProductPage from './pages/ProductPage';
import { categories } from './data/categories';
import { useDogProfiles } from './hooks/useDogProfiles';
import { useTheme } from './hooks/useTheme';
import DogForm from './components/DogForm';
import SEO from './components/SEO';
import UserAuthModal from './components/UserAuthModal';
import { useAuth } from './hooks/useAuth';
import AdminLayout from './pages/admin/AdminLayout';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBreeds from './pages/admin/AdminBreeds';
import ProductImport from './pages/admin/ProductImport';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import NewsletterSubscription from './components/NewsletterSubscription';
import BlackFridayPage from './pages/BlackFridayPage';
import CommunityPage from './pages/CommunityPage';

const App: React.FC = () => {
  const { dogs, activeDogId, setActiveDogId, addDog } = useDogProfiles();
  const { theme, toggleTheme } = useTheme();
  const [showDogForm, setShowDogForm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigationItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/black-friday', icon: Tag, label: 'Black Friday' },
    { path: '/community', icon: Users, label: 'Community' },
    { path: '/favorites', icon: Bone, label: 'Favorites' },
  ];

  return (
    <Router>
      <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 dark:text-white transition-colors duration-200`}>
        <SEO />
        {/* Navigation */}
        <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                  <Dog className="h-8 w-8" />
                  <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">PawfectFind</span>
                </Link>
              </div>

              <div className="hidden md:block flex-1 max-w-2xl mx-8">
                <SearchBar />
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <item.icon className="w-5 h-5 mr-2" />
                    {item.label}
                  </Link>
                ))}

                <button
                  onClick={toggleTheme}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                </button>

                <button
                  onClick={() => setShowNewsletter(true)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <Bell className="h-6 w-6" />
                </button>

                {isAuthenticated ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      <UserCircle className="h-6 w-6" />
                      <span className="text-sm">{user?.email}</span>
                    </button>
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <Shield className="h-6 w-6" />
                    <span className="text-sm">Sign In</span>
                  </button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div 
                ref={mobileMenuRef}
                className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4 space-y-4"
              >
                <SearchBar />
                
                <div className="space-y-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5 mr-2" />
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center w-full px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="w-5 h-5 mr-2" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="w-5 h-5 mr-2" />
                        Dark Mode
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setShowNewsletter(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <Bell className="w-5 h-5 mr-2" />
                    Notifications
                  </button>

                  {isAuthenticated ? (
                    <>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Shield className="w-5 h-5 mr-2" />
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      >
                        <UserCircle className="w-5 h-5 mr-2" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setShowAuthModal(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      <Shield className="w-5 h-5 mr-2" />
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Dog Selector */}
        {isAuthenticated && !isAdmin && (
          <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Dogs</h2>
                <button
                  onClick={() => setShowDogForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                >
                  Add Dog
                </button>
              </div>
              <DogSelector
                dogs={dogs}
                activeDogId={activeDogId}
                onDogSelect={setActiveDogId}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <HeroSlideshow />
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                      Browse Categories
                    </h1>
                    <CategoryGrid categories={categories} />
                  </div>
                </>
              }
            />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/product/:productId" element={<ProductPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/black-friday" element={<BlackFridayPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="breeds" element={<AdminBreeds />} />
              <Route path="import" element={<ProductImport />} />
            </Route>
          </Routes>
        </main>

        {/* Modals */}
        {showDogForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Dog</h2>
              <DogForm
                onSubmit={(data) => {
                  addDog(data);
                  setShowDogForm(false);
                }}
                onCancel={() => setShowDogForm(false)}
              />
            </div>
          </div>
        )}

        {showAuthModal && (
          <UserAuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />
        )}

        {showNewsletter && (
          <NewsletterSubscription
            isOpen={showNewsletter}
            onClose={() => setShowNewsletter(false)}
          />
        )}
      </div>
    </Router>
  );
};

export default App;