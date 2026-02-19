
import TournamentInfo from '@/components/TournamentInfo';

export default function SimPage(): JSX.Element {
    return (

    <main className="flex-1 flex flex-col min-h-screen bg-white">
    <div>
        <p className = "text-4xl font-bold text-center text-black mb-2 mt-12">Active Tournaments</p>
    </div>
    <div>
        <TournamentInfo
            name="2026 Candidates Tournament"
            internalLink="/simulations/candidates-2026"
            website="https://candidates.fide.com/"
            description="The Candidates Tournament determines the challenger for the World Chess Championship, who will face D. Gukesh."
            format="8-player double round-robin"
        />
        <TournamentInfo
            name="2026 Womens Candidates Tournament"
            internalLink="/simulations/womens-candidates-2026"
            website="https://candidates.fide.com/"
            description="The Womens Candidates Tournament determines the challenger for the World Chess Championship, who will face Ju Wenjun."
            format="8-player double round-robin"
        />
    </div>
    <div>
        <p className = "text-4xl font-bold text-center text-black mb-2 mt-12">Past Tournaments</p>
    </div>
    <div>
        <TournamentInfo
                name="FIDE Chess World Championship Singapore 2024"
                internalLink='/simulations/fide-world-championship-singapore-2024'
                website="https://worldchampionship.fide.com/"
                description="Reigning champion Ding Liren defends his title against Gukesh D."
                format="14 classical games. Tiebreaks if necessary."
            />
        <TournamentInfo
                name="Chess Olympiad Budapest 2024"
                internalLink="/simulations/chess-olympiad-budapest-2024"
                website="https://chessolympiad2024.fide.com/"
                description="Countrys battle it out 4v4 to find the best chess nation."
                format="11 rounds of 4v4 team battles"
            />
        <TournamentInfo
            name="2024 Candidates Tournament"
            internalLink="/simulations/candidates-2024"
            website="https://candidates.fide.com/"
            description="The Candidates Tournament determines the challenger for the World Chess Championship, who will face Ding Liren."
            format="8-player double round-robin"
        />
        <TournamentInfo
            name="2024 Womens Candidates Tournament"
            internalLink="/simulations/womens-candidates-2024"
            website="https://candidates.fide.com/"
            description="The Womens Candidates Tournament determines the challenger for the World Chess Championship, who will face Ju Wenjun."
            format="8-player double round-robin"
        />
    </div>
    </main>
    );
    }
