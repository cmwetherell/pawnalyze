'use client';

import Image from "next/image";
import Link from "next/link";

const About = () => {
  const mediaFeatures = [
    { name: "The New York Times", type: "Feature" },
    { name: "NPR", type: "Interview" },
    { name: "Chess.com", type: "Analysis" },
  ];

  return (
    <main className="min-h-screen pt-28 pb-20">
      <div className="section-container">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 mb-6">
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">About Pawnalyze</span>
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-ivory-100 mb-6 leading-tight">
              Where Data Meets the <span className="text-gradient">64 Squares</span>
            </h1>
            
            <p className="text-obsidian-300 text-lg leading-relaxed mb-8">
              Welcome to Pawnalyze, a haven for chess enthusiasts and data lovers alike. 
              I&apos;m Caleb Wetherell, a Seattle-based data scientist with a passion for 
              transforming chess into quantifiable insights.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                href="https://www.twitter.com/pawnalyze"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Follow on X
              </Link>
              <Link 
                href="https://github.com/cmwetherell/pawnalyze"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                View GitHub
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -inset-4 bg-gradient-to-br from-amber-400/20 via-amber-400/5 to-transparent rounded-2xl blur-2xl" />
              <div className="absolute -inset-1 bg-gradient-to-br from-amber-400/30 to-transparent rounded-2xl opacity-50" />
              
              <Image
                src="/img/selfie.jpeg"
                alt="Caleb Wetherell"
                width={400}
                height={400}
                className="relative rounded-2xl object-cover shadow-elevated"
                priority
              />
              
              {/* Name Tag */}
              <div className="absolute -bottom-4 -right-4 glass-card px-6 py-3">
                <p className="font-display text-lg font-semibold text-ivory-100">Caleb Wetherell</p>
                <p className="text-obsidian-400 text-sm">Data Scientist & Creator</p>
              </div>
            </div>
          </div>
        </div>

        {/* Media Recognition */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <p className="text-obsidian-400 text-sm uppercase tracking-wider mb-2">Featured In</p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {mediaFeatures.map((media, index) => (
              <div key={index} className="text-center">
                <p className="font-display text-xl md:text-2xl text-ivory-100 font-semibold">{media.name}</p>
                <p className="text-obsidian-500 text-xs uppercase tracking-wider mt-1">{media.type}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story Section */}
        <section className="mb-24">
          <div className="max-w-3xl mx-auto">
            <div className="glass-card p-8 md:p-12">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-ivory-100 mb-6">
                The Story
              </h2>
              
              <div className="space-y-6 text-obsidian-300 leading-relaxed">
                <p>
                  Pawnalyze is the culmination of my passion for data science and chess. As a serial 
                  hobbyist, I dive into intriguing projects that blend my love for data and my array 
                  of interests, with chess taking center stage here.
                </p>
                
                <p>
                  I simulate and make predictions for chess tournaments, and recently started analyzing 
                  the complexity of chess positions. This project reflects my journey in learning and 
                  entertainment, and I am thrilled to share it with you.
                </p>
                
                <p>
                  For the curious minds, the code that powers these simulations is{' '}
                  <Link 
                    href="https://github.com/cmwetherell/pawnalyze" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    available on my GitHub
                  </Link>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Elocator Section */}
        <section className="mb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 mb-6">
                <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Featured Project</span>
              </div>
              
              <h2 className="font-display text-3xl md:text-4xl font-bold text-ivory-100 mb-6">
                Elocator: Unveiling Chess Complexity
              </h2>
              
              <div className="space-y-4 text-obsidian-300 leading-relaxed">
                <p>
                  Elocator is a groundbreaking open-source tool designed to predict the complexity 
                  of chess positions for humans. By defining complexity as the expected change in 
                  win percentage after a move, it offers a unique lens to understand what makes a 
                  position challenging.
                </p>
                
                <p>
                  The model operates on a dataset of FENs, analyzing the loss in win percentage 
                  when a grandmaster makes a move. Underpinned by a neural network trained on over 
                  100,000 chess moves by grandmasters, it assigns a complexity score to positions.
                </p>
              </div>
              
              <div className="mt-8">
                <Link href="/elocator" className="btn-primary">
                  Try Elocator
                </Link>
              </div>
            </div>
            
            <div className="glass-card p-8">
              <h4 className="font-semibold text-ivory-100 mb-4">How It Works</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <span className="font-display font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-ivory-100 font-medium">Analyze Position</p>
                    <p className="text-obsidian-400 text-sm">Input a FEN string or set up a position</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <span className="font-display font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-ivory-100 font-medium">Neural Network Processing</p>
                    <p className="text-obsidian-400 text-sm">AI trained on 100K+ grandmaster moves</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <span className="font-display font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-ivory-100 font-medium">Complexity Score</p>
                    <p className="text-obsidian-400 text-sm">Receive a score from 1-10 indicating difficulty</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recognition Section */}
        <section className="mb-24">
          <div className="glass-card p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-ivory-100 mb-6">
                Recognition
              </h2>
              
              <p className="text-obsidian-300 leading-relaxed mb-8">
                The journey with Pawnalyze and Elocator has led to significant recognition. 
                My analysis of the Hans Niemann chess cheating scandal caught the attention 
                of major media outlets, including The New York Times and NPR. These features 
                underscore the impact of our work, bridging the gap between chess analysis 
                and broader discussions on integrity and performance in the sport.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <div className="px-6 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-obsidian-400 text-sm">New York Times</span>
                </div>
                <div className="px-6 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-obsidian-400 text-sm">NPR</span>
                </div>
                <div className="px-6 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-obsidian-400 text-sm">Chess.com</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Join Section */}
        <section className="text-center">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ivory-100 mb-6">
            Join The Journey
          </h2>
          
          <p className="text-obsidian-300 leading-relaxed max-w-2xl mx-auto mb-8">
            As Pawnalyze continues to evolve, so does my commitment to enhancing the chess 
            community&apos;s understanding and appreciation of the game. Whether through 
            simulated tournaments or complexity analysis, our mission remains to enrich 
            the chess experience for players and enthusiasts around the world.
          </p>
          
          <Link 
            href="https://www.twitter.com/pawnalyze"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Follow @pawnalyze
          </Link>
        </section>
      </div>
    </main>
  );
};

export default About;
