'use client';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import useChessTournamentStream from '@/hooks/useChessTournamentStream';
import { WCC_HREF } from '@/lib/wcc/config';

/** Follows one Lichess broadcast round. Nothing is drawn from it yet. */
export function BroadcastRound({ broadcastRoundId }: { broadcastRoundId: string }) {
  useChessTournamentStream(broadcastRoundId);
  return (
    <EmptyState
      title="Broadcast info"
      body="This broadcast is not shown here yet. The World Championship games are scored move by move on their live page."
      action={<><Button variant="primary" href={`${WCC_HREF}/live`}>Watch the live game</Button><Button href="/elocator">Analyze a position</Button></>}
    />
  );
}
