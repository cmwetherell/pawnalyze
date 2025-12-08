'use client'
import BroadcastRoundComponent from '@/components/elocator/Broadcast';

export default function Broadcast(): JSX.Element {
    return (
        <main className="container space-y-8 py-16">
            <section className="space-y-3 text-center">
                <p className="text-xs uppercase tracking-[0.5em] text-sand-muted">Elocator broadcast</p>
                <h1 className="font-display text-4xl text-sand">Live round complexity ticker</h1>
                <p className="text-sand-muted">Drop this component into commentary overlays or streams.</p>
            </section>
            <div className="rounded-4xl border border-white/10 bg-black/30 p-6 shadow-subtle">
                <BroadcastRoundComponent 
                    broadcastRoundId="5yjXPZ9T"
                />
            </div>
        </main>
    );
};
