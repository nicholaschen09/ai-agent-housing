'use client'

import { ArrowUp, Plus, Sparkles, ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"
import ReactMarkdown from 'react-markdown'

export default function Component() {
  const searchSuggestions = [
    "Studios under $2000/month",
    "Pet-friendly apartments",
    "2-bedroom rentals near subway",
    "Short-term leases available",
    "No-fee apartments",
    "Housing with in-unit laundry",
    "Furnished rentals",
    "Apartments with parking",
    "Utilities included",
    "Loft apartments",
    "Downtown condos",
    "Balcony views",
    "Student housing",
    "Family-friendly neighborhoods",
    "Luxury high-rises",
    "Affordable housing",
    "Walk-in closet",
    "Gym in building",
    "Rooftop access",
    "Dog-friendly rentals",
    "Near public transit"
  ]

  const [selectedCity, setSelectedCity] = useState("New York City")
  const cityOptions = [
    "New York City",
    "San Francisco",
    "Toronto",
    "Vancouver",
    "Los Angeles",
    "Chicago",
    "Boston",
    "Seattle",
    "Washington DC",
    "Miami",
    "Austin",
    "Dallas",
    "Houston",
    "Philadelphia",
    "Montreal",
    "Calgary",
    "Ottawa",
    "Edmonton",
    "Winnipeg",
    "Quebec City",
    "San Diego",
    "Phoenix",
    "San Jose",
    "Denver",
    "Portland",
    "Minneapolis",
    "Detroit",
    "Baltimore",
    "Charlotte",
    "Orlando",
    "Las Vegas",
    "Nashville",
    "Raleigh",
    "Richmond",
    "Halifax",
    "Victoria",
    "Hamilton",
    "Kitchener",
    "London (ON)",
    "Windsor",
    "Saskatoon",
    "Regina",
    "St. John's",
    "St. Catharines",
    "Oshawa",
    "Barrie",
    "Kelowna"
  ]
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [searchInput, setSearchInput] = useState("")
  const [results, setResults] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [citySearch, setCitySearch] = useState("")
  const [hoveredCity, setHoveredCity] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredCities = cityOptions.filter(city => city.toLowerCase().includes(citySearch.toLowerCase()))

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

  useEffect(() => {
    if (searchInput === "" && results) {
      setResults(null);
    }
  }, [searchInput]);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile)
      setImagePreview(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setImagePreview(null)
    }
  }, [imageFile])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchInput.trim() === "") return;
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

  function handlePlusClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  function handleDrop(e: React.DragEvent<HTMLFormElement>) {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImageFile(e.dataTransfer.files[0])
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLFormElement>) {
    e.preventDefault()
  }

  function handleRemoveImage() {
    setImageFile(null)
  }

  function handleSuggestionClick(suggestion: string) {
    setSearchInput(suggestion)
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 0)
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
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-10 min-w-[340px] transition-all duration-200 animate-fade-in overflow-hidden"
                style={{ boxShadow: '0 8px 32px rgba(80, 80, 120, 0.18)', borderRadius: '1.25rem' }}
                onMouseLeave={() => setHoveredCity(null)}
              >
                <div className="sticky top-0 z-20 bg-white px-4 pt-4 pb-2">
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Search className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      value={citySearch}
                      onChange={e => setCitySearch(e.target.value)}
                      placeholder="Search cities..."
                      className="w-full rounded-full border border-gray-200 pl-10 pr-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-red-200"
                    />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto rounded-b-2xl custom-scrollbar">
                  {filteredCities.length === 0 && (
                    <div className="px-8 py-6 text-gray-400 text-center">No cities found.</div>
                  )}
                  {filteredCities.map((city, idx) => {
                    const isActive = selectedCity === city || hoveredCity === city;
                    return (
                      <div
                        key={city}
                        className={`px-8 py-3 text-xl cursor-pointer transition-colors duration-150
                          ${selectedCity === city ? 'bg-red-100 text-red-700 shadow-sm' : hoveredCity === city ? 'bg-red-50 text-red-700' : 'text-gray-900 hover:bg-red-50'}
                          ${isActive ? '' : 'rounded-full'}
                        `}
                        onMouseEnter={() => setHoveredCity(city)}
                        onMouseLeave={() => setHoveredCity(null)}
                        onClick={() => {
                          setSelectedCity(city)
                          setDropdownOpen(false)
                          setCitySearch("")
                        }}
                      >
                        {city}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <form className="relative max-w-3xl mx-auto" onSubmit={handleSearch} onDrop={handleDrop} onDragOver={handleDragOver}>
          <div className="relative bg-white rounded-3xl border-2 border-red-600 p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <Button size="sm" variant="ghost" className="rounded-full w-8 h-8 p-0 hover:bg-gray-100" type="button" onClick={handlePlusClick}>
                <Plus className="w-4 h-4 text-gray-600" />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </Button>

              <Input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Apartments for rent in Manhattan, pet-friendly..."
                className="flex-1 text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
                ref={searchInputRef}
              />

              <div className="flex items-center gap-2">
                <Button size="sm" className="rounded-full w-10 h-10 p-0 bg-red-100 hover:bg-red-300 ml-2 transition-colors" type="submit">
                  <ArrowUp className="w-4 h-4 rotate-45 text-red-700 group-hover:text-white transition-colors" />
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Search Suggestions */}
        {!results && !loading && (
          <div className="space-y-3">
            <div className="overflow-hidden w-full">
              <div className="flex gap-3 animate-scroll-left whitespace-nowrap">
                {[...searchSuggestions, ...searchSuggestions, ...searchSuggestions].map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="rounded-full bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 px-4 py-2 h-auto text-sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
            <div className="overflow-hidden w-full">
              <div className="flex gap-3 animate-scroll-right whitespace-nowrap">
                {[...searchSuggestions, ...searchSuggestions, ...searchSuggestions].map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="rounded-full bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 px-4 py-2 h-auto text-sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="max-w-3xl mx-auto mt-8 min-h-[80px] text-left">
          {loading && <div className="text-lg text-gray-500">Searching for housing options...</div>}
          {results && (
            <div className="bg-gray-50 rounded-xl p-6 text-gray-900 whitespace-pre-line">
              <ReactMarkdown>{results}</ReactMarkdown>
              <div className="mt-4 text-xs text-gray-500">Results are generated by AI and are for informational purposes only. For live listings, use a trusted housing platform.</div>
            </div>
          )}
          {imageFile && (
            <div className="mt-2 text-xs text-gray-500">Image selected: {imageFile.name}</div>
          )}
        </div>
        {imagePreview && (
          <div className="flex items-start mb-6 pl-8 relative" style={{ minHeight: 64 }}>
            <div className="relative">
              <img src={imagePreview} alt="Uploaded preview" className="w-16 h-16 object-cover rounded-2xl shadow" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-gray-100"
                aria-label="Remove image"
              >
                <span className="text-lg text-gray-700">×</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
