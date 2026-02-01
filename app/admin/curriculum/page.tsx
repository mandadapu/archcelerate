import { ModuleBuilder } from '@/src/components/curriculum/ModuleBuilder'

export default function CurriculumPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Curriculum Management</h1>
          <p className="text-gray-600">
            Build and organize your educational modules with drag-and-drop lesson ordering
          </p>
        </div>

        <ModuleBuilder />
      </div>
    </div>
  )
}
