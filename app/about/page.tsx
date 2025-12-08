'use client';

import Image from "next/image";
import Link from "next/link";

const About = () => {
    return (
        <main className="flex-1 flex flex-col relative z-10">
            <section className="relative min-h-[40vh] flex flex-col justify-center items-center px-6 lg:px-12 py-16 lg:py-24">
                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-luxury-gold text-center mb-8 animate-fade-in-up">
                    About
                </h1>
                
                <div className="relative mb-12 animate-fade-in-up-delay-1">
                    <div className="absolute inset-0 bg-luxury-amber/20 blur-2xl rounded-full" />
                    <Image
                        src="/img/selfie.jpeg"
                        alt="Caleb Wetherell"
                        width={280}
                        height={280}
                        className="relative rounded-full border-4 border-luxury-amber/30 shadow-luxury object-cover"
                    />
                </div>
            </section>

            <div className="decorative-line max-w-4xl mx-auto" />

            <section className="max-w-4xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
                <div className="prose prose-invert prose-lg max-w-none space-y-6">
                    <p className="text-luxury-cream/90 font-body text-lg leading-relaxed animate-fade-in-up-delay-2">
                        Welcome to Pawnalyze, a haven for chess enthusiasts and data lovers alike! My name is Caleb Wetherell, a Seattle-based data scientist with a penchant for chess, albeit not mastering it just yet. As a serial hobbyist, I dive into intriguing projects that blend my love for data and my array of interests, with chess taking center stage on Pawnalyze.
                    </p>
                    
                    <p className="text-luxury-cream/90 font-body text-lg leading-relaxed">
                        Pawnalyze is the culmination of my passion for data science and chess. I simulate and make predictions for chess tournaments, and recently started analyzing the complexity of chess positions. This project reflects my journey in learning and entertainment, and I am thrilled to share it with you. For the curious minds, the code that powers these simulations is{' '}
                        <Link 
                            href="https://www.github.com/cmwetherell/cmwetherell.github.io" 
                            className="text-luxury-gold hover:text-luxury-amber transition-colors duration-300 underline decoration-luxury-amber/50 hover:decoration-luxury-amber underline-offset-4"
                        >
                            available on my GitHub
                        </Link>.
                    </p>

                    <div className="mt-12 pt-8 border-t border-luxury-amber/20">
                        <h3 className="font-display text-3xl font-bold text-luxury-gold mb-6">
                            Elocator: Unveiling the Complexity of Chess Positions
                        </h3>
                        <p className="text-luxury-cream/90 font-body text-lg leading-relaxed mb-4">
                            In my continuous exploration of chess through data, I&apos;ve launched a groundbreaking project named Elocator. This open-source tool is designed to predict the complexity of chess positions for humans, providing a unique lens to understand what makes a position challenging. By defining complexity as the expected change in win percentage after a move, Elocator offers a novel perspective on the game&apos;s intricate dynamics.
                        </p>
                        <p className="text-luxury-cream/90 font-body text-lg leading-relaxed mb-4">
                            Elocator operates on a dataset of FENs, analyzing the loss in win percentage when a grandmaster makes a move. Underpinned by a neural network trained on over 100,000 chess moves by grandmasters, it assigns a complexity score to positions, aiming to deepen our understanding of chess strategy. This tool not only serves as a bridge between human intuition and computational analysis but also opens new avenues for research and discussion within the chess community.
                        </p>
                    </div>

                    <div className="mt-12 pt-8 border-t border-luxury-amber/20">
                        <h3 className="font-display text-3xl font-bold text-luxury-gold mb-6">
                            Recognition
                        </h3>
                        <p className="text-luxury-cream/90 font-body text-lg leading-relaxed">
                            The journey with Pawnalyze and Elocator has led to significant recognition. My analysis of the Hans Niemann chess cheating scandal caught the attention of major media outlets, including The New York Times and NPR. These features underscore the impact of our work, bridging the gap between chess analysis and broader discussions on integrity and performance in the sport.
                        </p>
                    </div>

                    <div className="mt-12 pt-8 border-t border-luxury-amber/20">
                        <h3 className="font-display text-3xl font-bold text-luxury-gold mb-6">
                            Join The Journey
                        </h3>
                        <p className="text-luxury-cream/90 font-body text-lg leading-relaxed mb-4">
                            As Pawnalyze continues to evolve, so does my commitment to enhancing the chess community&apos;s understanding and appreciation of the game. Whether through the analytical insights from simulated tournaments or the groundbreaking analysis provided by Elocator, our mission remains to enrich the chess experience for players and enthusiasts around the world.
                        </p>
                        <p className="text-luxury-cream/90 font-body text-lg leading-relaxed mb-4">
                            I invite you to explore the depths of chess analytics with me and delve into the intricacies of Elocator.
                        </p>
                        <p className="text-luxury-cream/90 font-body text-lg leading-relaxed">
                            Thank you for visiting Pawnalyze. You can{' '}
                            <Link 
                                href="https://www.twitter.com/pawnalyze/" 
                                className="text-luxury-gold hover:text-luxury-amber transition-colors duration-300 underline decoration-luxury-amber/50 hover:decoration-luxury-amber underline-offset-4"
                            >
                                follow me on X/Twitter
                            </Link>.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default About;