'use client';
import BroadcastRoundComponent from '@/components/elocator/Broadcast';

import type { JSX } from "react";

export default function Broadcast(): JSX.Element {
    return (
        <main className="flex-1 flex flex-col min-h-screen bg-white">
            <div>
                <p>Info</p>
                <BroadcastRoundComponent 
                    broadcastRoundId="5yjXPZ9T"
                />
            </div>
        </main>
    );
}
