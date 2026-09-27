import Image from 'next/image';

import Flag from '@/components/ui/Flag';
import { PhotoCaption } from '@/components/ui/PhotoCredit';
import { EVENT } from '@/lib/wcc/config';
import { WCC_PHOTOS, type PhotoCredit } from '@/lib/wcc/photos';
import type { PlayerId } from '@/lib/wcc/types';
import { Crown, type DisplayPlayer, type Players } from './ui';

const PHOTO: Record<PlayerId, PhotoCredit> = { 1: WCC_PHOTOS.gukesh.portrait, 2: WCC_PHOTOS.sindarov.portrait };

function Portrait({ player, side }: { player: DisplayPlayer; side: 'left' | 'right' }) {
  const photo = PHOTO[player.id];
  const color = player.id === 1 ? 'var(--wcc-p1)' : 'var(--wcc-p2)';
  return (
    <figure className="relative w-full">
      <div
        className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-2xl shadow-black/50"
        style={{ boxShadow: `0 30px 60px -30px ${color}` }}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          priority
          sizes="(min-width: 1024px) 300px, (min-width: 640px) 32vw, 42vw"
          className="object-cover"
          style={{ objectPosition: photo.focal ?? '50% 30%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-[#0B0D12]/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: color }} aria-hidden />
        {player.isChampion && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 inline-flex items-center gap-1 rounded-full bg-black/55 backdrop-blur px-2 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-chess-gold ring-1 ring-chess-gold/40">
            <Crown className="w-3.5 h-3.5" /> Champion
          </span>
        )}
      </div>
      <figcaption className={`mt-1.5 text-[10px] leading-tight text-white/45 ${side === 'right' ? 'text-right' : ''}`}>
        <PhotoCaption photo={photo} className={side === 'right' ? 'justify-end' : ''} />
      </figcaption>
    </figure>
  );
}

function NamePlate({ player, align }: { player: DisplayPlayer; align: 'left' | 'right' }) {
  const color = player.id === 1 ? 'var(--wcc-p1)' : 'var(--wcc-p2)';
  const right = align === 'right';
  return (
    <div className={`mt-3 ${right ? 'text-right' : ''}`}>
      <div className={`flex items-center gap-2 ${right ? 'justify-end' : ''}`}>
        <span aria-hidden className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
        <Flag code={player.fedCode} size="sm" title={player.country} />
        <span className="text-[11px] uppercase tracking-wider text-white/60">{player.country}</span>
      </div>
      <p className="mt-1 font-heading text-xl sm:text-3xl text-white leading-tight">{player.shortName}</p>
      <p className={`text-[11px] sm:text-xs font-semibold uppercase tracking-wider ${player.isChampion ? 'text-chess-gold' : 'text-white/60'}`}>
        {player.role}
      </p>
      <dl className={`mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] sm:text-xs text-white/60 tabular-nums ${right ? 'justify-end' : ''}`}>
        <div><dt className="inline">Classical </dt><dd className="inline font-semibold text-white">{player.ratings.classical || '—'}</dd></div>
        <div><dt className="inline">Rapid </dt><dd className="inline text-white/85">{player.ratings.rapid || '—'}</dd></div>
        <div><dt className="inline">Blitz </dt><dd className="inline text-white/85">{player.ratings.blitz || '—'}</dd></div>
      </dl>
    </div>
  );
}

export default function FaceOffHero({ players }: { players: Players }) {
  const a = players[1];
  const b = players[2];
  return (
    <section className="relative isolate overflow-hidden bg-[#0B0D12] text-white" aria-label="Gukesh versus Sindarov">
      {/* Atmosphere: each player's colour glows from their side; a gold halo over the title. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -left-40 top-10 w-[520px] h-[520px] rounded-full blur-3xl opacity-25" style={{ background: 'var(--wcc-p1)' }} />
        <div className="absolute -right-40 top-10 w-[520px] h-[520px] rounded-full blur-3xl opacity-25" style={{ background: 'var(--wcc-p2)' }} />
        <div className="absolute left-1/2 -translate-x-1/2 -top-40 w-[600px] h-[400px] rounded-full blur-3xl bg-chess-gold/10" />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'repeating-conic-gradient(#fff 0% 25%, transparent 0% 50%)', backgroundSize: '44px 44px' }} />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-chess-gold/60 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-20 sm:pb-24">
        <nav aria-label="Breadcrumb" className="text-xs text-white/50 mb-4 sm:mb-6">
          <a href="/simulations" className="hover:text-chess-gold transition-colors">Simulations</a>
          <span className="mx-2">/</span>
          <span className="text-white/80">World Championship 2026</span>
        </nav>

        <div className="text-center sm:hidden mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-chess-gold">FIDE World Championship · {EVENT.city}</p>
          <h1 className="mt-1 font-heading text-3xl leading-tight">Gukesh <span className="text-white/40 text-2xl">vs</span> Sindarov</h1>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] sm:grid-cols-[minmax(0,300px)_1fr_minmax(0,300px)] items-start gap-2 sm:gap-8">
          <div>
            <Portrait player={a} side="left" />
            <NamePlate player={a} align="left" />
          </div>

          <div className="flex flex-col items-center text-center pt-[18vw] sm:pt-6 lg:pt-10">
            <div className="hidden sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-chess-gold">FIDE World Championship 2026</p>
              <h1 className="mt-3 font-heading text-3xl md:text-4xl lg:text-6xl leading-[1.05] text-balance">
                Gukesh <span className="block text-white/35 text-2xl lg:text-3xl my-1">vs</span> Sindarov
              </h1>
            </div>
            <div
              aria-hidden
              className="sm:hidden w-11 h-11 rounded-full grid place-items-center font-heading text-sm sm:text-xl text-chess-gold bg-[#0B0D12] ring-2 ring-chess-gold/50 shadow-[0_0_40px_rgba(201,168,76,0.35)]"
            >
              VS
            </div>
            <div className="hidden sm:block mt-6 space-y-1 text-sm text-white/70">
              <p className="font-medium text-white/90">22 Nov – 13 Dec 2026</p>
              <p>{EVENT.venue}, {EVENT.venueArea}</p>
              <p className="text-white/50 text-xs">14 classical games · first to 7½ · $2.5M prize fund</p>
            </div>
          </div>

          <div>
            <Portrait player={b} side="right" />
            <NamePlate player={b} align="right" />
          </div>
        </div>

        <p className="sm:hidden mt-5 text-center text-xs text-white/60">
          22 Nov – 13 Dec 2026 · {EVENT.venue}, Geneva · first to 7½
        </p>
      </div>
    </section>
  );
}
