'use client'

import { ArrowUp, Plus, Sparkles, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"

export default function Component() {
  const searchSuggestions = [
    "Studios under $2000/month",
    "Pet-friendly apartments",
    "2-bedroom rentals near subway",
    "Short-term leases available",
    "No-fee apartments",
    "Housing with in-unit laundry",
  ]

  const [selectedCity, setSelectedCity] = useState("New York City")
  const cityOptions = ["New York City", "San Francisco", "Toronto", "Vancouver"]
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [searchInput, setSearchInput] = useState("")
  const [results, setResults] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownOpen])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResults(null)
    try {
      const res = await fetch("/api/gemini-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchInput, city: selectedCity })
      })
      const data = await res.json()
      setResults(data.result)
    } catch (err) {
      setResults("Sorry, something went wrong.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-4xl w-full text-center space-y-12">
        {/* Main Heading */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-serif text-black leading-tight">The Search Engine for Finding Housing and Rentals in</h1>
          <div className="flex items-center justify-center gap-2 relative">
            <button
              className="text-5xl md:text-6xl font-serif text-black flex items-center gap-2 focus:outline-none"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              {selectedCity}
              <ChevronDown className="w-8 h-8 text-gray-600 mt-2 transition-transform duration-200" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>
            {dropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-full shadow-2xl z-10 min-w-[240px] transition-all duration-200 animate-fade-in"
                style={{ boxShadow: '0 8px 32px rgba(80, 80, 120, 0.18)', borderRadius: '2rem' }}
              >
                {cityOptions.map((city, idx) => (
                  <div
                    key={city}
                    className={`px-8 py-4 text-xl cursor-pointer transition-colors duration-150 mb-2 last:mb-0 ${selectedCity === city ? 'bg-purple-50 text-purple-900 font-bold' : 'text-gray-900 hover:bg-gray-100'} rounded-full`}
                    onClick={() => {
                      setSelectedCity(city)
                      setDropdownOpen(false)
                    }}
                  >
                    {city}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <form className="relative max-w-3xl mx-auto" onSubmit={handleSearch}>
          <div className="relative bg-white rounded-3xl border-2 border-purple-900 p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <Button size="sm" variant="ghost" className="rounded-full w-8 h-8 p-0 hover:bg-gray-100" type="button">
                <Plus className="w-4 h-4 text-gray-600" />
              </Button>

              <Input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Apartments for rent in Manhattan, pet-friendly..."
                className="flex-1 text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
              />

              <div className="flex items-center gap-2">
                <Button size="sm" className="rounded-full w-10 h-10 p-0 bg-gray-400 hover:bg-gray-500 ml-2" type="submit">
                  <ArrowUp className="w-4 h-4 rotate-45" />
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Search Suggestions */}
        {(!results && !loading) && (
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
        )}
        <div className="max-w-3xl mx-auto mt-8 min-h-[80px] text-left">
          {loading && <div className="text-lg text-gray-500">Searching for housing options...</div>}
          {results && <div className="bg-gray-50 rounded-xl p-6 text-gray-900 whitespace-pre-line">{results}</div>}
        </div>
      </div>
    </div>
  )
}
