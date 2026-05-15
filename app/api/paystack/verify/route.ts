import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 })
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 })
    }

    // Verify with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()

    if (!response.ok || !data.status) {
      return NextResponse.json({ error: 'Verification failed', details: data }, { status: 400 })
    }

    const transaction = data.data

    return NextResponse.json({
      success: true,
      verified: transaction.status === 'success',
      amount: transaction.amount / 100, // Paystack returns kobo
      reference: transaction.reference,
      customer: transaction.customer,
      metadata: transaction.metadata,
    })

  } catch (error) {
    console.error('Paystack verify error:', error)
    return NextResponse.json({ error: 'Verification error' }, { status: 500 })
  }
}