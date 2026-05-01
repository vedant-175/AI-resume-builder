import { useResumeStore } from '../state/resumeStore'
import { NumberField } from '../ui/NumberField'

export function SettingsPage() {
  const aiParams = useResumeStore((s) => s.aiParams)
  const setAiParams = useResumeStore((s) => s.setAiParams)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          These values are sent to your backend AI endpoint.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Model parameters</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <NumberField
            label="Temperature"
            value={aiParams.temperature}
            min={0}
            max={1.5}
            step={0.1}
            onChange={(v) => setAiParams({ temperature: v })}
          />
          <NumberField
            label="Top-p"
            value={aiParams.topP}
            min={0.1}
            max={1}
            step={0.05}
            onChange={(v) => setAiParams({ topP: v })}
          />
        </div>
      </div>
    </div>
  )
}

