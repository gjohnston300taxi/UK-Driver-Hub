import Nav from '@/components/nav'
import { ShoppingBag, Star } from 'lucide-react'

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
          <p className="text-muted-foreground">
            Essential products and services for taxi drivers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProductCard
            title="Premium Car Air Freshener"
            price="£12.99"
            rating={4.5}
            reviews={234}
            category="Accessories"
            image="🌸"
          />
          <ProductCard
            title="Professional Phone Mount"
            price="£24.99"
            rating={4.8}
            reviews={567}
            category="Accessories"
            image="📱"
          />
          <ProductCard
            title="LED Interior Lighting Kit"
            price="£34.99"
            rating={4.6}
            reviews={189}
            category="Upgrades"
            image="💡"
          />
          <ProductCard
            title="Dash Camera HD Pro"
            price="£89.99"
            rating={4.9}
            reviews={892}
            category="Safety"
            image="📹"
          />
          <ProductCard
            title="Seat Cover Set - Premium"
            price="£45.99"
            rating={4.7}
            reviews={456}
            category="Interior"
            image="🪑"
          />
          <ProductCard
            title="First Aid Kit - Complete"
            price="£19.99"
            rating={4.8}
            reviews={678}
            category="Safety"
            image="🏥"
          />
          <ProductCard
            title="Car Cleaning Kit Pro"
            price="£29.99"
            rating={4.5}
            reviews={345}
            category="Maintenance"
            image="🧼"
          />
          <ProductCard
            title="Portable Phone Charger"
            price="£16.99"
            rating={4.6}
            reviews={523}
            category="Electronics"
            image="🔋"
          />
          <ProductCard
            title="Winter Emergency Kit"
            price="£39.99"
            rating={4.7}
            reviews={267}
            category="Safety"
            image="❄️"
          />
        </div>
      </main>
    </div>
  )
}

function ProductCard({
  title,
  price,
  rating,
  reviews,
  category,
  image,
}: {
  title: string
  price: string
  rating: number
  reviews: number
  category: string
  image: string
}) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
      <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-6xl">
        {image}
      </div>
      <div className="p-5">
        <div className="text-xs font-medium text-taxi-yellow mb-2">
          {category}
        </div>
        <h3 className="font-semibold mb-2 group-hover:text-taxi-yellow transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-taxi-yellow text-taxi-yellow" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            ({reviews} reviews)
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">{price}</span>
          <button className="px-4 py-2 bg-taxi-yellow hover:bg-taxi-yellow/90 text-black text-sm font-semibold rounded-lg transition-colors">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
