import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';



const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  useEffect(() => {
    fetchProducts();
  }, []);

  // Read `q` from URL (set by the Navbar) and use it as the search term
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    if (q !== searchTerm) setSearchTerm(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);



  const fetchProducts = async () => {
    try {
      // Use the Vite proxy in development. This will forward to http://localhost:8082
      const response = await fetch('/api/products/getAllProduct');

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      // Ensure we have an array - backend should return an array of products
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };


  // Use `catalogueName` from your backend as the category
  const categories = ['all', ...new Set(products.map((p) => p.catalogueName || p.subCatalogueName || 'Other'))];

  const filteredProducts = products.filter((product) => {
    const productCategory = product.catalogueName || product.subCatalogueName || 'Other';
    const matchesCategory = category === 'all' || productCategory === category;
    const matchesSearch =
      !searchTerm ||
      (product.productName && product.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.catalogueName && product.catalogueName.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[hsl(var(--gradient-hero))] py-12 mb-6">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Welcome to ShopHub</h1>
          <p className="text-xl text-muted-foreground">
            Discover amazing products at unbeatable prices
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Filters */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <h2 className="text-2xl text-muted-foreground">No products found</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
