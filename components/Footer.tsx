import Link from 'next/link';
import React from 'react';
import { FaXTwitter, FaGithub } from 'react-icons/fa6';

const Footer = () => {
    return (
        <footer className="relative border-t border-gold/20 bg-charcoal/50 backdrop-blur-sm mt-auto">
            <div className="container mx-auto px-6 lg:px-12 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <p className="text-ivory/60 font-body text-sm tracking-wide">
                        &copy; 2024 Pawnalyze. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-6">
                        <Link 
                            href="https://www.twitter.com/pawnalyze" 
                            className="text-ivory/60 hover:text-gold transition-elegant group relative"
                            aria-label="Twitter"
                        >
                            <div className="absolute inset-0 bg-gold/10 rounded-full opacity-0 group-hover:opacity-100 transition-elegant scale-150"></div>
                            <FaXTwitter size="1.3em" className="relative z-10" />
                        </Link>
                        <Link 
                            href="https://www.github.com/cmwetherell/pawnalyze" 
                            className="text-ivory/60 hover:text-gold transition-elegant group relative"
                            aria-label="GitHub"
                        >
                            <div className="absolute inset-0 bg-gold/10 rounded-full opacity-0 group-hover:opacity-100 transition-elegant scale-150"></div>
                            <FaGithub size="1.3em" className="relative z-10" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
