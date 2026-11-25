import { Section } from '@/components/layout/Section';
import { Avatar } from '@/components/ui/Avatar';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Countdown } from '@/components/ui/Countdown';
import { Disclosure } from '@/components/ui/Disclosure';
import { EmptyState } from '@/components/ui/EmptyState';
import { Explainer } from '@/components/ui/Explainer';
import { Flag } from '@/components/ui/Flag';
import { FlagStack } from '@/components/ui/FlagStack';
import { Heading } from '@/components/ui/Heading';
import { LiveDot } from '@/components/ui/LiveDot';
import { LocalTime } from '@/components/ui/LocalTime';
import { LogoRow } from '@/components/ui/LogoRow';
import { Medal } from '@/components/ui/Medal';
import { Photo } from '@/components/ui/Photo';
import { PhotoCreditList } from '@/components/ui/PhotoCredit';
import { Prose } from '@/components/ui/Prose';
import { Quote } from '@/components/ui/Quote';
import { RelativeTime } from '@/components/ui/RelativeTime';
import { Skeleton } from '@/components/ui/Skeleton';
import { Spinner } from '@/components/ui/Spinner';
import { Tag } from '@/components/ui/Tag';
import { seriesTone } from '@/lib/theme/tones';
import { ALL_WCC_PHOTO_CREDITS, WCC_PHOTOS } from '@/lib/wcc/photos';
import { CAND_PEOPLE, PRESS, RACE } from './fixtures';
import { Specimen, Variant, Variants } from './Specimen';

const NEXT_GAME = '2026-12-11T14:00:00Z';

export function WordSpecimens() {
  return (
    <Section id="words" title="Words" layout="rail" finding="Headings name a thing or state the finding. Sentence case. Running text stays at reading measure.">
      <Specimen name="Heading" from="ui/Heading" note="fit drops a title of more than 22 characters one style.">
        <div className="space-y-4">
          <Heading level={4} style="h1">Uzbekistan</Heading>
          <Heading level={4} style="h1" fit>United States of America</Heading>
          <Heading level={4} style="h2">Game 13 is the likeliest finish</Heading>
          <Heading level={4} style="h3">World Chess Championship 2026, Geneva</Heading>
        </div>
      </Specimen>
      <Specimen name="Prose" from="ui/Prose">
        <Prose>
          <p>Each game&rsquo;s win, draw and loss chances come from Pawnalyze&rsquo;s machine-learned game model, the same one behind the <a href="/simulations/chess-olympiad-2026">Olympiad forecasts</a>.</p>
          <ul><li>It takes both ratings and who has White.</li><li><strong>Sindarov is 72 points higher</strong> on the November list.</li></ul>
        </Prose>
      </Specimen>
      <Specimen name="Explainer" from="ui/Explainer">
        <Explainer
          columns={3}
          items={[
            { title: 'Game model', body: 'Takes both ratings and who has White, and returns win, draw and loss chances.' },
            { title: 'Exact odds', body: 'Every way the fourteen games can go is added up, then the tiebreak ladder.' },
            { title: 'Simulations', body: '10,000 simulated matches confirm the exact numbers.' },
          ]}
          note="Note under the columns."
        />
      </Specimen>
      <Specimen name="Quote and LogoRow" from="ui/Quote, ui/LogoRow">
        <Quote text="“Statistical analysis by Pawnalyze showed that Mr. Niemann had consistently outperformed his rating strength to an astonishing degree.”" logo={PRESS.nyt} cite="“The Chess World Isn’t Ready for a Cheating Scandal,” September 2022" />
        <LogoRow className="mt-8 border-t border-line pt-6" label="Also seen in" logos={PRESS.row} />
      </Specimen>
    </Section>
  );
}

export function StatusSpecimens() {
  return (
    <Section id="status" title="Status and feedback" layout="rail" finding="Live, loading, empty, changed, wrong. A word or an icon always goes with the colour.">
      <Specimen name="Tag and LiveDot" from="ui/Tag, ui/LiveDot" note="The live dot is the only looping animation on the site.">
        <Variants>
          <Tag>Final</Tag><Tag tone="live">Live, round 4</Tag><Tag tone="positive" icon="check">Verified</Tag><Tag tone="negative">High</Tag><Tag tone="warning" icon="warning">Projected</Tag><Tag tone="brand">GM</Tag>
          <LiveDot label="Live now" />
        </Variants>
      </Specimen>
      <Specimen name="Callout" from="ui/Callout">
        <div className="grid gap-3">
          <Callout icon="info" action={<Button size="sm">Restore picks</Button>}>You have three saved picks from an earlier visit.</Callout>
          <Callout tone="brand" icon="medal">Congrats to India, gold in Budapest 2024.</Callout>
          <Callout tone="positive" icon="check">Predictions updated to reflect your scenario selections.</Callout>
          <Callout tone="warning" icon="warning">Only 212 of 10,000 simulations match this scenario.</Callout>
          <Callout tone="negative" icon="error">The analysis could not be completed. Try again.</Callout>
          <Callout tone="live">Game 2 is being played. Odds update after it ends.</Callout>
        </div>
      </Specimen>
      <Specimen name="EmptyState" from="ui/EmptyState">
        <div className="grid gap-6 lg:grid-cols-2">
          <EmptyState title="Simulations coming soon" body="Odds appear here before round 1." action={<Button href="/simulations">See every simulation</Button>} />
          <EmptyState busy title="Loading the broadcast" />
        </div>
      </Specimen>
      <Specimen name="Skeleton and Spinner" from="ui/Skeleton, ui/Spinner">
        <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
          {(['lines', 'bars', 'histogram', 'rounds', 'chart', 'cells'] as const).map(k => <Variant key={k} label={k}><Skeleton kind={k} /></Variant>)}
        </div>
        <Variants className="mt-6 text-ink-2"><Spinner label="Loading" /></Variants>
      </Specimen>
      <Specimen name="Times" from="ui/RelativeTime, ui/LocalTime, ui/Countdown">
        <div className="grid gap-4 sm:grid-cols-2">
          <Variant label="RelativeTime"><span className="type-data text-ink"><RelativeTime iso="2026-11-24T18:00:00Z" /></span></Variant>
          <Variant label="LocalTime, datetime"><span className="type-data text-ink"><LocalTime iso={NEXT_GAME} /></span></Variant>
          <Variant label="Countdown, inline"><span className="type-data text-ink"><Countdown iso={NEXT_GAME} /></span></Variant>
          <Variant label="Countdown, full"><Countdown iso={NEXT_GAME} variant="full" /></Variant>
        </div>
      </Specimen>
    </Section>
  );
}

export function PictureSpecimens() {
  return (
    <Section id="pictures" title="People, flags, photos" layout="rail" finding="Photographs carry their credit nearby. Player avatars are black and white beside a match side.">
      <Specimen name="Avatar and AvatarStack" from="ui/Avatar, ui/AvatarStack">
        <Variants>
          {([24, 32, 40, 56] as const).map((s, i) => <Avatar key={s} size={s} name={CAND_PEOPLE[i].name} src={CAND_PEOPLE[i].src} />)}
          <Avatar size={40} name="Sindarov" src="/players/sindarov.webp" mono tone="p2" />
          <Avatar size={40} name="No Photo" />
          <AvatarStack people={CAND_PEOPLE} size={40} />
        </Variants>
        <Variants className="mt-4">
          {CAND_PEOPLE.map((p, i) => <Avatar key={p.name} size={40} name={p.name} tone={seriesTone(i)} />)}
          <Avatar size={40} name="Other" tone="context" />
        </Variants>
      </Specimen>
      <Specimen name="Flag and FlagStack" from="ui/Flag, ui/FlagStack" note="Six heights. A code with no flag shows its letters.">
        <Variants>
          {(['xs', 'sm', 'md', 'lg', 'xl', 'hero'] as const).map(s => <Flag key={s} code="UZB" size={s} title="Uzbekistan" />)}
          <Flag code="IBC" size="lg" title="IBCA" />
          <FlagStack items={RACE.map(([name, code]) => ({ name, code }))} max={5} />
          <FlagStack items={RACE.slice(0, 3).map(([name, code]) => ({ name, code }))} more={203} />
        </Variants>
      </Specimen>
      <Specimen name="Medal" from="ui/Medal"><Variants>{([1, 2, 3] as const).map(r => <Medal key={r} rank={r} />)}{([1, 2, 3] as const).map(r => <Medal key={r} rank={r} size={28} />)}</Variants></Specimen>
      <Specimen name="Photo, PhotoCaption" from="ui/Photo, ui/PhotoCredit">
        <div className="grid gap-6 sm:grid-cols-2">
          <Photo photo={WCC_PHOTOS.venue} ratio="3/2" sizes="(min-width: 640px) 450px, 100vw" />
          <Photo photo={WCC_PHOTOS.sindarov.portrait} ratio="1/1" mono sizes="(min-width: 640px) 450px, 100vw" />
        </div>
      </Specimen>
      <Specimen name="PhotoCreditList" from="ui/PhotoCredit"><Disclosure summary="All photo credits"><PhotoCreditList credits={ALL_WCC_PHOTO_CREDITS} /></Disclosure></Specimen>
    </Section>
  );
}
