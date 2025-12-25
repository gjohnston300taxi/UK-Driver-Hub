import Nav from '@/components/nav'
import { BookOpen, FileText, Video, Download } from 'lucide-react'

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Resources</h1>
          <p className="text-muted-foreground">
            Guides, training materials, and helpful documents for drivers
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Quick Links */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-taxi-yellow" />
              Documentation
            </h2>
            <div className="space-y-3">
              <ResourceLink title="Driver Handbook" type="PDF" />
              <ResourceLink title="Safety Guidelines" type="PDF" />
              <ResourceLink title="Insurance Information" type="PDF" />
              <ResourceLink title="Tax & Finance Guide" type="PDF" />
            </div>
          </div>

          {/* Video Tutorials */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Video className="h-5 w-5 text-taxi-yellow" />
              Video Tutorials
            </h2>
            <div className="space-y-3">
              <ResourceLink title="Getting Started Guide" type="Video" />
              <ResourceLink title="App Navigation Tutorial" type="Video" />
              <ResourceLink title="Safety Best Practices" type="Video" />
              <ResourceLink title="Customer Service Tips" type="Video" />
            </div>
          </div>
        </div>

        {/* Training Modules */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-taxi-yellow" />
            Training Modules
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TrainingModule
              title="Vehicle Safety Inspection"
              progress={100}
              completed={true}
            />
            <TrainingModule
              title="Customer Service Excellence"
              progress={60}
              completed={false}
            />
            <TrainingModule
              title="Emergency Procedures"
              progress={0}
              completed={false}
            />
            <TrainingModule
              title="Route Optimization"
              progress={100}
              completed={true}
            />
            <TrainingModule
              title="Disability Awareness"
              progress={30}
              completed={false}
            />
            <TrainingModule
              title="First Aid Basics"
              progress={0}
              completed={false}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function ResourceLink({ title, type }: { title: string; type: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer group">
      <span className="font-medium group-hover:text-taxi-yellow transition-colors">
        {title}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{type}</span>
        <Download className="h-4 w-4 text-muted-foreground group-hover:text-taxi-yellow transition-colors" />
      </div>
    </div>
  )
}

function TrainingModule({
  title,
  progress,
  completed,
}: {
  title: string
  progress: number
  completed: boolean
}) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
      <h3 className="font-medium mb-3">{title}</h3>
      <div className="mb-2">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-taxi-yellow rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{progress}% complete</span>
        {completed && (
          <span className="text-green-600 font-medium">✓ Completed</span>
        )}
      </div>
    </div>
  )
}
