import TournamentInfo from '@/components/TournamentInfo';

export default function SimPage(): JSX.Element {
    return (
        <main className="flex-1 flex flex-col relative z-10 min-h-screen">
            <section className="relative px-6 lg:px-12 py-16 lg:py-24">
                <div className="max-w-7xl mx-auto">
                    <h1 className="font-display text-5xl md:text-6xl font-bold text-luxury-gold text-center mb-4 animate-fade-in-up">
                        Tournament Simulations
                    </h1>
                    <p className="text-luxury-cream/70 font-body text-lg text-center max-w-2xl mx-auto mb-16 animate-fade-in-up-delay-1">
                        Explore predictions and detailed analytics for the world&apos;s most prestigious chess tournaments
                    </p>

                    <div className="mb-20">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-luxury-gold mb-8 text-center">
                            Active Tournaments
                        </h2>
                        <div className="space-y-6">
                            <TournamentInfo
                                name="FIDE Chess World Championship Singapore 2024"
                                internalLink='/simulations/fide-world-championship-singapore-2024'
                                website="https://worldchampionship.fide.com/"
                                description="Reigning champion Ding Liren defends his title against Gukesh D."
                                format="14 classical games. Tiebreaks if necessary."
                            />
                        </div>
                    </div>

                    <div className="decorative-line max-w-4xl mx-auto my-16" />

                    <div>
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-luxury-gold mb-8 text-center">
                            Past Tournaments
                        </h2>
                        <div className="space-y-6">
                            <TournamentInfo
                                name="Chess Olympiad Budapest 2024"
                                internalLink="/simulations/chess-olympiad-budapest-2024"
                                website="https://chessolympiad2024.fide.com/"
                                description="Countries battle it out 4v4 to find the best chess nation."
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
                    </div>
                </div>
            </section>
        </main>
    );
}
