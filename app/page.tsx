'use client'

import { ArrowUp, Plus, Sparkles, ChevronDown, Search, Settings, Menu, X, Edit, Heart } from "lucide-react"
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
    // US Major Cities
    "New York City", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianapolis", "Seattle", "Denver", "Washington DC", "Boston", "El Paso", "Nashville", "Detroit", "Oklahoma City", "Portland", "Las Vegas", "Memphis", "Louisville", "Baltimore", "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Mesa", "Sacramento", "Atlanta", "Kansas City", "Colorado Springs", "Miami", "Raleigh", "Omaha", "Long Beach", "Virginia Beach", "Oakland", "Minneapolis", "Tulsa", "Tampa", "Arlington", "New Orleans", "Wichita", "Cleveland", "Bakersfield", "Aurora", "Anaheim", "Honolulu", "Santa Ana", "Riverside", "Corpus Christi", "Lexington", "Stockton", "Henderson", "Saint Paul", "St. Louis", "Cincinnati", "Pittsburgh", "Greensboro", "Anchorage", "Plano", "Lincoln", "Orlando", "Irvine", "Newark", "Toledo", "Durham", "Chula Vista", "Fort Wayne", "Jersey City", "St. Petersburg", "Laredo", "Madison", "Chandler", "Buffalo", "Lubbock", "Scottsdale", "Reno", "Glendale", "Gilbert", "Winston–Salem", "North Las Vegas", "Norfolk", "Chesapeake", "Garland", "Irving", "Hialeah", "Fremont", "Boise", "Richmond", "Baton Rouge", "Spokane", "Des Moines", "Tacoma", "San Bernardino", "Modesto", "Fontana", "Santa Clarita", "Birmingham", "Oxnard", "Fayetteville", "Moreno Valley", "Rochester", "Glendale (CA)", "Huntington Beach", "Salt Lake City", "Grand Rapids", "Amarillo", "Yonkers", "Aurora (IL)", "Montgomery", "Akron", "Little Rock", "Huntsville", "Augusta", "Port St. Lucie", "Grand Prairie", "Columbus (GA)", "Tallahassee", "Overland Park", "Tempe", "McKinney", "Mobile", "Cape Coral", "Shreveport", "Frisco", "Knoxville", "Worcester", "Brownsville", "Vancouver (WA)", "Fort Lauderdale", "Sioux Falls", "Ontario (CA)", "Chattanooga", "Providence", "Newport News", "Rancho Cucamonga", "Santa Rosa", "Oceanside", "Salem", "Elk Grove", "Garden Grove", "Pembroke Pines", "Peoria", "Eugene", "Corona", "Cary", "Springfield (MO)", "Fort Collins", "Jackson", "Alexandria", "Hayward", "Lancaster", "Lakewood", "Clarksville", "Palmdale", "Salinas", "Springfield (MA)", "Hollywood (FL)", "Pasadena (TX)", "Sunnyvale", "Macon", "Kansas City (KS)", "Pomona", "Escondido", "Killeen", "Naperville", "Joliet", "Bellevue", "Rockford", "Savannah", "Paterson", "Torrance", "Bridgeport", "McAllen", "Mesquite", "Syracuse", "Midland", "Pasadena (CA)", "Murfreesboro", "Miramar", "Dayton", "Fullerton", "Olathe", "Orange (CA)", "Thornton", "Roseville", "Denton", "Waco", "Surprise", "Carrollton", "West Valley City", "Charleston", "Warren", "Hampton", "Gainesville", "Visalia", "Coral Springs", "Columbia (SC)", "Cedar Rapids", "Sterling Heights", "New Haven", "Stamford", "Concord (CA)", "Kent", "Santa Clara", "Elizabeth", "Round Rock", "Thousand Oaks", "Lafayette (LA)", "Athens (GA)", "Topeka", "Simi Valley", "Fargo", "Norman", "Columbia (MO)", "Abilene", "Wilmington (NC)", "Hartford", "Victorville", "Pearland", "Vallejo", "Ann Arbor", "Berkeley", "Allentown", "Richardson", "Odessa", "Arvada", "Cambridge (MA)", "Sugar Land", "Beaumont", "Lansing", "Evansville", "Rochester (MN)", "Independence (MO)", "Fairfield (CA)", "Provo", "Clearwater", "College Station", "West Jordan", "Carlsbad", "El Monte", "Murrieta", "Temecula", "Springfield (IL)", "Palm Bay", "Costa Mesa", "Westminster (CO)", "North Charleston", "Miami Gardens", "Manchester", "High Point", "Downey", "Clovis (CA)", "Pompano Beach", "Pueblo", "Elgin", "Lowell", "Antioch (CA)", "West Palm Beach", "Peoria (AZ)", "Everett", "Wichita Falls", "Gresham", "Billings", "Inglewood", "Sparks", "San Buenaventura (Ventura)", "Jurupa Valley", "South Bend", "Renton", "Vista", "Davie", "Tuscaloosa", "Compton", "Centennial", "Greeley", "San Mateo", "Norwalk (CA)", "Deltona", "Hillsboro", "Waterbury", "League City", "Santa Maria", "Tyler", "Baldwin Park", "Chino", "Alhambra", "Livonia", "Citrus Heights", "Tracy", "Mountain View",
    // Canada Major Cities
    "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Kitchener", "London (ON)", "Victoria", "Halifax", "Oshawa", "Windsor", "Saskatoon", "St. Catharines", "Regina", "St. John's", "Barrie", "Kelowna", "Sherbrooke", "Guelph", "Abbotsford", "Kingston", "Kanata", "Trois-Rivières", "Chicoutimi", "Milton", "Red Deer", "Brantford", "Thunder Bay", "White Rock", "Nanaimo", "Sudbury", "Peterborough", "Sarnia", "Lethbridge", "Saint John", "Moncton", "Maple Ridge", "Prince George", "Drummondville", "Newmarket", "Chatham-Kent", "Granby", "Saint-Jérôme", "Brampton", "Markham", "Mississauga", "Surrey", "Burnaby", "Richmond (BC)", "Laval", "Longueuil", "Gatineau", "Saguenay", "Levis", "Pickering", "Burlington", "Oakville", "Medicine Hat", "Airdrie", "Spruce Grove", "Grande Prairie", "Saint-Jean-sur-Richelieu", "Blainville", "Dollard-des-Ormeaux", "Welland", "North Bay", "Cornwall", "Belleville", "Chilliwack", "Sault Ste. Marie", "Cambridge (ON)", "Milton", "Ajax", "Whitby", "Clarington", "Waterloo", "Coquitlam", "Langley", "Saanich", "Delta", "Terrebonne", "Saint-Laurent", "Repentigny", "Brossard", "Saint-Eustache", "Pointe-Claire", "Saint-Hyacinthe", "Vaughan", "Richmond Hill", "Aurora", "New Westminster", "West Vancouver", "Port Coquitlam", "Port Moody", "Saint-Bruno-de-Montarville", "Côte-Saint-Luc", "Beaconsfield", "Saint-Lambert", "Dorval", "Mount Pearl", "Corner Brook", "Conception Bay South", "Stratford (PE)", "Summerside", "Charlottetown", "Yellowknife", "Iqaluit", "Whitehorse"
  ]
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [searchInput, setSearchInput] = useState("")
  const [results, setResults] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [showFullAnalysis, setShowFullAnalysis] = useState(false)
  const [fullAnalysisText, setFullAnalysisText] = useState<string | null>(null)
  const [citySearch, setCitySearch] = useState("")
  const [hoveredCity, setHoveredCity] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [loadingDots, setLoadingDots] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarHovered, setSidebarHovered] = useState(false)

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

  // Loading dots animation
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (loading) {
      interval = setInterval(() => {
        setLoadingDots(prev => {
          if (prev === "") return "."
          if (prev === ".") return ".."
          if (prev === "..") return "..."
          return ""
        })
      }, 500)
    } else {
      setLoadingDots("")
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [loading])

  // Function to extract final recommendations from AI response
  function extractFinalRecommendations(text: string): string {
    const sections = text.split('## **My Definitive Recommendations**')
    if (sections.length > 1) {
      return '## **My Definitive Recommendations**' + sections[1]
    }
    // Fallback if the exact format isn't found
    const finalSection = text.split(/##.*[Rr]ecommendations?.*\*\*/i)
    if (finalSection.length > 1) {
      return '## **My Recommendations**' + finalSection[1]
    }
    return text // Return full text if no recommendations section found
  }

  // Streaming effect function - letter by letter
  function streamText(text: string, callback: (partial: string) => void) {
    const characters = text.split('')
    let currentIndex = 0
    const speed = 25 // milliseconds between letters

    const timer = setInterval(() => {
      if (currentIndex < characters.length) {
        const partialText = characters.slice(0, currentIndex + 1).join('')
        callback(partialText)
        currentIndex++
      } else {
        clearInterval(timer)
        setIsStreaming(false)
      }
    }, speed)

    return timer
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchInput.trim() === "") return;
    setLoading(true)
    setResults(null)
    setIsStreaming(false)
    setIsThinking(false)
    setFullAnalysisText(null)

    try {
      const res = await fetch("/api/gemini-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchInput, city: selectedCity })
      })
      const data = await res.json()

      setLoading(false)
      setIsThinking(true)
      setFullAnalysisText(data.result) // Store the full analysis

      // Show "thinking..." for 2 seconds before starting to stream
      setTimeout(() => {
        setIsThinking(false)
        setIsStreaming(true)

        // Choose what to display based on dropdown selection
        // Always start with recommendations only (closed state) unless user has opened it
        const textToStream = showFullAnalysis ? data.result : extractFinalRecommendations(data.result)

        // Start streaming the text letter by letter
        streamText(textToStream, (partialText) => {
          setResults(partialText)
        })
      }, 2000)

    } catch (err) {
      setResults("Sorry, something went wrong.")
      setLoading(false)
      setIsStreaming(false)
      setIsThinking(false)
    }
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

  // Function to handle toggling between full analysis and recommendations
  function handleToggleThinking() {
    const newShowFullAnalysis = !showFullAnalysis
    setShowFullAnalysis(newShowFullAnalysis)

    // If we have full analysis text, immediately switch the displayed content
    if (fullAnalysisText) {
      // Use the NEW state to determine what to show
      // When newShowFullAnalysis is true: show full analysis
      // When newShowFullAnalysis is false: show only recommendations
      const textToShow = newShowFullAnalysis ? fullAnalysisText : extractFinalRecommendations(fullAnalysisText)
      setResults(textToShow)

      // Stop streaming if currently streaming
      if (isStreaming) {
        setIsStreaming(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Simple Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 ${sidebarHovered ? 'w-64' : 'w-16'} bg-red-50 border-r border-red-100 transform transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <div className="flex flex-col h-full justify-between py-4">
          {/* Search icon in top right when expanded */}
          {sidebarHovered && (
            <div className="flex justify-end px-4 mb-4">
              <Search className="w-6 h-6 text-red-400" />
            </div>
          )}

          {/* Top icons */}
          <div className="flex flex-col space-y-2">
            {/* New chat */}
            <button className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg mx-2 transition-colors">
              <Edit className="w-6 h-6 flex-shrink-0" />
              {sidebarHovered && <span className="text-gray-700 whitespace-nowrap">New chat</span>}
            </button>

            {/* Explore Gems */}
            <button className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg mx-2 transition-colors">
              <Heart className="w-6 h-6 flex-shrink-0" />
              {sidebarHovered && <span className="text-gray-700 whitespace-nowrap">Explore Gems</span>}
            </button>

            {/* Recent section */}
            {sidebarHovered && (
              <div className="px-4 mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Recent</h3>
                <div className="space-y-1">
                  <div className="py-2 px-2 text-sm text-gray-600 hover:bg-red-100 rounded-lg cursor-pointer">
                    Tic-Tac-Toe Game Creation
                  </div>
                  <div className="py-2 px-2 text-sm text-white bg-blue-600 rounded-lg cursor-pointer">
                    SYDE 162 Assignment Help
                  </div>
                  <div className="py-2 px-2 text-sm text-gray-600 hover:bg-red-100 rounded-lg cursor-pointer">
                    Image Ideas: Difficulty and ...
                  </div>
                  <div className="py-2 px-2 text-sm text-gray-600 hover:bg-red-100 rounded-lg cursor-pointer">
                    Pinstriped Pants' Origin Unk...
                  </div>
                  <div className="py-2 px-2 text-sm text-gray-600 hover:bg-red-100 rounded-lg cursor-pointer">
                    Swiss Cheese Model Explain...
                  </div>
                  <button className="py-2 px-2 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                    Show more
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings at bottom */}
          <button className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg mx-2 transition-colors">
            <Settings className="w-6 h-6 flex-shrink-0" />
            {sidebarHovered && <span className="text-gray-700 whitespace-nowrap">Settings & help</span>}
          </button>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Chat title - top left */}
        {!sidebarHovered && (
          <div className="fixed top-4 left-20 z-30 lg:left-20">
            <h2 className="text-lg font-medium text-gray-800 flex items-center gap-2">
              <ChevronDown className="w-4 h-4" />
              Housing Search Assistant
            </h2>
          </div>
        )}

        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-30 lg:hidden bg-red-100 text-red-600 p-2 rounded-lg shadow-lg border border-red-200"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="max-w-4xl w-full text-center space-y-12">
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-serif text-black leading-tight">The Search Engine for Finding Housing and Rentals in</h1>
            <div className="flex items-center justify-center gap-2 relative">
              <button
                className="flex items-center gap-2 focus:outline-none transition-colors duration-150"
                onClick={() => setDropdownOpen((open) => !open)}
              >
                <span className="text-5xl md:text-6xl font-serif text-black bg-[#fee2e2] rounded-2xl px-4 py-1">{selectedCity}</span>
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
                          key={`${city}-${idx}`}
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
            <div className={`relative bg-white rounded-3xl border-2 border-red-600 shadow-sm transition-all duration-200 ${imagePreview ? 'p-4 pb-4' : 'p-4'}`}>
              {/* Image Preview inside search bar */}
              {imagePreview && (
                <div className="mb-3 flex items-start">
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

              <div className="flex items-center gap-4">
                <Button size="sm" variant="ghost" className="rounded-full w-8 h-8 p-0 hover:bg-red-100" type="button" onClick={handlePlusClick}>
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
          {!results && !loading && !isThinking && (
            <div className="space-y-3">
              {/* First row - scrolling left */}
              <div className="marquee-container">
                <div className="marquee-content marquee-seamless">
                  {/* First set of suggestions */}
                  {searchSuggestions.map((suggestion, index) => (
                    <Button
                      key={`first-${index}`}
                      variant="outline"
                      className="suggestion-btn rounded-full bg-gray-50 text-gray-700 border-gray-200 px-4 py-2 h-auto text-sm whitespace-nowrap flex-shrink-0"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                  {/* Duplicate set for seamless loop */}
                  {searchSuggestions.map((suggestion, index) => (
                    <Button
                      key={`second-${index}`}
                      variant="outline"
                      className="suggestion-btn rounded-full bg-gray-50 text-gray-700 border-gray-200 px-4 py-2 h-auto text-sm whitespace-nowrap flex-shrink-0"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Second row - scrolling right */}
              <div className="marquee-container">
                <div className="marquee-content marquee-seamless-right">
                  {/* First set of suggestions (reversed order for variety) */}
                  {[...searchSuggestions].reverse().map((suggestion, index) => (
                    <Button
                      key={`right-first-${index}`}
                      variant="outline"
                      className="suggestion-btn rounded-full bg-gray-50 text-gray-700 border-gray-200 px-4 py-2 h-auto text-sm whitespace-nowrap flex-shrink-0"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                  {/* Duplicate set for seamless loop */}
                  {[...searchSuggestions].reverse().map((suggestion, index) => (
                    <Button
                      key={`right-second-${index}`}
                      variant="outline"
                      className="suggestion-btn rounded-full bg-gray-50 text-gray-700 border-gray-200 px-4 py-2 h-auto text-sm whitespace-nowrap flex-shrink-0"
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
            {loading && (
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                  </div>
                  <div className="text-lg text-gray-600">Deploying AI agent{loadingDots}</div>
                </div>
              </div>
            )}
            {isThinking && !loading && (
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                  </div>
                  <div className="text-lg text-gray-600">Thinking...</div>
                </div>
                <div className="text-sm text-gray-500 mt-3 ml-8">Analyzing market data and formulating recommendations</div>
              </div>
            )}
            {isStreaming && !loading && !isThinking && (
              <div className="bg-red-50 rounded-xl p-6 text-gray-900 whitespace-pre-line">
                <div className="mb-4 flex items-center justify-between">
                  <button
                    onClick={handleToggleThinking}
                    className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-red-500" />
                      <span className="font-medium text-red-600">Show thinking</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 text-red-500 ${showFullAnalysis ? 'rotate-180' : ''}`} />
                  </button>
                  <div className="text-sm text-red-600 animate-pulse font-medium">Streaming analysis...</div>
                </div>
                <ReactMarkdown>{results}</ReactMarkdown>
              </div>
            )}
            {results && !isStreaming && !loading && !isThinking && (
              <div className="bg-gray-50 rounded-xl p-6 text-gray-900 whitespace-pre-line">
                <div className="mb-4">
                  <button
                    onClick={handleToggleThinking}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors group"
                  >
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Show thinking</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFullAnalysis ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                <ReactMarkdown>{results}</ReactMarkdown>
                <div className="mt-4 text-xs text-gray-500">Results are generated by AI and are for informational purposes only. For live listings, use a trusted housing platform.</div>
              </div>
            )}
            {imageFile && (
              <div className="mt-2 text-xs text-gray-500">Image selected: {imageFile.name}</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 py-4 text-center bg-white/80 backdrop-blur-sm border-t border-gray-100">
          <p className="text-sm text-gray-500 font-serif">
            By <a href="https://twitter.com/nicholaschen__" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 underline">@nicholaschen__</a> © 2025
          </p>
        </footer>
      </div>
    </div>
  )
}
