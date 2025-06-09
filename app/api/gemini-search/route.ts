import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { cityMap } from '../cityMap'

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
    // US Census ACS API tool for housing analytics
    async function censusAcsTool(city: string, query: string) {
        const apiKey = process.env.CENSUS_API_KEY;
        // This example fetches median gross rent (B25064) and median contract rent (B25058) for all places in NY (state:36)
        // You may want to map city names to FIPS codes for more accuracy
        // For demo, we'll use NY state and filter for the city name in the results
        const url = `https://api.census.gov/data/2022/acs/acs5?get=NAME,B25064,B25058&for=place:*&in=state:*&key=${apiKey}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (!Array.isArray(data) || data.length < 2) return [];
            // Find the row for the selected city
            const headers = data[0];
            const rows = data.slice(1);
            const cityRow = rows.find((row: string[]) => row[0].toLowerCase().includes(city.toLowerCase()));
            if (!cityRow) return [];
            // Map to standard listing format (as analytics, not a live listing)
            return [{
                title: `Census ACS Housing Analytics for ${cityRow[0]}`,
                price: `Median Gross Rent: $${cityRow[1]}, Median Contract Rent: $${cityRow[2]}`,
                hood: cityRow[0],
                link: 'https://www.census.gov/data/developers/data-sets/acs-5year.html'
            }];
        } catch (err) {
            console.log('[Census ACS API Error]', err);
            return [];
        }
    },
    // CMHC Open Data API tool for Canadian housing analytics
    async function cmhcTool(city: string, query: string) {
        // CMHC Open Data API does not require an API key for most endpoints
        // We'll use the "Average Rents" dataset as an example
        // Docs: https://cmhc-schl-open-data-api.readme.io/
        const url = `https://cmhc.rapi.com/prod/v1/average-rents?city=${encodeURIComponent(city)}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (!data || !Array.isArray(data.data) || data.data.length === 0) return [];
            // Find the most recent data for the city
            const cityData = data.data[0];
            // Map to standard listing format (as analytics, not a live listing)
            return [{
                title: `CMHC Housing Analytics for ${cityData.city}`,
                price: `Average Rent: $${cityData.average_rent}, Vacancy Rate: ${cityData.vacancy_rate}%`,
                hood: cityData.city,
                link: 'https://www.cmhc-schl.gc.ca/en/professionals/housing-markets-data-and-research/housing-data/open-data'
            }];
        } catch (err) {
            console.log('[CMHC API Error]', err);
            return [];
        }
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