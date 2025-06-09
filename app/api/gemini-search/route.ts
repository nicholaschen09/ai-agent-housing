import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    const { query, city } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        return NextResponse.json({ result: 'Missing Gemini API key.' }, { status: 500 })
    }
    const prompt = `You are a helpful AI housing assistant. Find housing or rental options in ${city} based on this search: "${query}". Return a concise, helpful answer.`
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