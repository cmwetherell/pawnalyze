'use client';
import React, { useState } from 'react';
import useChessTournamentStream  from '@/hooks/useChessTournamentStream';

interface BroadcastRoundProps {
    broadcastRoundId: string;
}

const BroadcastRoundComponent: React.FC<BroadcastRoundProps> = ({ broadcastRoundId }: BroadcastRoundProps) => {
    useChessTournamentStream(broadcastRoundId);

    return (
        <div>
            {/* Your component UI here */}
        </div>
    );
};

export default BroadcastRoundComponent;

  