// lib/reviews.ts
// All review-related data helpers for Zolarux

import { createClient } from '@/lib/supabase/client';

export interface Review {
  id: string;
  order_id: string;
  vendor_id: string;
  buyer_id: string;
  listing_id?: string;
  listing_title?: string;
  rating: number;
  comment?: string;
  vendor_reply?: string;
  vendor_replied_at?: string;
  status: 'published' | 'hidden' | 'flagged';
  created_at: string;
  updated_at: string;
  // joined
  buyer_name?: string;
  buyer_avatar?: string;
}

export interface ReviewStats {
  avg_rating: number;
  review_count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>; // count per star
}

export interface SubmitReviewPayload {
  order_id: string;
  vendor_id: string;
  buyer_id: string;
  listing_id?: string;
  listing_title?: string;
  rating: number;
  comment?: string;
}

// ----------------------------------------------------------------
// Check if a completed order already has a review
// ----------------------------------------------------------------
export async function hasReviewForOrder(orderId: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from('reviews')
    .select('id')
    .eq('order_id', orderId)
    .maybeSingle();
  return !!data;
}

// ----------------------------------------------------------------
// Submit a new review (buyer)
// ----------------------------------------------------------------
export async function submitReview(payload: SubmitReviewPayload): Promise<Review> {
  const supabase = createClient();

  // Guard: order must be completed and belong to buyer
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id, status, buyer_id')
    .eq('id', payload.order_id)
    .single();

  if (orderErr || !order) throw new Error('Order not found.');
  if (order.status !== 'completed') throw new Error('You can only review a completed order.');
  if (order.buyer_id !== payload.buyer_id) throw new Error('This is not your order.');

  // Guard: no duplicate review
  const exists = await hasReviewForOrder(payload.order_id);
  if (exists) throw new Error('You have already reviewed this order.');

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      order_id: payload.order_id,
      vendor_id: payload.vendor_id,
      buyer_id: payload.buyer_id,
      listing_id: payload.listing_id ?? null,
      listing_title: payload.listing_title ?? null,
      rating: payload.rating,
      comment: payload.comment?.trim() || null,
      status: 'published',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Review;
}

// ----------------------------------------------------------------
// Vendor submits / updates their reply
// ----------------------------------------------------------------
export async function submitVendorReply(
  reviewId: string,
  vendorId: string,
  reply: string,
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('reviews')
    .update({
      vendor_reply: reply.trim(),
      vendor_replied_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .eq('vendor_id', vendorId);

  if (error) throw new Error(error.message);
}

// ----------------------------------------------------------------
// Fetch paginated reviews for a vendor (public profile)
// ----------------------------------------------------------------
export async function fetchVendorReviews(
  vendorId: string,
  page = 0,
  pageSize = 10,
): Promise<{ reviews: Review[]; total: number }> {
  const supabase = createClient();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('reviews')
    .select('*', { count: 'exact' })
    .eq('vendor_id', vendorId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { reviews: (data ?? []) as Review[], total: count ?? 0 };
}

// ----------------------------------------------------------------
// Fetch rating stats for a vendor
// ----------------------------------------------------------------
export async function fetchVendorRatingStats(vendorId: string): Promise<ReviewStats> {
  const supabase = createClient();

  // Get vendor's stored aggregates
  const { data: vendor } = await supabase
    .from('vendors')
    .select('avg_rating, review_count')
    .eq('vendor_id', vendorId)
    .single();

  // Get star distribution
  const { data: dist } = await supabase
    .from('reviews')
    .select('rating')
    .eq('vendor_id', vendorId)
    .eq('status', 'published');

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  (dist ?? []).forEach((r: { rating: number }) => {
    distribution[r.rating] = (distribution[r.rating] ?? 0) + 1;
  });

  return {
    avg_rating: vendor?.avg_rating ?? 0,
    review_count: vendor?.review_count ?? 0,
    distribution: distribution as Record<1 | 2 | 3 | 4 | 5, number>,
  };
}

// ----------------------------------------------------------------
// Fetch recent reviews for vendor dashboard widget
// ----------------------------------------------------------------
export async function fetchVendorDashboardReviews(vendorId: string, limit = 5): Promise<Review[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as Review[];
}

// ----------------------------------------------------------------
// Fetch buyer's reviewable (completed, unreviewed) orders
// ----------------------------------------------------------------
export async function fetchReviewableOrders(buyerId: string) {
  const supabase = createClient();
  await supabase.auth.getSession(); // wait for session to resolve

  const { data: completedOrders, error } = await supabase
    .from('orders')
    .select('id, vendor_id, amount, created_at, product_name, product_id')
    .eq('buyer_id', buyerId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  // Filter out already reviewed
  const { data: reviewed } = await supabase
    .from('reviews')
    .select('order_id')
    .eq('buyer_id', buyerId);

  const reviewedOrderIds = new Set((reviewed ?? []).map((r: { order_id: string }) => r.order_id));

  return (completedOrders ?? [])
    .filter((o: { id: string }) => !reviewedOrderIds.has(o.id))
    .map((o: any) => ({
      id: o.id,
      vendor_id: o.vendor_id,
      amount: o.amount,
      created_at: o.created_at,
      listing_title: o.product_name,
      listing_id: o.product_id,
    }));
}

// ----------------------------------------------------------------
// Fetch a buyer's submitted reviews
// ----------------------------------------------------------------
export async function fetchBuyerReviews(buyerId: string): Promise<Review[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Review[];
}

// ----------------------------------------------------------------
// Format helpers
// ----------------------------------------------------------------
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function getRatingLabel(rating: number): string {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 4.0) return 'Very Good';
  if (rating >= 3.0) return 'Good';
  if (rating >= 2.0) return 'Fair';
  return 'Poor';
}