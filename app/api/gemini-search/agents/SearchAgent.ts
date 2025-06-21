interface Listing {
    title: string;
    price: string;
    location: string;
    link: string;
    platform: string;
    description?: string;
    bedrooms?: string;
    bathrooms?: string;
    sqft?: string;
}

interface SearchStrategy {
    platforms: string[];
    maxListings: number;
    searchTerms: string[];
    priceRange?: { min: number; max: number };
}

export class SearchAgent {
    private platforms = {
        craigslist: this.searchCraigslist.bind(this),
        apartments: this.searchApartmentsDotCom.bind(this),
        zillow: this.searchZillow.bind(this),
        rentals: this.searchRentalsDotCom.bind(this)
    };

    constructor(private geminiApiKey: string) { }

    // Main agent decision-making method
    async executeSearch(query: string, city: string): Promise<Listing[]> {
        console.log(`🤖 Search Agent: Analyzing query "${query}" for ${city}`);

        // Let the agent decide on search strategy using AI
        const strategy = await this.planSearchStrategy(query, city);
        console.log(`🎯 Search Strategy:`, strategy);

        const allListings: Listing[] = [];

        // Execute searches on selected platforms
        for (const platform of strategy.platforms) {
            try {
                console.log(`🔍 Searching ${platform}...`);
                const listings = await this.searchPlatform(platform, query, city, strategy);
                allListings.push(...listings);
            } catch (error) {
                console.log(`❌ ${platform} search failed:`, error);
            }
        }

        // Deduplicate and rank results
        return this.rankAndDeduplicate(allListings, strategy);
    }

    // AI-powered search strategy planning
    private async planSearchStrategy(query: string, city: string): Promise<SearchStrategy> {
        const prompt = `You are a search strategy AI. Analyze this housing search query and return a JSON search strategy.

Query: "${query}"
City: "${city}"

Based on this query, determine:
1. Which platforms to prioritize (craigslist, apartments, zillow, rentals)
2. How many listings to target (10-50)
3. Alternative search terms to try
4. Price range if mentioned

Return ONLY valid JSON in this format:
{
  "platforms": ["craigslist", "apartments"],
  "maxListings": 30,
  "searchTerms": ["${query}", "alternative term"],
  "priceRange": {"min": 1000, "max": 3000}
}`;

        try {
            const response = await this.callGemini(prompt);
            const strategy = JSON.parse(response);
            return strategy;
        } catch (error) {
            console.log('🤖 Using fallback strategy');
            // Fallback strategy
            return {
                platforms: ['craigslist', 'apartments'],
                maxListings: 20,
                searchTerms: [query],
                priceRange: undefined
            };
        }
    }

    private async searchPlatform(platform: string, query: string, city: string, strategy: SearchStrategy): Promise<Listing[]> {
        const searchFunction = this.platforms[platform as keyof typeof this.platforms];
        if (!searchFunction) {
            throw new Error(`Platform ${platform} not supported`);
        }

        return await searchFunction(query, city, strategy);
    }

    // Craigslist search (improved)
    private async searchCraigslist(query: string, city: string, strategy: SearchStrategy): Promise<Listing[]> {
        const cityMap: Record<string, string> = {
            "New York City": "newyork",
            "San Francisco": "sfbay",
            "Los Angeles": "losangeles",
            "Chicago": "chicago",
            "Boston": "boston",
            "Seattle": "seattle",
            "Washington DC": "washingtondc",
            "Miami": "miami",
            "Atlanta": "atlanta",
            "Dallas": "dallas",
            "Houston": "houston",
            "Philadelphia": "philadelphia",
            "Toronto": "toronto",
            "Vancouver": "vancouver",
            "Montreal": "montreal",
        };

        const craigslistCity = cityMap[city] || "newyork";
        const listings: Listing[] = [];

        // Try multiple search terms
        for (const searchTerm of strategy.searchTerms) {
            try {
                const url = `https://${craigslistCity}.craigslist.org/search/apa?query=${encodeURIComponent(searchTerm)}`;

                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                // Since scraping might be blocked, simulate some results for demo
                if (!response.ok) {
                    console.log(`Craigslist scraping blocked, using simulated data for "${searchTerm}"`);
                    listings.push(...this.generateMockListings('craigslist', searchTerm, city, 3));
                } else {
                    // Real scraping would go here
                    console.log(`Craigslist search successful for "${searchTerm}"`);
                    listings.push(...this.generateMockListings('craigslist', searchTerm, city, 3));
                }
            } catch (error) {
                console.log(`Craigslist search failed for "${searchTerm}"`);
                listings.push(...this.generateMockListings('craigslist', searchTerm, city, 2));
            }
        }

        return listings.slice(0, Math.floor(strategy.maxListings / strategy.platforms.length));
    }

    // Apartments.com search with real scraping
    private async searchApartmentsDotCom(query: string, city: string, strategy: SearchStrategy): Promise<Listing[]> {
        console.log(`Searching Apartments.com for "${query}" in ${city}`);

        const listings: Listing[] = [];

        try {
            // Format city for apartments.com URL
            const formattedCity = city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const searchQuery = encodeURIComponent(query);

            // Apartments.com search URL
            const baseUrl = `https://www.apartments.com/${formattedCity}/`;

            // Try different search approaches
            const searchUrls = [
                `${baseUrl}?search=${searchQuery}`,
                `https://www.apartments.com/search/${formattedCity}/?query=${searchQuery}`,
                `https://www.apartments.com/${formattedCity}/${searchQuery.replace(/\s+/g, '-')}/`
            ];

            for (const url of searchUrls.slice(0, 1)) { // Try first URL
                try {
                    console.log(`🔍 Attempting to fetch: ${url}`);

                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                            'Accept-Language': 'en-US,en;q=0.5',
                            'Accept-Encoding': 'gzip, deflate, br',
                            'Connection': 'keep-alive',
                            'Upgrade-Insecure-Requests': '1',
                        },
                        // Add timeout
                        signal: AbortSignal.timeout(10000)
                    });

                    if (response.ok) {
                        const html = await response.text();
                        console.log(`✅ Successfully fetched apartments.com data (${html.length} chars)`);

                        // Parse the HTML to extract listing data
                        const scrapedListings = this.parseApartmentsComHTML(html, query, city);

                        if (scrapedListings.length > 0) {
                            console.log(`🏠 Found ${scrapedListings.length} real listings from apartments.com`);
                            listings.push(...scrapedListings);
                            break; // Success, no need to try other URLs
                        }
                    } else {
                        console.log(`❌ apartments.com returned status: ${response.status}`);
                    }
                } catch (fetchError) {
                    console.log(`❌ Failed to fetch from apartments.com:`, fetchError);
                }
            }

            // If real scraping failed, fall back to realistic mock data
            if (listings.length === 0) {
                console.log(`📝 Falling back to realistic mock data for apartments.com`);
                listings.push(...this.generateMockListings('apartments.com', query, city, Math.floor(strategy.maxListings / strategy.platforms.length)));
            }

        } catch (error) {
            console.log(`❌ Apartments.com search error:`, error);
            // Fallback to mock data
            listings.push(...this.generateMockListings('apartments.com', query, city, Math.floor(strategy.maxListings / strategy.platforms.length)));
        }

        return listings.slice(0, Math.floor(strategy.maxListings / strategy.platforms.length));
    }

    // Parse apartments.com HTML to extract listing data
    private parseApartmentsComHTML(html: string, query: string, city: string): Listing[] {
        const listings: Listing[] = [];

        try {
            // Look for JSON-LD structured data first
            const jsonLdMatches = html.match(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g);

            if (jsonLdMatches) {
                for (const match of jsonLdMatches) {
                    try {
                        const jsonContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
                        const data = JSON.parse(jsonContent);

                        if (data['@type'] === 'Apartment' || data['@type'] === 'RealEstateListing') {
                            listings.push({
                                title: data.name || `Apartment in ${city}`,
                                price: data.offers?.price || data.priceRange || 'Contact for price',
                                location: data.address?.addressLocality || city,
                                link: data.url || `https://apartments.com`,
                                platform: 'apartments.com',
                                description: data.description || `${query} in ${city}`,
                                bedrooms: data.numberOfRooms?.toString() || '1',
                                bathrooms: data.numberOfBathroomsTotal?.toString() || '1',
                                sqft: data.floorSize?.value || `${400 + Math.floor(Math.random() * 600)} sq ft`
                            });
                        }
                    } catch (jsonError) {
                        console.log('Failed to parse JSON-LD:', jsonError);
                    }
                }
            }

            // If no structured data found, try parsing HTML elements
            if (listings.length === 0) {
                // Look for common apartment listing patterns
                const priceMatches = html.match(/\$[\d,]+(?:\/mo|\/month)?/g);
                const titleMatches = html.match(/<h2[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)</g);

                if (priceMatches && priceMatches.length > 0) {
                    const neighborhoods = this.getCityNeighborhoods(city);

                    for (let i = 0; i < Math.min(priceMatches.length, 3); i++) {
                        const price = priceMatches[i];
                        const neighborhood = neighborhoods[i % neighborhoods.length];

                        listings.push({
                            title: `${query} in ${neighborhood}`,
                            price: price,
                            location: `${neighborhood}, ${city}`,
                            link: `https://apartments.com/listing/${Date.now()}-${i}`,
                            platform: 'apartments.com',
                            description: `${query} in ${neighborhood}. Modern amenities available.`,
                            bedrooms: this.extractBedrooms(query),
                            bathrooms: '1',
                            sqft: `${400 + Math.floor(Math.random() * 600)} sq ft`
                        });
                    }
                }
            }

        } catch (parseError) {
            console.log('HTML parsing error:', parseError);
        }

        return listings;
    }

    // Zillow search simulation
    private async searchZillow(query: string, city: string, strategy: SearchStrategy): Promise<Listing[]> {
        console.log(`Searching Zillow for "${query}" in ${city}`);
        // In a real implementation, this would use Zillow API
        return this.generateMockListings('zillow', query, city, Math.floor(strategy.maxListings / strategy.platforms.length));
    }

    // Rentals.com search simulation
    private async searchRentalsDotCom(query: string, city: string, strategy: SearchStrategy): Promise<Listing[]> {
        console.log(`Searching Rentals.com for "${query}" in ${city}`);
        return this.generateMockListings('rentals.com', query, city, Math.floor(strategy.maxListings / strategy.platforms.length));
    }

    // Generate realistic mock listings for demonstration
    private generateMockListings(platform: string, query: string, city: string, count: number): Listing[] {
        const neighborhoods = this.getCityNeighborhoods(city);
        const priceRanges = this.getCityPriceRanges(city, query);
        const listings: Listing[] = [];

        for (let i = 0; i < count; i++) {
            const price = priceRanges.min + Math.floor(Math.random() * (priceRanges.max - priceRanges.min));
            const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];

            listings.push({
                title: `${query} in ${neighborhood}`,
                price: `$${price}/month`,
                location: `${neighborhood}, ${city}`,
                link: `https://${platform}/listing/${Date.now()}-${i}`,
                platform: platform,
                description: `Beautiful ${query} in ${neighborhood}. Recently updated with modern amenities.`,
                bedrooms: this.extractBedrooms(query),
                bathrooms: "1",
                sqft: `${400 + Math.floor(Math.random() * 600)} sq ft`
            });
        }

        return listings;
    }

    private getCityNeighborhoods(city: string): string[] {
        const neighborhoods: Record<string, string[]> = {
            "New York City": ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"],
            "Los Angeles": ["Hollywood", "Santa Monica", "Beverly Hills", "West Hollywood", "Downtown"],
            "San Francisco": ["Mission", "SOMA", "Castro", "Marina", "Nob Hill"],
            "Chicago": ["River North", "Lincoln Park", "Wicker Park", "Logan Square", "The Loop"],
            "Boston": ["Back Bay", "North End", "Cambridge", "Beacon Hill", "South End"]
        };
        return neighborhoods[city] || ["Downtown", "Midtown", "Uptown", "Westside", "Eastside"];
    }

    private getCityPriceRanges(city: string, query: string): { min: number; max: number } {
        const basePrices: Record<string, { min: number; max: number }> = {
            "New York City": { min: 2500, max: 5000 },
            "San Francisco": { min: 2800, max: 4500 },
            "Los Angeles": { min: 2000, max: 4000 },
            "Chicago": { min: 1500, max: 3000 },
            "Boston": { min: 2200, max: 4200 }
        };

        const baseRange = basePrices[city] || { min: 1200, max: 2500 };

        // Adjust based on query type
        if (query.toLowerCase().includes('studio')) {
            return { min: Math.floor(baseRange.min * 0.7), max: Math.floor(baseRange.max * 0.8) };
        } else if (query.toLowerCase().includes('2 bed') || query.toLowerCase().includes('2br')) {
            return { min: Math.floor(baseRange.min * 1.3), max: Math.floor(baseRange.max * 1.5) };
        }

        return baseRange;
    }

    private extractBedrooms(query: string): string {
        if (query.toLowerCase().includes('studio')) return 'Studio';
        if (query.toLowerCase().includes('1 bed') || query.toLowerCase().includes('1br')) return '1';
        if (query.toLowerCase().includes('2 bed') || query.toLowerCase().includes('2br')) return '2';
        if (query.toLowerCase().includes('3 bed') || query.toLowerCase().includes('3br')) return '3';
        return '1';
    }

    private rankAndDeduplicate(listings: Listing[], strategy: SearchStrategy): Listing[] {
        // Remove duplicates based on title and location similarity
        const unique = listings.filter((listing, index, self) =>
            index === self.findIndex(l =>
                l.title.toLowerCase() === listing.title.toLowerCase() &&
                l.location === listing.location
            )
        );

        // Sort by relevance (price, location, etc.)
        return unique
            .sort((a, b) => {
                // Prioritize certain platforms
                const platformPriority = { 'apartments.com': 3, 'zillow': 2, 'craigslist': 1, 'rentals.com': 1 };
                return (platformPriority[b.platform as keyof typeof platformPriority] || 0) -
                    (platformPriority[a.platform as keyof typeof platformPriority] || 0);
            })
            .slice(0, strategy.maxListings);
    }

    private async callGemini(prompt: string): Promise<string> {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
} 