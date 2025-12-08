'use client'
import Link from "next/link"
import ChessButton from "@/components/Button";

export default function Custom404() {
    return(
        <main className="flex flex-col min-h-screen relative z-10">
            <section className="flex-1 flex flex-col items-center justify-center px-6 lg:px-12 py-24 lg:py-32 text-center">
                <div className="max-w-2xl mx-auto space-y-8">
                    <h1 className="font-display text-8xl md:text-9xl font-bold text-luxury-gold animate-fade-in-up">
                        404
                    </h1>
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-luxury-cream animate-fade-in-up-delay-1">
                        Page Not Found
                    </h2>
                    <p className="text-luxury-cream/70 font-body text-lg animate-fade-in-up-delay-2">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-8 animate-fade-in-up-delay-3">
                        <ChessButton
                            text="Go Home"
                            link="/"
                            variant="primary"
                        />
                        <Link 
                            href="https://blog.pawnalyze.com/" 
                            className="text-luxury-gold hover:text-luxury-amber transition-colors duration-300 underline decoration-luxury-amber/50 hover:decoration-luxury-amber underline-offset-4 font-body"
                        >
                            Looking for the older version of Pawnalyze?
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}