import { CheckCircle2 } from "lucide-react"

interface ComingNextProps {
  items: string[]
}

export function ComingNext({ items }: ComingNextProps) {
  return (
    <div className="mt-8 max-w-2xl">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-taxi-yellow" />
        Coming Next
      </h2>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="mt-1 h-4 w-4 rounded-full border-2 border-taxi-yellow flex-shrink-0" />
            <span className="text-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
