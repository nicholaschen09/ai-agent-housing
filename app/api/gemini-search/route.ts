import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { SearchAgent } from './agents/SearchAgent'

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

// 3. Generate a prompt for Gemini with SearchAgent listings
function generateGeminiPrompt(query: string, city: string, listings: any[]) {
    if (listings.length === 0) {
        return `You are an expert housing analyst with 20+ years of experience in ${city}. A user is searching for "${query}" in ${city}. 

**CRITICAL INSTRUCTIONS**: 
- Give SPECIFIC, actionable recommendations
- NO generic advice
- Provide EXACT neighborhoods, price ranges, and concrete steps
- Be definitive in your conclusions

Structure your response as:

## **Analysis Process**
[Analyze the ${city} market for "${query}" - current conditions, typical pricing, best areas]

## **My Definitive Recommendations**

You MUST provide:

1. **EXACT NEIGHBORHOODS**: Name 3-5 specific areas in ${city} perfect for "${query}" with typical price ranges
2. **SPECIFIC BUDGET EXPECTATIONS**: Tell them exactly what they'll pay for different unit types
3. **BEST SEARCH PLATFORMS**: Which specific websites/apps to use and how often to check
4. **IMMEDIATE ACTION PLAN**: 5 concrete steps to take this week

Based on your expertise in ${city}, provide:
- Exact price ranges for "${query}" in different neighborhoods
- Specific buildings or complexes known for this type of housing
- Best times of year/month to search
- Exact search strategies that work in ${city}

NO GENERIC ADVICE. Give specific expert guidance as their personal ${city} housing consultant.`
    }

    return `You are an expert housing analyst with 20+ years of experience. I found ${listings.length} listings across multiple platforms for "${query}" in ${city}:

${listings.slice(0, 15).map(l => `**${l.title}** - ${l.price}
Location: ${l.location} | Platform: ${l.platform}
${l.bedrooms} bed, ${l.bathrooms} bath | ${l.sqft}
${l.description}
[View Listing](${l.link})
`).join('\n')}

**CRITICAL INSTRUCTIONS**: 
- You MUST give specific, actionable recommendations
- NO generic advice like "expand your search" or "verify listings"
- Give EXACT neighborhoods, price ranges, and concrete next steps
- Be definitive in your conclusions

Structure your response as:

## **Market Analysis Process**
[Step-by-step analysis: price trends, best value areas, market conditions]

## **My Definitive Recommendations**

You MUST provide:

1. **EXACT ACTION PLAN**: Which specific listings to pursue first and why
2. **SPECIFIC NEIGHBORHOODS**: Name exact areas in ${city} to focus on with price ranges
3. **DEFINITIVE BUDGET GUIDANCE**: Tell them exactly what to expect to pay and for what type of unit
4. **IMMEDIATE NEXT STEPS**: Specific actions to take this week (not generic advice)

Based on this data, give me your expert opinion on:
- Which of these listings represents the best value and why
- Exact neighborhoods to prioritize for "${query}" searches
- Specific price expectations they should have
- Concrete action steps for the next 7 days

NO GENERIC ADVICE. Give specific, expert recommendations as if you're their personal housing consultant.`
}

// 4. Call Gemini API
async function callGemini(apiKey: string, prompt: string) {
    try {
        console.log('Calling Gemini with prompt preview:', prompt.substring(0, 100) + '...')

        const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        })

        console.log('Gemini response status:', geminiRes.status)

        if (!geminiRes.ok) {
            const errorText = await geminiRes.text()
            console.error('Gemini API error:', errorText)
            throw new Error(`Gemini API error: ${geminiRes.status}`)
        }

        const geminiData = await geminiRes.json()
        console.log('Gemini response data:', JSON.stringify(geminiData, null, 2))

        const result = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No results found.'
        console.log('Final result from Gemini:', result.substring(0, 100) + '...')

        return result
    } catch (err) {
        console.error('Error in callGemini:', err)
        throw new Error('Error contacting Gemini API.')
    }
}

// 5. Agent Orchestration
export async function POST(req: NextRequest) {
    const { query, city } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY

    console.log('API Key present:', !!apiKey, 'Key preview:', apiKey?.substring(0, 10) + '...')

    // If no API key, provide a helpful mock response
    if (!apiKey || apiKey === 'your_api_key_here') {
        console.log('Using mock response - no valid API key')
        const mockResult = `**Housing Search Results for "${query}" in ${city}**

🏠 **Available Options:**
- **1BR Studio Apartment** - $1,800/month - Downtown area, close to transit
- **2BR Modern Apartment** - $2,400/month - Recently renovated, in-unit laundry
- **Studio Loft** - $1,600/month - Exposed brick, great natural light
- **1BR Garden Apartment** - $1,950/month - Ground floor, small patio

💡 **Tips for your search:**
- Consider looking at different neighborhoods for better value
- Many listings update daily, so check back frequently
- Look for "no-fee" apartments to save on broker costs
- Consider transit proximity for daily commuting

🎯 **Best Match:** The 1BR Studio appears to offer good value in a central location.

*Note: To get real live listings, please configure your Gemini API key in the .env.local file.*`

        return NextResponse.json({ result: mockResult })
    }

    try {
        console.log('Initializing Search Agent for:', query, 'in', city)

        // Step 1: Initialize Search Agent
        const searchAgent = new SearchAgent(apiKey!)

        // Step 2: Execute intelligent multi-platform search
        const listings = await searchAgent.executeSearch(query, city)
        console.log(`Search Agent found ${listings.length} listings across multiple platforms`)

        // Step 3: Generate enhanced prompt with agent results
        const prompt = generateGeminiPrompt(query, city, listings)
        console.log('Generated enhanced prompt length:', prompt.length)

        // Step 4: Call Gemini for analysis
        console.log('Calling Gemini for market analysis...')
        const result = await callGemini(apiKey!, prompt)
        console.log('Gemini analysis complete, length:', result.length)

        return NextResponse.json({ result, streaming: true })
    } catch (err: any) {
        console.error('Error in AI Agent system:', err)
        return NextResponse.json({ result: err.message || 'Unknown error.' }, { status: 500 })
    }
} 