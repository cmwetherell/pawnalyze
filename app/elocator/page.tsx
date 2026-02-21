'use client'

import UnifiedAnalyzer from "@/components/elocator/UnifiedAnalyzer";


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <title>Elocator: Chess Complexity Calculator</title>
      <p className="text-4xl font-bold">Elocator: Chess Complexity Calculator</p>

      <UnifiedAnalyzer />
      <br />
      <br></br>
      <p className="text-2xl font-bold ">What is this? How does it work?</p>
      <p className= "w-3/4">
        Elocator is a tool that calculates the complexity of a given chess position. It does this by
        analyzing the position and assigning a score from 1 to 10, with 1 being the least complex and
        10 being the most complex.
      <br></br>
      <br></br>
      How can we define the complexity of a chess position? There are many ways to do this, but I have chosen to define complexity as the expected change in Win % after a move is made.
      Imagine a position where white has a +1 advantage from Stockfish. That implies a 59% win rate for white. Assuming Stockfish is perfect, a human can only play a move that is as good or worse than Stockfish (i.e., a move that does not increase the win rate for white).
      We know that after the next move is played, white will have a 59% or lower chance of winning.
      <br></br>
      <br></br>
      Depending on the position a grandmaster may find the best move, or maybe it is a really difficult position to find the best move.
      Over a large enough dataset, we can make correlations between the state of the board, and how much we expect the win % to go down after a move is made. As an example, over 20,000 moves, my data shows that a GM is expected to lose 1.4% win rate after a move is made in a position with
       a queen on the board, compared to 1.3% if there is no queen. So positions are about 7% more complex when there is a queen (1.4/1.3).
      <br></br>
      <br></br>
        I created a dataset of FENs mapped to the loss in <a className = "text-green-500" href="https://lichess.org/page/accuracy">Win %</a> from a GM that made a move in that position (classical OTB games only).
        Underlying this tool is a neural network (AI, deep learning, yada yada) that has been trained on 100,000 chess moves made by grandmasters.
        The model has learned to predict the complexity of a position by learning the expected change in Win % after a move is made, as measured by Stockfish 16 at depth 20.
      <br></br>
      <br></br>
        The model is then used to predict the complexity of a given position. The model is not perfect, but it is a good starting point for understanding the complexity of a position.
        I look forward to making it better over time. Soon, I will publish some analytics around model performance.
        <br></br><br></br>
        Some example FENs:
        <br></br>
        Low Complexity: r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3<br></br>
        Medium Complexity: 4rk2/ppp1qppp/3p2R1/8/4P3/2Q1R2P/PPP2PP1/6K1 b - - 0 1<br></br>
        High Complexity: 2kr3r/ppqb4/3p1b1p/2pPnpp1/NPP1p1nP/6PB/PB2PPN1/2RQ1RK1 w - - 0 1<br></br>
        <br></br>

        In the immediate future, I have a few goals:<br></br>
        1. Make the complexity model much better (incorporate a larger training dataset, a better NN  structure, e.g. HalfKA)<br></br>
        2. Find a mechanism to turn the complexity score into game evaluations<br></br>
        3. Find a mechanism to turn a series of games into a tournament score.<br></br>
        4. Find a mechanism to identify outliers beyond some percentile (e.g., to identify cheating).<br></br>
        <br></br>
        Longer term, I view this as an opportunity for the chess community to develop open source cheating detection, among other things.
        <br></br><br></br>
        You can learn more about the model and the dataset by visiting the <a className = "text-green-500" href="https://github.com/cmwetherell/elocator">Elocator GitHub repository</a>.
      </p>
    </main>
  );
}
