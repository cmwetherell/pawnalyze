'use client'
import BroadcastRoundComponent from '@/components/elocator/Broadcast';

export default function Broadcast(): JSX.Element {
    return (
        <main className="page-shell space-y-6">
            <div className="glass-panel p-6">
                <p className="text-xs uppercase tracking-[0.35em] text-slate">Elocator / Broadcast</p>
                <h1 className="font-display text-3xl uppercase tracking-[0.35em] text-paper">Live round package</h1>
                <p className="text-slate">Drop this embed into your show docs to mirror the live complexity feed.</p>
            </div>
            <div className="glass-panel p-4">
                <BroadcastRoundComponent 
                    broadcastRoundId="5yjXPZ9T"
                />
            </div>
        </main>
    );
};
