'use client';

import Image from "next/image";
import Link from "next/link";

const About = () => {
  return (
    <div className="relative pt-32 pb-20">
      {/* Hero Section */}
      <section className="mb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div 
              className="
                inline-flex items-center gap-2 
                px-3 py-1.5 mb-4
                rounded-full
                bg-accent/10 
                border border-accent/20
                animate-fade-in-up opacity-0
              "
              style={{ animationDelay: '100ms' }}
            >
              <span className="text-xs text-accent font-medium uppercase tracking-wider">About Pawnalyze</span>
            </div>
            
            <h1 
              className="
                font-display text-display-md md:text-display-lg
                text-text-primary
                mb-6
                animate-fade-in-up opacity-0
              "
              style={{ animationDelay: '200ms' }}
            >
              Chess Meets <span className="text-gradient">Data Science</span>
            </h1>
            
            <p 
              className="
                text-lg text-text-secondary
                leading-relaxed
                animate-fade-in-up opacity-0
              "
              style={{ animationDelay: '300ms' }}
            >
              Welcome to Pawnalyze, a haven for chess enthusiasts and data lovers alike.
            </p>
          </div>
          
          {/* Image */}
          <div 
            className="
              relative
              animate-fade-in-up opacity-0
            "
            style={{ animationDelay: '400ms' }}
          >
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Decorative elements */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/20 to-transparent blur-3xl" />
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-accent/30 via-transparent to-accent/10 opacity-50" />
              
              {/* Image container */}
              <div className="relative glass-card p-2 rounded-2xl overflow-hidden">
                <Image
                  src="/img/selfie.jpeg"
                  alt="Caleb Wetherell"
                  width={400}
                  height={400}
                  className="rounded-xl w-full h-full object-cover"
                />
              </div>
              
              {/* Floating badge */}
              <div className="
                absolute -bottom-4 -right-4
                glass-card px-4 py-2
                rounded-lg
                animate-float
              ">
                <span className="text-sm font-medium text-text-primary">Caleb Wetherell</span>
                <span className="block text-xs text-text-muted">Data Scientist</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="mb-20">
        <div className="max-w-3xl">
          <div className="prose prose-lg prose-invert">
            <p className="text-text-secondary text-lg leading-relaxed mb-6">
              My name is Caleb Wetherell, a Seattle-based data scientist with a penchant 
              for chess, albeit not mastering it just yet. As a serial hobbyist, I dive 
              into intriguing projects that blend my love for data and my array of interests, 
              with chess taking center stage on Pawnalyze.
            </p>
            
            <p className="text-text-secondary text-lg leading-relaxed mb-6">
              Pawnalyze is the culmination of my passion for data science and chess. I simulate 
              and make predictions for chess tournaments, and recently started analyzing the 
              complexity of chess positions. This project reflects my journey in learning and 
              entertainment, and I am thrilled to share it with you.
            </p>
            
            <p className="text-text-secondary text-lg leading-relaxed">
              For the curious minds, the code that powers these simulations is{' '}
              <Link 
                href="https://www.github.com/cmwetherell/cmwetherell.github.io" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-light transition-colors"
              >
                available on my GitHub
              </Link>.
            </p>
          </div>
        </div>
      </section>

      {/* Elocator Section */}
      <section className="mb-20">
        <div className="glass-card p-8 md:p-12">
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="
                  w-10 h-10 
                  rounded-lg 
                  bg-accent/10 
                  flex items-center justify-center
                ">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="font-display text-heading-xl text-text-primary">
                  Elocator
                </h2>
              </div>
              
              <h3 className="text-accent text-lg font-medium mb-4">
                Unveiling the Complexity of Chess Positions
              </h3>
              
              <p className="text-text-secondary leading-relaxed mb-4">
                In my continuous exploration of chess through data, I&apos;ve launched a groundbreaking 
                project named Elocator. This open-source tool is designed to predict the complexity 
                of chess positions for humans, providing a unique lens to understand what makes a 
                position challenging.
              </p>
              
              <p className="text-text-secondary leading-relaxed mb-4">
                By defining complexity as the expected change in win percentage after a move, 
                Elocator offers a novel perspective on the game&apos;s intricate dynamics. The tool 
                operates on a dataset of FENs, analyzing the loss in win percentage when a 
                grandmaster makes a move.
              </p>
              
              <p className="text-text-secondary leading-relaxed">
                Underpinned by a neural network trained on over 100,000 chess moves by grandmasters, 
                it assigns a complexity score to positions, aiming to deepen our understanding of 
                chess strategy.
              </p>
            </div>
            
            <div className="lg:col-span-2 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full" />
                <div className="
                  relative
                  w-48 h-48
                  rounded-2xl
                  bg-gradient-to-br from-bg-elevated to-bg-tertiary
                  border border-border-subtle
                  flex items-center justify-center
                  shadow-glow-md
                ">
                  <span className="text-6xl font-display font-bold text-gradient">AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recognition Section */}
      <section className="mb-20">
        <h2 className="font-display text-heading-xl text-text-primary mb-8">
          Recognition
        </h2>
        
        <div className="glass-card p-8">
          <p className="text-text-secondary text-lg leading-relaxed mb-6">
            The journey with Pawnalyze and Elocator has led to significant recognition. 
            My analysis of the Hans Niemann chess cheating scandal caught the attention of 
            major media outlets, including:
          </p>
          
          <div className="flex flex-wrap gap-4 mb-6">
            {['The New York Times', 'NPR'].map((outlet, index) => (
              <span 
                key={index}
                className="
                  px-4 py-2 
                  rounded-lg 
                  bg-accent/10 
                  border border-accent/20
                  text-accent font-medium
                "
              >
                {outlet}
              </span>
            ))}
          </div>
          
          <p className="text-text-secondary leading-relaxed">
            These features underscore the impact of our work, bridging the gap between 
            chess analysis and broader discussions on integrity and performance in the sport.
          </p>
        </div>
      </section>

      {/* Join Section */}
      <section className="text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-display-sm text-text-primary mb-6">
            Join The Journey
          </h2>
          
          <p className="text-text-secondary text-lg leading-relaxed mb-8">
            As Pawnalyze continues to evolve, so does my commitment to enhancing the chess 
            community&apos;s understanding and appreciation of the game. Whether through the 
            analytical insights from simulated tournaments or the groundbreaking analysis 
            provided by Elocator, our mission remains to enrich the chess experience for 
            players and enthusiasts around the world.
          </p>
          
          <p className="text-text-secondary mb-10">
            I invite you to explore the depths of chess analytics with me.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="https://www.twitter.com/pawnalyze/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Follow on X</span>
            </Link>
            <Link 
              href="/elocator"
              className="btn-secondary"
            >
              Try Elocator
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
