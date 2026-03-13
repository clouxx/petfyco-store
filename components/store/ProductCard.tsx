'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatCOP } from '@/lib/supabase';
import type { Product } from '@/lib/types';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [wishlist, setWishlist] = useState(false);
  const [adding, setAdding] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) return;
    setAdding(true);
    addItem(product, 1);
    toast.success(`${product.name} añadido al carrito`);
    setTimeout(() => setAdding(false), 600);
  };

  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1601758064978-4e9c55a11fcb?w=400&h=400&fit=crop';

  return (
    <Link href={`/producto/${product.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group-hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-petfy-grey">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.stock === 0 && (
              <span className="badge bg-gray-700 text-white">Agotado</span>
            )}
            {product.compare_price && product.compare_price > product.price && (
              <span className="badge bg-petfy-pink text-white">
                -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
              </span>
            )}
            {product.featured && product.stock > 0 && (
              <span className="badge bg-petfy-orange text-white">Destacado</span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setWishlist(!wishlist);
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
            aria-label="Favorito"
          >
            <Heart
              size={16}
              className={wishlist ? 'fill-petfy-pink text-petfy-pink' : 'text-gray-400'}
            />
          </button>

          {/* Category Badge */}
          {product.category && (
            <div className="absolute bottom-3 left-3">
              <span className="badge bg-white/90 text-navy text-xs backdrop-blur-sm">
                {product.category.name}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-navy text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-navy">{formatCOP(product.price)}</span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-sm text-petfy-grey-text line-through">
                {formatCOP(product.compare_price)}
              </span>
            )}
          </div>

          {/* Stock indicator */}
          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-xs text-petfy-orange font-medium mb-2">
              Solo {product.stock} disponibles
            </p>
          )}

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              product.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : adding
                ? 'bg-accent text-white'
                : 'bg-primary text-white hover:bg-accent'
            }`}
          >
            <ShoppingCart size={15} />
            {product.stock === 0 ? 'Agotado' : adding ? '¡Añadido!' : 'Añadir al carrito'}
          </button>
        </div>
      </div>
    </Link>
  );
}
