import WCCSims from "@/components/WCCSims";
import Link from "next/link";
import TournamentHeader from "@/components/simulation/TournamentHeader";

const Sims: any = () => {
    return (
        <main className="flex-1 flex flex-col min-h-screen">
            <TournamentHeader
                name="FIDE Chess World Championship Singapore 2024"
                website="https://worldchampionship.fide.com/"
                description="Reigning champion Ding Liren defends his title against Gukesh D."
                format="14 classical games. Tiebreaks if necessary."
            />
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4">
                <div className="rounded-lg border border-chess-gold/40 bg-chess-gold/10 px-4 py-3 text-sm text-[var(--text-primary)] flex flex-wrap items-center justify-between gap-2">
                    <span>Archived: the 2024 match (Ding Liren vs Gukesh D). The 2026 title match is Gukesh vs Sindarov.</span>
                    <Link href="/world-chess-championship-2026" className="font-semibold text-gold-ink hover:underline">See the 2026 odds &rarr;</Link>
                </div>
            </div>
            <div className="py-4">
                <WCCSims justGraph={false} />
            </div>
        </main>
    );
}

export default Sims;
