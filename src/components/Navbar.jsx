import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Search } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';  
import { Badge } from '@/components/ui/badge';


const Navbar = () => {
  const { cartCount, serverCartCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchValue, setSearchValue] = useState('');
  const syncingFromUrl = useRef(false);
  const timeoutRef = useRef(null);
const { syncCartFromServer } = useCart();


  const handleLogout = () => {
    logout();
    localStorage.removeItem('authToken');
    localStorage.removeItem('cartCount'); // Remove cartCount from localStorage on logout
    navigate('/');
  };

  // Initialize search value from URL `q` param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    // Clear any pending debounce navigation to avoid racing redirects
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    syncingFromUrl.current = true;
    setSearchValue(q);
  }, [location.search]);

  // Debounce navigation when searchValue changes
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    timeoutRef.current = setTimeout(() => {
      if (syncingFromUrl.current) {
        syncingFromUrl.current = false;
        timeoutRef.current = null;
        return;
      }
      const q = (searchValue || '').trim();
      if (q) navigate(`/?q=${encodeURIComponent(q)}`, { replace: true });
      timeoutRef.current = null;
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); 
        timeoutRef.current = null;
      }
    };
  }, [searchValue, navigate]);

  // Fetch cart count from localStorage on load (if available)
  const storedCartCount = JSON.parse(localStorage.getItem('cartCount') || '0');
  const [persistentCartCount, setPersistentCartCount] = useState(storedCartCount);

  // Update cart count in localStorage whenever it changes
  useEffect(() => {
    if (persistentCartCount !== null) {
      localStorage.setItem('cartCount', JSON.stringify(persistentCartCount));
    }
  }, [persistentCartCount]);

  // Synchronize local state with cart count and handle serverCartCount when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Sync with serverCartCount when authenticated
      setPersistentCartCount(serverCartCount || persistentCartCount); // Use server count or keep persistent count
    } else {
      setPersistentCartCount(cartCount || persistentCartCount); // For non-authenticated users, use local cart count
    }
  }, [cartCount, serverCartCount, isAuthenticated]);

  const name = localStorage.getItem('username');


    // Handle click on cart badge (fetch cart items from the API)
  const handleCartClick = async () => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userid');

    try {
      const res = await fetch(`http://localhost:9090/api/cart/findAllCartOfSpecificUser/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        // Use the CartContext to sync the cart data
      syncCartFromServer(data);
        console.log('Cart Data:', data); // Handle cart data (e.g., display or update state)
      } else {
        console.error('Failed to fetch cart:', data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-primary shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16 gap-4">
          <Link to="/" className="text-2xl font-bold text-primary-foreground hover:text-accent transition-colors">
            HCL ShopHub
          </Link>

          <div className="flex-1 max-w-2xl mx-4 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const q = (searchValue || '').trim();
                    if (q) navigate(`/?q=${encodeURIComponent(q)}`);
                    else navigate('/');
                  }
                }}
                className="w-full px-4 py-2 rounded-md border-0 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="text-primary-foreground hover:text-accent hover:bg-primary/80"
                    onClick={handleCartClick} // Add onClick handler for the cart badge
                >
                  <Link to="/cart" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {/* Show server cart count if authenticated, otherwise show local cart count */}
                    {persistentCartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground text-xs">
                        {persistentCartCount}
                      </Badge>
                    )}
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="text-primary-foreground hover:text-accent hover:bg-primary/80"
                >
                  <Link to="/profile">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  asChild
                  className="text-primary-foreground hover:text-accent hover:bg-primary/80"
                >
                  <Link to="/"> {name} </Link>
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-primary-foreground hover:text-accent hover:bg-primary/80"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                asChild
                className="text-primary-foreground hover:text-accent hover:bg-primary/80"
              >
                <Link to="/auth"> Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
