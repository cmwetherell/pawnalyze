import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import ChessAI from "@/components/LoadingChessAI";
import GetPredictions from "@/components/currentPredictions";
import ChessButton from "@/components/Button";
import OlympiadSims from "@/components/OlympiadSims";
import WCCSims from "@/components/WCCSims";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-6 lg:px-12 py-20">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/3 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Main heading with elegant typography */}
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold text-ivory mb-6 leading-tight animate-fade-in-up">
            <span className="block">Your source for</span>
            <span className="block text-gold mt-2">chess analytics</span>
          </h1>
          
          {/* Subtitle */}
          <p className="font-body text-xl md:text-2xl text-ivory/70 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animate-delay-200">
            Insights for chess tournaments, games, and positions. 
            Discover patterns, predict outcomes, and explore the depth of chess strategy.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-16 animate-fade-in-up animate-delay-300">
            <ChessButton
              text="Explore Simulations"
              link="/simulations/"
              variant="primary"
            />
            <ChessButton
              text="Try Elocator"
              link="/elocator/"
              variant="secondary"
            />
          </div>
        </div>
        
        {/* Elegant divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>
      </section>

      {/* World Championship Section */}
      <section className="relative py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16 animate-fade-in-up animate-delay-400">
            <div className="inline-block mb-4">
              <div className="h-px w-24 bg-gold mx-auto mb-4"></div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-ivory mb-4">
                World Championship
                <span className="block text-gold mt-2">Simulations</span>
              </h2>
              <div className="h-px w-24 bg-gold mx-auto mt-4"></div>
            </div>
            <p className="font-body text-lg text-ivory/60 max-w-2xl mx-auto">
              Advanced probabilistic modeling of championship outcomes
            </p>
          </div>
          
          {/* Chart container with elegant styling */}
          <div className="relative bg-charcoal/50 backdrop-blur-sm border border-gold/20 rounded-lg p-8 md:p-12 shadow-elegant animate-fade-in-up animate-delay-500">
            <div className="absolute inset-0 bg-gradient-luxury rounded-lg opacity-50"></div>
            <div className="relative z-10">
              <WCCSims justGraph={true}/>
            </div>
          </div>
        </div>
      </section>

      {/* Additional spacing */}
      <div className="h-20"></div>
    </main>
  );
}
