import OlympiadSims from "@/components/OlympiadSims";
import SimulationResults from "@/components/SimulationResults";
import TournamentInfo from "@/components/TournamentInfo";
import Link from "next/link";

const Sims: any = () => {
    return (
        <main className="flex-1 flex flex-col min-h-screen bg-white">
            <div>
                <TournamentInfo
                    name="Chess Olympiad Budapest 2024"
                    website="https://chessolympiad2024.fide.com/"
                    description="Country's battle it out 4v4 to find the best chess nation."
                    format="11 rounds of 4v4 team battles"
                />
                <OlympiadSims />
            </div>
            <div>
                <p className='pt-4 pb-2 font-bold text-2xl text-center'>What am I looking at?</p>
                <p>
                    Before the Olympiad kicked off, I ran 5,000 simulations of the tournament to come up 
                    with a prediction for the probabilities that each country wins (or gets silver/bronze). 
                    Then, after each round, I run new simulations based on the current results. My simulations 
                    also take into account the official FIDE pairing logic.
                </p>
                <br></br>
                <p>
                    In case you are wondering, yes, it was a nightmare to program. And its not quite perfect. 
                    For example, Im tracking how many whites each country has played. So when two teams face off, 
                    whoever has had white more times will get the black pieces. But when they have played white 
                    the same amount of times, then the white pieces should go to whoever had white less recently. 
                    Right now, I just randomize who gets white - its a small detail, not materially impacting 
                    these predictions. But its a good example of the complexities of the Olympiad pairing algorithm.
                </p>
                <br></br>
                <p>
                    That was a little bit of an introduction to the simulations for this particular event, and 
                    you can read <a className="text-green-500" href="https://blog.pawnalyze.com/chess-simulations/2022/06/20/How-Our-Chess-Tournament-Predictions-Work.html">more technical details here</a> about the underlying model, method, and simulations. 
                    You can also find the code <a className="text-green-500" href="https://github.com/cmwetherell/cmwetherell.github.io/blob/main/chessSim/simOlympiad.py">on GitHub.</a>
                </p>
            </div>
        </main>
    );
}

export default Sims;
