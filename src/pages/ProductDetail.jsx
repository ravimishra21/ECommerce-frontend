import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Debug: Log the `id` to check if it's correct
  useEffect(() => {
    console.log("Product ID from URL:", id);
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      // Debugging: Check the ID being fetched
      console.log('Fetching product with ID:', id);

      if (!id) {
        console.error('No product ID provided!');
        return; // Avoid making a fetch request if the id is missing
      }

      const response = await fetch('/api/products/getProductById/' + id);

      // Check if the response is valid
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      // Debugging: Log the response for validation
      console.log('API Response:', response);

      const data = await response.json();

      // If no product data is returned, show an error message and stop further action
      if (!data || Object.keys(data).length === 0) {
        console.error('Product not found for ID:', id);
        setProduct(null);
        return;
      }

      // Set the fetched product data
      setProduct(data);
      console.log('Fetched product data:', data); // Debugging: Log the fetched product data
    } catch (error) {
      console.error('Error fetching product:', error);
      // Optionally display an error message to the user
      setProduct(null);  // Ensure the UI indicates the product isn't found
      // Redirect to home if needed
      // navigate('/');
    } finally {
      setLoading(false);
    }
  };


  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no product is found, show a message
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Product not found</h2>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-muted rounded-lg p-8 flex justify-center items-center min-h-[400px]">
          <img
            src={product.imageUrl}
            alt={product.productName}
            className="max-w-full max-h-[500px] object-contain"
          />
        </div>

        <div>
          <Badge className="mb-3">{product.catalogueName || product.subCatalogueName || 'Uncategorized'}</Badge>

          <h1 className="text-3xl font-bold mb-3">{product.productName}</h1>

          <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
            {product.brand && <div>Brand: <span className="font-medium text-foreground">{product.brand}</span></div>}
            {product.material && <div>Material: <span className="font-medium text-foreground">{product.material}</span></div>}
            {product.isReturnable != null && (
              <div>{product.isReturnable ? 'Returnable' : 'Non-returnable'}</div>
            )}
          </div>

          <div className="text-3xl font-normal mb-6">{product.basePrice != null ? `$${Number(product.basePrice).toFixed(2)}` : 'Price N/A'}</div>

          <p className="text-base leading-relaxed mb-6">{product.shortDescription || product.longDescription || 'No description available.'}</p>

          <Button
            size="lg"
            className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => {
              addToCart(product);
              navigate('/cart');
            }}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
