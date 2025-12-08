import TournamentInfo from '@/components/TournamentInfo';

export default function SimPage(): JSX.Element {
    return (
        <main className="flex-1 flex flex-col min-h-screen relative">
            {/* Hero Section */}
            <section className="relative py-20 px-6 lg:px-12">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 animate-fade-in-up">
                        <div className="inline-block mb-4">
                            <div className="h-px w-24 bg-gold mx-auto mb-4"></div>
                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-ivory mb-4">
                                Tournament
                                <span className="block text-gold mt-2">Simulations</span>
                            </h1>
                            <div className="h-px w-24 bg-gold mx-auto mt-4"></div>
                        </div>
                        <p className="font-body text-lg text-ivory/60 max-w-2xl mx-auto">
                            Explore probabilistic predictions and detailed analyses of major chess tournaments
                        </p>
                    </div>
                </div>
            </section>

            {/* Active Tournaments */}
            <section className="relative py-12 px-6 lg:px-12">
                <div className="max-w-6xl mx-auto">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-gold mb-8 animate-fade-in-up animate-delay-200">
                        Active Tournaments
                    </h2>
                    <div className="animate-fade-in-up animate-delay-300">
                        <TournamentInfo
                            name="FIDE Chess World Championship Singapore 2024"
                            internalLink='/simulations/fide-world-championship-singapore-2024'
                            website="https://worldchampionship.fide.com/"
                            description="Reigning champion Ding Liren defends his title against Gukesh D."
                            format="14 classical games. Tiebreaks if necessary."
                        />
                    </div>
                </div>
            </section>

            {/* Past Tournaments */}
            <section className="relative py-12 px-6 lg:px-12 pb-20">
                <div className="max-w-6xl mx-auto">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-gold mb-8 animate-fade-in-up animate-delay-400">
                        Past Tournaments
                    </h2>
                    <div className="space-y-0">
                        <div className="animate-fade-in-up animate-delay-500">
                            <TournamentInfo
                                name="Chess Olympiad Budapest 2024"
                                internalLink="/simulations/chess-olympiad-budapest-2024"
                                website="https://chessolympiad2024.fide.com/"
                                description="Countries battle it out 4v4 to find the best chess nation."
                                format="11 rounds of 4v4 team battles"
                            />
                        </div>
                        <div className="animate-fade-in-up animate-delay-600">
                            <TournamentInfo
                                name="2024 Candidates Tournament"
                                internalLink="/simulations/candidates-2024"
                                website="https://candidates.fide.com/"
                                description="The Candidates Tournament determines the challenger for the World Chess Championship, who will face Ding Liren."
                                format="8-player double round-robin"
                            />
                        </div>
                        <div className="animate-fade-in-up animate-delay-700">
                            <TournamentInfo
                                name="2024 Womens Candidates Tournament"
                                internalLink="/simulations/womens-candidates-2024"
                                website="https://candidates.fide.com/"
                                description="The Womens Candidates Tournament determines the challenger for the World Chess Championship, who will face Ju Wenjun."
                                format="8-player double round-robin"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
