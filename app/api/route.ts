import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { cityMap } from './cityMap'

// 1. Map city to Craigslist subdomain (expandable)

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