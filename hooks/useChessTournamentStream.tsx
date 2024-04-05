// Assuming you're running this in a client-side environment because of 'use client'
import { useEffect } from 'react';

const useChessTournamentStream = (broadcastRoundId: string) => {
  useEffect(() => {
    const url = `https://lichess.org/api/stream/broadcast/round/${broadcastRoundId}.pgn`; // Construct the API endpoint URL

    // Function to handle streaming and processing of data
    const streamChessData = async (streamUrl: string) => {
      const response = await fetch(streamUrl);
      const reader = response.body?.getReader();
      let decoder = new TextDecoder();

      // Read the stream
      const processStream = async () => {
        if (!reader) return;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode binary data to text
          const textChunk = decoder.decode(value, { stream: true });
          console.log(textChunk); // Here you'd process your PGN data
          // You may need to adjust parsing depending on how your data is formatted
        }
      };

      processStream().catch(console.error);
    };

    // Call the stream handling function
    streamChessData(url);

    // No explicit clean-up function in this case, as fetch does not provide a native way to cancel a request.
    // However, if using AbortController is suitable for your case, you can implement request cancellation here.
  }, [broadcastRoundId]); // Reconnect if the broadcastRoundId changes
};

export default useChessTournamentStream;
