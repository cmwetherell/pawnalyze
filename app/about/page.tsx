'use client';

import Image from "next/image";
import Link from "next/link";

const About = () => {
    return (
        <main className="flex-1 flex flex-col relative">
            {/* Hero Section */}
            <section className="relative py-20 px-6 lg:px-12">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-ivory mb-8 animate-fade-in-up">
                        About
                    </h1>
                    <div className="flex justify-center mb-12 animate-fade-in-up animate-delay-200">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gold/20 rounded-full blur-2xl"></div>
                            <Image
                                src="/img/selfie.jpeg"
                                alt="Caleb Wetherell"
                                width={300}
                                height={300}
                                className="relative rounded-full border-4 border-gold/30 shadow-elegant object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="relative py-12 px-6 lg:px-12">
                <div className="max-w-4xl mx-auto">
                    <div className="prose prose-invert prose-lg max-w-none">
                        <p className="font-body text-lg text-ivory/80 mb-6 leading-relaxed animate-fade-in-up animate-delay-300">
                            Welcome to Pawnalyze, a haven for chess enthusiasts and data lovers alike! My name is <span className="text-gold font-semibold">Caleb Wetherell</span>, a Seattle-based data scientist with a penchant for chess, albeit not mastering it just yet. As a serial hobbyist, I dive into intriguing projects that blend my love for data and my array of interests, with chess taking center stage on Pawnalyze.
                        </p>
                        
                        <p className="font-body text-lg text-ivory/80 mb-6 leading-relaxed animate-fade-in-up animate-delay-400">
                            Pawnalyze is the culmination of my passion for data science and chess. I simulate and make predictions for chess tournaments, and recently started analyzing the complexity of chess positions. This project reflects my journey in learning and entertainment, and I am thrilled to share it with you. For the curious minds, the code that powers these simulations is{' '}
                            <Link 
                                href="https://www.github.com/cmwetherell/cmwetherell.github.io" 
                                className="text-gold hover:text-gold-light transition-elegant font-semibold relative group"
                            >
                                available on my GitHub
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold transform scale-x-0 group-hover:scale-x-100 transition-elegant"></span>
                            </Link>.
                        </p>

                        <div className="my-12 border-l-4 border-gold/50 pl-6 animate-fade-in-up animate-delay-500">
                            <h3 className="font-display text-2xl md:text-3xl font-bold text-gold mb-4">
                                Elocator: Unveiling the Complexity of Chess Positions
                            </h3>
                            <p className="font-body text-lg text-ivory/80 mb-4 leading-relaxed">
                                In my continuous exploration of chess through data, I&apos;ve launched a groundbreaking project named Elocator. This open-source tool is designed to predict the complexity of chess positions for humans, providing a unique lens to understand what makes a position challenging. By defining complexity as the expected change in win percentage after a move, Elocator offers a novel perspective on the game&apos;s intricate dynamics.
                            </p>
                            <p className="font-body text-lg text-ivory/80 mb-4 leading-relaxed">
                                Elocator operates on a dataset of FENs, analyzing the loss in win percentage when a grandmaster makes a move. Underpinned by a neural network trained on over 100,000 chess moves by grandmasters, it assigns a complexity score to positions, aiming to deepen our understanding of chess strategy. This tool not only serves as a bridge between human intuition and computational analysis but also opens new avenues for research and discussion within the chess community.
                            </p>
                        </div>

                        <div className="my-12 bg-charcoal/50 backdrop-blur-sm border border-gold/20 rounded-lg p-8 shadow-soft animate-fade-in-up animate-delay-600">
                            <h3 className="font-display text-2xl md:text-3xl font-bold text-gold mb-4">
                                Recognition
                            </h3>
                            <p className="font-body text-lg text-ivory/80 leading-relaxed">
                                The journey with Pawnalyze and Elocator has led to significant recognition. My analysis of the Hans Niemann chess cheating scandal caught the attention of major media outlets, including <span className="text-gold font-semibold">The New York Times</span> and <span className="text-gold font-semibold">NPR</span>. These features underscore the impact of our work, bridging the gap between chess analysis and broader discussions on integrity and performance in the sport.
                            </p>
                        </div>

                        <div className="my-12 animate-fade-in-up animate-delay-700">
                            <h3 className="font-display text-2xl md:text-3xl font-bold text-gold mb-4">
                                Join The Journey
                            </h3>
                            <p className="font-body text-lg text-ivory/80 mb-4 leading-relaxed">
                                As Pawnalyze continues to evolve, so does my commitment to enhancing the chess community&apos;s understanding and appreciation of the game. Whether through the analytical insights from simulated tournaments or the groundbreaking analysis provided by Elocator, our mission remains to enrich the chess experience for players and enthusiasts around the world.
                            </p>
                            <p className="font-body text-lg text-ivory/80 mb-4 leading-relaxed">
                                I invite you to explore the depths of chess analytics with me and delve into the intricacies of Elocator.
                            </p>
                            <p className="font-body text-lg text-ivory/80 leading-relaxed">
                                Thank you for visiting Pawnalyze. You can{' '}
                                <Link 
                                    href="https://www.twitter.com/pawnalyze/" 
                                    className="text-gold hover:text-gold-light transition-elegant font-semibold relative group"
                                >
                                    follow me on X/Twitter
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold transform scale-x-0 group-hover:scale-x-100 transition-elegant"></span>
                                </Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default About;