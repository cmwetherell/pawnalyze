import { Tag } from '@/components/ui/Tag';
import { isFinished, statusPillFor } from '@/lib/olympiad/status';
import type { OlympiadStatus } from '@/lib/olympiad/types';

/** Where the event stands, the same on both of its pages. */
export function EventStatus({ status, startDate }: { status: OlympiadStatus; startDate: string }) {
  const pill = statusPillFor(status, startDate);
  return <Tag tone={pill.live ? 'live' : 'neutral'} icon={isFinished(status) ? 'check' : undefined}>{pill.text}</Tag>;
}
