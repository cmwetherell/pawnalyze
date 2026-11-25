import { useEffect } from 'react';

/** Reads a Lichess broadcast round as it is streamed, until the page is left. */
const useChessTournamentStream = (broadcastRoundId: string) => {
  useEffect(() => {
    const ctl = new AbortController();
    const read = async () => {
      const response = await fetch(`https://lichess.org/api/stream/broadcast/round/${broadcastRoundId}.pgn`, { signal: ctl.signal });
      const reader = response.ok ? response.body?.getReader() : undefined;
      if (!reader) return;
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) return;
        console.log(decoder.decode(value, { stream: true }));
      }
    };
    read().catch((error: unknown) => { if (!ctl.signal.aborted) console.error(error); });
    return () => ctl.abort();
  }, [broadcastRoundId]);
};

export default useChessTournamentStream;
