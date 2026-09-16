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

  for (const event of ['open', 'women']) {
    revalidateTag(`olympiad-2026-${event}`, 'max')
    revalidateTag(`olympiad-2026-sims-${event}`, 'max')
    revalidateTag(`olympiad-2026-scenario-${event}`, 'max')
  }

  return NextResponse.json({ revalidated: true })
}
