import Image from "next/image";
import Link from "next/link";

const About = () => {
    return (
        <main className="flex-1 flex flex-col">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-16 w-full">
                <h1 className="font-heading text-4xl text-[var(--text-primary)] mb-8 text-center">About</h1>

                {/* Photo with gold accent */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-br from-chess-gold/30 to-chess-gold/10 rounded-xl blur-sm" />
                        <Image
                            src="/img/selfie.jpeg"
                            alt="Caleb Wetherell"
                            width={280}
                            height={280}
                            className="relative rounded-xl"
                        />
                    </div>
                </div>

                {/* Bio */}
                <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
                    <p>
                        Welcome to Pawnalyze, a haven for chess enthusiasts and data lovers alike! My name is Caleb Wetherell,
                        a Seattle-based data scientist with a penchant for chess, albeit not mastering it just yet. As a serial
                        hobbyist, I dive into intriguing projects that blend my love for data and my array of interests, with
                        chess taking center stage on Pawnalyze.
                    </p>
                    <p>
                        Pawnalyze is the culmination of my passion for data science and chess. I simulate and make predictions
                        for chess tournaments, and recently started analyzing the complexity of chess positions. This project
                        reflects my journey in learning and entertainment, and I am thrilled to share it with you. For the
                        curious minds, the code that powers these simulations is{' '}
                        <Link
                            href="https://www.github.com/cmwetherell/cmwetherell.github.io"
                            className="text-chess-gold hover:text-chess-gold-light font-semibold transition-colors"
                        >
                            available on GitHub
                        </Link>.
                    </p>

                    <h3 className="font-heading text-xl text-[var(--text-primary)] pt-4">
                        Elocator: Unveiling Chess Complexity
                    </h3>
                    <p>
                        In my continuous exploration of chess through data, I&apos;ve launched a groundbreaking project named
                        Elocator. This open-source tool is designed to predict the complexity of chess positions for humans,
                        providing a unique lens to understand what makes a position challenging. By defining complexity as the
                        expected change in win percentage after a move, Elocator offers a novel perspective on the game&apos;s
                        intricate dynamics.
                    </p>
                    <p>
                        Elocator operates on a dataset of FENs, analyzing the loss in win percentage when a grandmaster makes
                        a move. Underpinned by a neural network trained on over 100,000 chess moves by grandmasters, it assigns
                        a complexity score to positions, aiming to deepen our understanding of chess strategy.
                    </p>

                    <h3 className="font-heading text-xl text-[var(--text-primary)] pt-4">Recognition</h3>

                    {/* Feature cards */}
                    <div className="grid sm:grid-cols-2 gap-4 py-2">
                        <div className="surface-card p-4">
                            <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">The New York Times</p>
                            <p className="text-sm text-[var(--text-muted)]">
                                Featured Pawnalyze&apos;s analysis of the Hans Niemann chess cheating scandal.
                            </p>
                        </div>
                        <div className="surface-card p-4">
                            <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">NPR</p>
                            <p className="text-sm text-[var(--text-muted)]">
                                Highlighted Pawnalyze&apos;s data-driven approach to chess analytics.
                            </p>
                        </div>
                    </div>

                    <h3 className="font-heading text-xl text-[var(--text-primary)] pt-4">Join The Journey</h3>
                    <p>
                        As Pawnalyze continues to evolve, so does my commitment to enhancing the chess community&apos;s
                        understanding and appreciation of the game. Whether through the analytical insights from simulated
                        tournaments or the groundbreaking analysis provided by Elocator, our mission remains to enrich the
                        chess experience for players and enthusiasts around the world.
                    </p>
                    <p>I invite you to explore the depths of chess analytics with me.</p>

                    {/* Social CTAs */}
                    <div className="flex items-center gap-3 pt-4">
                        <Link
                            href="https://www.twitter.com/pawnalyze/"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:text-chess-gold hover:border-chess-gold/30 transition-colors"
                        >
                            Follow on X/Twitter
                        </Link>
                        <Link
                            href="https://www.github.com/cmwetherell/pawnalyze"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:text-chess-gold hover:border-chess-gold/30 transition-colors"
                        >
                            View on GitHub
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default About;
