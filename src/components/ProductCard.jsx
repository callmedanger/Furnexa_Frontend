import { Trash2 } from 'lucide-react';

const ProductCard = ({ product, onDelete, deleting }) => {
  const image = product.images?.[0];

  return (
    <div className="bg-white dark:bg-[#2A1F16] rounded-2xl shadow-sm border border-[#EDE6DA] dark:border-white/10 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square bg-[#F6F2EC] dark:bg-white/5 overflow-hidden relative">
        {image ? (
          <img
            src={image}
            alt={product.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { e.target.src = 'https://placehold.co/300x300/F6F2EC/A99A82?text=No+Image'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#A99A82] text-sm">
            No Image
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-[#A99A82] uppercase tracking-wide">{product.genere || 'Product'}</p>
        <h3 className="font-medium text-[#2E2118] dark:text-[#F0EAE0] mt-1 line-clamp-1">{product.title || product.author}</h3>
        <p className="text-sm text-[#5C4A3A] dark:text-[#C9BBA4] mt-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-semibold text-[#C98A3D]">Rs. {product.price?.toLocaleString() || 0}</span>
          <span className="text-xs text-[#A99A82]">{product.salesCount || 0} sold</span>
        </div>
        <p className="text-xs text-[#A99A82] mt-2">Seller: {product.sellerName || 'Unknown'}</p>

        <button
          onClick={() => onDelete(product.id, product.title)}
          disabled={deleting}
          className="w-full mt-4 flex items-center justify-center gap-1.5 bg-[#C1694F] hover:bg-[#A14E38] text-white text-xs font-medium px-3 py-2 rounded-md disabled:opacity-50 transition-colors"
        >
          <Trash2 size={14} />
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;