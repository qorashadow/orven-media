import React from 'react'
import { Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function AdminSettingsPage() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div className="pb-4 border-b border-[#26262c]">
        <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#d9d9de]">
          Global Platform Settings
        </h1>
        <p className="text-xs text-[#8b8b94] mt-0.5">
          Configure site name, registration rules, and video storage parameters.
        </p>
      </div>

      <div className="p-6 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-4">
        <Input label="Site Name" defaultValue="Orven Media" disabled />
        <Input label="App URL" defaultValue="http://localhost:3000" disabled />
        <Input label="Storage Directory" defaultValue="./uploads" disabled />
        <Input label="Max Video Upload Size" defaultValue="500 MB" disabled />

        <div className="pt-2">
          <span className="text-[11px] font-mono text-[#56565e]">
            To modify these values, update your .env file and restart the server.
          </span>
        </div>
      </div>
    </div>
  )
}
