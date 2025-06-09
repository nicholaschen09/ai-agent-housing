import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(req: NextRequest) {
    const { query, city } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY

    // Map city to Craigslist subdomain
    const cityMap: Record<string, string> = {
        "New York City": "newyork",
        "San Francisco": "sfbay",
        "Toronto": "toronto",
        "Vancouver": "vancouver"
    }
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
        console.log(`Craigslist listings found: ${listings.length}`)
    } catch (err) {
        return NextResponse.json({ result: 'Error scraping listings.' }, { status: 500 })
    }

    // Summarize with Gemini
    const prompt = `You are a helpful AI housing assistant. Here are some live listings for "${query}" in ${city} (from Craigslist):\n\n${listings.slice(0, 10).map(l => `- ${l.title} (${l.price}) ${l.hood} [View Listing](${l.link})`).join('\n')}\n\nSummarize the best options, give tips, and highlight anything notable. Do NOT make up listings.`
    try {
        const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        })
        const geminiData = await geminiRes.json()
        const result = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No results found.'
        return NextResponse.json({ result })
    } catch (err) {
        return NextResponse.json({ result: 'Error contacting Gemini API.' }, { status: 500 })
    }
} 