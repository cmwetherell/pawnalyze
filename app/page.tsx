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
    <main className="flex-1 flex flex-col relative z-10">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col justify-center items-center px-6 lg:px-12 py-24 lg:py-32">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 border border-luxury-amber/10 rotate-45 hidden lg:block" />
        <div className="absolute bottom-20 right-10 w-24 h-24 border border-luxury-amber/10 rotate-12 hidden lg:block" />
        
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Main heading with elegant typography */}
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold text-luxury-cream leading-tight animate-fade-in-up">
            Your Source for
            <span className="block text-luxury-gold mt-2">Chess Analytics</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-luxury-cream/70 font-body font-light max-w-2xl mx-auto animate-fade-in-up-delay-1">
            Insights for chess tournaments, games, and positions.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-12 animate-fade-in-up-delay-2">
            <ChessButton
              text="Simulations"
              link="/simulations/"
              variant="primary"
            />
            <ChessButton
              text="Elocator"
              link="/elocator/"
              variant="secondary"
            />
          </div>
        </div>
      </section>

      {/* Decorative divider */}
      <div className="decorative-line max-w-4xl mx-auto" />

      {/* World Championship Section */}
      <section className="relative py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up-delay-3">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-luxury-gold mb-4">
              World Championship Simulations
            </h2>
            <p className="text-luxury-cream/60 font-body text-lg max-w-2xl mx-auto">
              Explore predictions and probabilities for the most prestigious chess tournaments
            </p>
          </div>
          
          <div className="relative bg-luxury-charcoal/40 backdrop-blur-sm border border-luxury-amber/20 rounded-lg p-8 lg:p-12 shadow-luxury hover-glow transition-all duration-500">
            <WCCSims justGraph={true} />
          </div>
        </div>
      </section>

      {/* Additional spacing */}
      <div className="h-20" />
    </main>
  );
}
