import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

// 1. Map city to Craigslist subdomain (expandable)
const cityMap: Record<string, string> = {
    "New York City": "newyork",
    "San Francisco": "sfbay",
    "Toronto": "toronto",
    "Vancouver": "vancouver",
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
    "Montreal": "montreal",
    "Calgary": "calgary",
    "Ottawa": "ottawa",
    "Edmonton": "edmonton",
    "Winnipeg": "winnipeg",
    "Quebec City": "quebec",
    "San Diego": "sandiego",
    "Phoenix": "phoenix",
    "San Jose": "sanjose",
    "Denver": "denver",
    "Portland": "portland",
    "Minneapolis": "minneapolis",
    "Detroit": "detroit",
    "Baltimore": "baltimore",
    "Charlotte": "charlotte",
    "Orlando": "orlando",
    "Las Vegas": "lasvegas",
    "Nashville": "nashville",
    "Mountain View": "sfbay",
    "Sunnyvale": "sfbay",
    "Brampton": "toronto",
    "Markham": "toronto"
    // Add more as needed
}

// 2. Scrape Craigslist for listings
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
        const $ = cheerio.load(html)
        $('.result-info').each((_: any, el: any) => {
            const title = $(el).find('.result-title').text()
            const price = $(el).find('.result-price').first().text()
            const hood = $(el).find('.result-hood').text()
            const link = $(el).find('.result-title').attr('href') || ''
            listings.push({ title, price, hood, link })
        })
    } catch (err) {
        throw new Error('Error scraping listings.')
    }
    return listings
}

// 3. Generate a prompt for Gemini
function generateGeminiPrompt(query: string, city: string, listings: { title: string, price: string, hood: string, link: string }[]) {
    return `You are a helpful AI housing assistant. Here are some live listings for "${query}" in ${city} (from Craigslist):\n\n${listings.slice(0, 10).map(l => `- ${l.title} (${l.price}) ${l.hood} [View Listing](${l.link})`).join('\n')}\n\nSummarize the best options, give tips, and highlight anything notable. Do NOT make up listings.`
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

// 5. Agent Orchestration
export async function POST(req: NextRequest) {
    const { query, city } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY

    try {
        // Step 1: Scrape listings
        const listings = await scrapeCraigslist(city, query)
        // Step 2: Generate prompt
        const prompt = generateGeminiPrompt(query, city, listings)
        // Step 3: Call Gemini
        const result = await callGemini(apiKey!, prompt)
        return NextResponse.json({ result })
    } catch (err: any) {
        return NextResponse.json({ result: err.message || 'Unknown error.' }, { status: 500 })
    }
} 