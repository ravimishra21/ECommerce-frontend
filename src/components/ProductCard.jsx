import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Local add to cart handler - uses CartContext local-first sync logic
  const handleAddToCart = (e, product) => {
    e.stopPropagation(); // Prevent the click event from bubbling to the parent Link
    addToCart(product);
    console.log('Added to cart:', product);
    navigate(`/`);
  };

   // Navigate to product detail page on card click (excluding the button)
  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
      <Card
        className="h-full flex flex-col cursor-pointer hover:shadow-hover transition-all duration-300"
           onClick={handleCardClick} // Navigate to product detail page when clicking anywhere on the card

     >
        <div className="p-4 bg-muted flex items-center justify-center min-h-[180px]">
          <img src={product.imageUrl} alt={product.productName} className="max-h-[160px] object-contain" />
        </div>
        <CardContent className="flex-1 flex flex-col p-4">
          <h3 className="text-sm font-medium mb-1 line-clamp-2 min-h-[48px]">{product.productName}</h3>

          <div className="text-sm text-muted-foreground mb-2">{product.catalogueName}</div>

          <div className="text-lg font-semibold mb-3">{product.basePrice != null ? `$${Number(product.basePrice).toFixed(2)}` : 'Price N/A'}</div>

          <div className="text-sm text-muted-foreground mb-3 line-clamp-3">{product.shortDescription || product.longDescription}</div>

          <Button
            variant="default"
            className="w-full mt-auto bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={(e) => handleAddToCart(e, product)}  // Call the handler when the button is clicked
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </CardContent>
      </Card>

);
};

export default ProductCard;
