import { ComingNext } from "@/components/coming-next"

export default function MarketplacePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
      <p className="text-muted-foreground mb-8">Discover deals and services</p>

      <ComingNext
        items={[
          "Exclusive driver discounts and offers",
          "Vehicle maintenance services",
          "Insurance providers and quotes",
          "Fuel discount programs",
          "Car wash and detailing services",
          "Vehicle accessories and upgrades",
          "Partner perks (food, retail, entertainment)",
          "Search and filter by category"
        ]}
      />
    </div>
  )
}
