type Props = {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}

export function TextField({ label, value, onChange, placeholder, required }: Props) {
  const id = `tf_${label.replace(/\s+/g, '_').toLowerCase()}`
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {label} {required ? <span className="text-rose-600">*</span> : null}
      </span>
      <input
        id={id}
        className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-violet-500"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  )
}

