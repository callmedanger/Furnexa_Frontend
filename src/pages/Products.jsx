import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { fetchProducts, deleteProduct } from '../api/productService';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(`Delete product "${title || 'this product'}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <Loader full />;

  const filteredProducts = products.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(term) ||
      p.author?.toLowerCase().includes(term) ||
      p.genere?.toLowerCase().includes(term) ||
      p.sellerName?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif text-[#2E2118] dark:text-[#F0EAE0]">Products</h1>
          <p className="text-sm text-[#A99A82] mt-1">{filteredProducts.length} of {products.length} products</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-[#2A1F16] border border-[#EDE6DA] dark:border-white/10 rounded-lg px-3 py-2 w-64">
          <Search size={16} className="text-[#A99A82]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, seller, category..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-[#A99A82] text-[#2E2118] dark:text-[#E8DFD3]"
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-[#2A1F16] rounded-2xl border border-[#EDE6DA] dark:border-white/10 py-16 text-center text-[#A99A82]">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleDelete}
              deleting={deletingId === product.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;