import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function GET() {
  revalidateTag('sims-candidates_2024', 'max')
  revalidateTag('sims-womens_candidates_2024', 'max')
  revalidateTag('sims-candidates_2026', 'max')
  revalidateTag('sims-womens_candidates_2026', 'max')
  revalidateTag('sims-filtered-candidates_2024', 'max')
  revalidateTag('sims-filtered-womens_candidates_2024', 'max')
  revalidateTag('sims-filtered-candidates_2026', 'max')
  revalidateTag('sims-filtered-womens_candidates_2026', 'max')

  return NextResponse.json({ revalidated: true })
}
