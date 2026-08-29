export type ReviewRating = 1 | 2 | 3 | 4 | 5

export interface Review {
  id: string
  rating: ReviewRating
  body: string | null
  created_at: string
}
