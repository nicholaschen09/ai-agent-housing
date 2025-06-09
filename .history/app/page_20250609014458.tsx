import { ArrowUp, Plus, Sparkles, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Component() {
  const searchSuggestions = [
    "Studios under $2000/month",
    "Pet-friendly apartments",
    "2-bedroom rentals near subway",
    "Short-term leases available",
    "No-fee apartments",
    "Housing with in-unit laundry",
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-4xl w-full text-center space-y-12">
        {/* Main Heading */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-serif text-black leading-tight">The Search Engine for Finding Housing and Rentals</h1>
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-5xl md:text-6xl font-serif text-black">New York City</h2>
            <ChevronDown className="w-8 h-8 text-gray-600 mt-2" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-3xl mx-auto">
          <div className="relative bg-white rounded-3xl border-2 border-purple-900 p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <Button size="sm" variant="ghost" className="rounded-full w-8 h-8 p-0 hover:bg-gray-100">
                <Plus className="w-4 h-4 text-gray-600" />
              </Button>

              <Input
                type="text"
                placeholder="Apartments for rent in Manhattan, pet-friendly..."
                className="flex-1 text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
              />

              <div className="flex items-center gap-2">
                <Button size="sm" className="rounded-full w-10 h-10 p-0 bg-gray-400 hover:bg-gray-500 ml-2">
                  <ArrowUp className="w-4 h-4 rotate-45" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Suggestions */}
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {searchSuggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              className="rounded-full bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 px-4 py-2 h-auto text-sm"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
