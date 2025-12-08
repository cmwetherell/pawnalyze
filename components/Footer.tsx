import Link from 'next/link';
import React from 'react';
import { FaXTwitter, FaGithub } from 'react-icons/fa6';

const Footer = () => {
    return (
        <footer className="relative border-t border-luxury-amber/20 bg-luxury-charcoal/50 backdrop-blur-sm">
            <div className="container mx-auto px-6 lg:px-12 py-12">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                    <div className="flex flex-col items-center md:items-start">
                        <p className="text-luxury-cream/60 text-sm font-body">
                            &copy; {new Date().getFullYear()} Pawnalyze
                        </p>
                        <p className="text-luxury-cream/40 text-xs mt-2 font-body">
                            Advanced Chess Analytics & Predictions
                        </p>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                        <Link 
                            href="https://www.twitter.com/pawnalyze" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative"
                        >
                            <div className="absolute inset-0 bg-luxury-amber/0 group-hover:bg-luxury-amber/10 rounded-full transition-all duration-300 transform group-hover:scale-110" />
                            <FaXTwitter 
                                size="1.5em" 
                                className="text-luxury-cream/60 group-hover:text-luxury-gold transition-colors duration-300 relative z-10" 
                            />
                        </Link>
                        <Link 
                            href="https://www.github.com/cmwetherell/pawnalyze" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative"
                        >
                            <div className="absolute inset-0 bg-luxury-amber/0 group-hover:bg-luxury-amber/10 rounded-full transition-all duration-300 transform group-hover:scale-110" />
                            <FaGithub 
                                size="1.5em" 
                                className="text-luxury-cream/60 group-hover:text-luxury-gold transition-colors duration-300 relative z-10" 
                            />
                        </Link>
                    </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-luxury-amber/10">
                    <p className="text-center text-luxury-cream/40 text-xs font-body">
                        Crafted with precision for the chess community
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
