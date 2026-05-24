import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = 'https://zolarux.com.ng'
const KEY = 'e3f724b193be4d85922d843d514366b5'
const KEY_LOCATION = `${BASE_URL}/${KEY}.txt`

export async function POST(request: Request) {
  // Optional security: check a secret token to prevent spam
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const cronSecret = process.env.CRON_SECRET || 'zolarux-indexnow-secret-2026'
  
  if (token !== cronSecret) {
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
