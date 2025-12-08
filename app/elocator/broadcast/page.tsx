'use client'
import BroadcastRoundComponent from '@/components/elocator/Broadcast';

export default function Broadcast() {
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
};
