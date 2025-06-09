import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

// 1. Map city to Craigslist subdomain (expandable)
const cityMap: Record<string, string> = {
    "New York City": "newyork",
    "San Francisco": "sfbay",
    "Los Angeles": "losangeles",
    "Chicago": "chicago",
    "Houston": "houston",
    "Phoenix": "phoenix",
    "Philadelphia": "philadelphia",
    "San Antonio": "sanantonio",
    "San Diego": "sandiego",
    "Dallas": "dallas",
    "San Jose": "sfbay",
    "Austin": "austin",
    "Jacksonville": "jacksonville",
    "Fort Worth": "dallas",
    "Columbus": "columbus",
    "Charlotte": "charlotte",
    "Indianapolis": "indianapolis",
    "Seattle": "seattle",
    "Denver": "denver",
    "Washington DC": "washingtondc",
    "Boston": "boston",
    "El Paso": "elpaso",
    "Nashville": "nashville",
    "Detroit": "detroit",
    "Oklahoma City": "oklahomacity",
    "Portland": "portland",
    "Las Vegas": "lasvegas",
    "Memphis": "memphis",
    "Louisville": "louisville",
    "Baltimore": "baltimore",
    "Milwaukee": "milwaukee",
    "Albuquerque": "albuquerque",
    "Tucson": "tucson",
    "Fresno": "fresno",
    "Mesa": "phoenix",
    "Sacramento": "sacramento",
    "Atlanta": "atlanta",
    "Kansas City": "kansascity",
    "Colorado Springs": "cosprings",
    "Miami": "miami",
    "Raleigh": "raleigh",
    "Omaha": "omaha",
    "Long Beach": "losangeles",
    "Virginia Beach": "norfolk",
    "Oakland": "sfbay",
    "Minneapolis": "minneapolis",
    "Tulsa": "tulsa",
    "Tampa": "tampa",
    "Arlington": "dallas",
    "New Orleans": "neworleans",
    "Wichita": "wichita",
    "Cleveland": "cleveland",
    "Bakersfield": "bakersfield",
    "Aurora": "denver",
    "Anaheim": "orangecounty",
    "Honolulu": "honolulu",
    "Santa Ana": "orangecounty",
    "Riverside": "inlandempire",
    "Corpus Christi": "corpuschristi",
    "Lexington": "lexington",
    "Stockton": "stockton",
    "Henderson": "lasvegas",
    "Saint Paul": "minneapolis",
    "St. Louis": "stlouis",
    "Cincinnati": "cincinnati",
    "Pittsburgh": "pittsburgh",
    "Greensboro": "greensboro",
    "Anchorage": "anchorage",
    "Plano": "dallas",
    "Lincoln": "lincoln",
    "Orlando": "orlando",
    "Irvine": "orangecounty",
    "Newark": "newjersey",
    "Toledo": "toledo",
    "Durham": "raleigh",
    "Chula Vista": "sandiego",
    "Fort Wayne": "fortwayne",
    "Jersey City": "newjersey",
    "St. Petersburg": "tampa",
    "Laredo": "laredo",
    "Madison": "madison",
    "Chandler": "phoenix",
    "Buffalo": "buffalo",
    "Lubbock": "lubbock",
    "Scottsdale": "phoenix",
    "Reno": "reno",
    "Glendale": "phoenix",
    "Gilbert": "phoenix",
    "Winston–Salem": "winstonsalem",
    "North Las Vegas": "lasvegas",
    "Norfolk": "norfolk",
    "Chesapeake": "norfolk",
    "Garland": "dallas",
    "Irving": "dallas",
    "Hialeah": "miami",
    "Fremont": "sfbay",
    "Boise": "boise",
    "Richmond": "richmond",
    "Baton Rouge": "batonrouge",
    "Spokane": "spokane",
    "Des Moines": "desmoines",
    "Tacoma": "seattle",
    "San Bernardino": "inlandempire",
    "Modesto": "modesto",
    "Fontana": "inlandempire",
    "Santa Clarita": "losangeles",
    "Birmingham": "birmingham",
    "Oxnard": "ventura",
    "Fayetteville": "fayetteville",
    "Moreno Valley": "inlandempire",
    "Rochester": "rochester",
    "Glendale (CA)": "losangeles",
    "Huntington Beach": "orangecounty",
    "Salt Lake City": "saltlakecity",
    "Grand Rapids": "grandrapids",
    "Amarillo": "amarillo",
    "Yonkers": "newyork",
    "Aurora (IL)": "chicago",
    "Montgomery": "montgomery",
    "Akron": "akroncanton",
    "Little Rock": "littlerock",
    "Huntsville": "huntsville",
    "Augusta": "augusta",
    "Port St. Lucie": "treasure",
    "Grand Prairie": "dallas",
    "Columbus (GA)": "columbusga",
    "Tallahassee": "tallahassee",
    "Overland Park": "kansascity",
    "Tempe": "phoenix",
    "McKinney": "dallas",
    "Mobile": "mobile",
    "Cape Coral": "fortmyers",
    "Shreveport": "shreveport",
    "Frisco": "dallas",
    "Knoxville": "knoxville",
    "Worcester": "worcester",
    "Brownsville": "brownsville",
    "Vancouver (WA)": "portland",
    "Fort Lauderdale": "miami",
    "Sioux Falls": "siouxfalls",
    "Ontario (CA)": "inlandempire",
    "Chattanooga": "chattanooga",
    "Providence": "providence",
    "Newport News": "norfolk",
    "Rancho Cucamonga": "inlandempire",
    "Santa Rosa": "sfbay",
    "Oceanside": "sandiego",
    "Salem": "salem",
    "Elk Grove": "sacramento",
    "Garden Grove": "orangecounty",
    "Pembroke Pines": "miami",
    "Peoria": "peoria",
    "Eugene": "eugene",
    "Corona": "inlandempire",
    "Cary": "raleigh",
    "Springfield (MO)": "springfield",
    "Fort Collins": "fortcollins",
    "Jackson": "jackson",
    "Alexandria": "washingtondc",
    "Hayward": "sfbay",
    "Lancaster": "losangeles",
    "Lakewood": "losangeles",
    "Clarksville": "nashville",
    "Palmdale": "losangeles",
    "Salinas": "monterey",
    "Springfield (MA)": "westernmass",
    "Hollywood (FL)": "miami",
    "Pasadena (TX)": "houston",
    "Sunnyvale": "sfbay",
    // Canada
    "Toronto": "toronto",
    "Montreal": "montreal",
    "Vancouver": "vancouver",
    "Calgary": "calgary",
    "Ottawa": "ottawa",
    "Edmonton": "edmonton",
    "Winnipeg": "winnipeg",
    "Quebec City": "quebec",
    "Hamilton": "hamilton",
    "Kitchener": "kitchener",
    "London (ON)": "londonon",
    "Victoria": "victoria",
    "Halifax": "halifax",
    "Oshawa": "toronto",
    "Windsor": "windsor",
    "Saskatoon": "saskatoon",
    "St. Catharines": "stcatharines",
    "Regina": "regina",
    "St. John's": "stjohns",
    "Barrie": "barrie",
    "Kelowna": "kelowna",
    "Brampton": "toronto",
    "Markham": "toronto",
    "Mississauga": "toronto",
    "Surrey": "vancouver",
    "Burnaby": "vancouver",
    "Richmond (BC)": "vancouver"
}

// 2. Scraping tools registry (multi-source)
const scrapingTools = [
    // Craigslist
    async function scrapeCraigslist(city: string, query: string) {
        const craigslistCity = cityMap[city] || "newyork"
        const url = `https://${craigslistCity}.craigslist.org/search/apa?query=${encodeURIComponent(query)}`
        let listings: { title: string, price: string, hood: string, link: string }[] = []
        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            })
            const html = await res.text()
            // Log a snippet of the HTML for debugging
            console.log('[Craigslist HTML]', html.slice(0, 500))
            const $ = cheerio.load(html)
            $('.result-info').each((_: any, el: any) => {
                const title = $(el).find('.result-title').text()
                const price = $(el).find('.result-price').first().text()
                const hood = $(el).find('.result-hood').text()
                const link = $(el).find('.result-title').attr('href') || ''
                listings.push({ title, price, hood, link })
            })
        } catch (err) {
            console.log('[Craigslist Scraper Error]', err)
        }
        return listings
    },
    // Kijiji (placeholder, returns empty array for now)
    async function scrapeKijiji(city: string, query: string) {
        // TODO: Implement real Kijiji scraping logic
        // For now, just return empty
        return []
    },
    // Add more scraping tools here (e.g., Zumper, Facebook Marketplace, etc.)
]

// 3. Generate a prompt for Gemini
function generateGeminiPrompt(query: string, city: string, listings: { title: string, price: string, hood: string, link: string }[]) {
    return `You are a helpful AI housing assistant. Here are some live listings for "${query}" in ${city} (from multiple sources):\n\n${listings.slice(0, 15).map(l => `- ${l.title} (${l.price}) ${l.hood} [View Listing](${l.link})`).join('\n')}\n\nSummarize the best options, give tips, and highlight anything notable. Do NOT make up listings.`
}

// 4. Call Gemini API
async function callGemini(apiKey: string, prompt: string) {
    try {
        const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        })
        const geminiData = await geminiRes.json()
        return geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No results found.'
    } catch (err) {
        throw new Error('Error contacting Gemini API.')
    }
}

// 5. (Optional) Memory placeholder (for future DB/vector DB)
// function storeUserQuery(userId, query, listings, summary) { ... }

// 6. Agent Orchestration (multi-source aggregation)
export async function POST(req: NextRequest) {
    const { query, city } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY

    let allListings: { title: string, price: string, hood: string, link: string }[] = []
    let toolResults: Record<string, number> = {}

    // Run all scraping tools and aggregate results
    for (const tool of scrapingTools) {
        const listings = await tool(city, query)
        toolResults[tool.name || 'anonymous'] = listings.length
        allListings = allListings.concat(listings)
    }

    // Deduplicate listings by title+price+hood
    const seen = new Set()
    const dedupedListings = allListings.filter(l => {
        const key = `${l.title}|${l.price}|${l.hood}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })

    if (!dedupedListings || dedupedListings.length === 0) {
        return NextResponse.json({ result: 'No listings found across all sources. Try a different city or search term.' })
    }

    // Step 2: Generate prompt
    const prompt = generateGeminiPrompt(query, city, dedupedListings)
    // Step 3: Call Gemini
    try {
        const result = await callGemini(apiKey!, prompt)
        return NextResponse.json({ result, toolResults })
    } catch (err: any) {
        return NextResponse.json({ result: err.message || 'Unknown error.' }, { status: 500 })
    }
} 