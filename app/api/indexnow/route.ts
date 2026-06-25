import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = 'https://zolarux.com.ng'
const KEY = 'e3f724b193be4d85922d843d514366b5'
const KEY_LOCATION = `${BASE_URL}/${KEY}.txt`

export async function GET(request: Request) {
  return handleRequest(request)
}

export async function POST(request: Request) {
  return handleRequest(request)
}

async function handleRequest(request: Request) {
  // Verify the cron secret from the Authorization header.
  // Vercel sends: Authorization: Bearer <CRON_SECRET>
  // Set CRON_SECRET in your Vercel project environment variables.
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('CRON_SECRET env var is not set')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token || token !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createClient()

    // 1. Static Core URL list
    const urls: string[] = [
      `${BASE_URL}/`,
      `${BASE_URL}/listings`,
      `${BASE_URL}/check-vendor`,
      `${BASE_URL}/check-device`,
      `${BASE_URL}/check-original`,
      `${BASE_URL}/scan-link`,
      `${BASE_URL}/report-item`,
      `${BASE_URL}/verified-vendors`,
      `${BASE_URL}/about`,
      `${BASE_URL}/blog`,
      `${BASE_URL}/downloads`,
      `${BASE_URL}/faq`,
    ]

    // 2. Fetch blog posts
    const { data: blogs } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('is_published', true)
    
    if (blogs) {
      blogs.forEach(b => urls.push(`${BASE_URL}/blog/${b.slug}`))
    }

    // 3. Fetch recent products
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(100) // Submit top 100 listings

    if (products) {
      products.forEach(p => urls.push(`${BASE_URL}/listings/${p.id}`))
    }

    // 4. Send request to IndexNow
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        host: 'zolarux.com.ng',
        key: KEY,
        keyLocation: KEY_LOCATION,
        urlList: urls
      })
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({ error: `IndexNow API error: ${text}` }, { status: response.status })
    }

    return NextResponse.json({ success: true, urlsSubmitted: urls.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
