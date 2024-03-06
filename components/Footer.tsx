import Link from 'next/link';
import React from 'react';
import { FaXTwitter, FaGithub } from 'react-icons/fa6'; // Importing Twitter and GitHub icons
import { FaX } from 'react-icons/fa6';

const Footer = () => {
    return (
        <footer className="bg-white text-black p-4 flex justify-between items-center">
            <p>&copy; 2024 Pawnalyze</p>
            <div className="flex items-center">
                <Link href="https://www.twitter.com/pawnalyze" passHref>
                    <p className="text-black hover:text-gray-700 mx-2">
                        <FaXTwitter size="1.5em" /> {/* Twitter Icon */}
                    </p>
                </Link>
                <Link href="https://www.github.com/cmwetherell/pawnalyze" passHref>
                    <p className="text-black hover:text-gray-700 mx-2">
                        <FaGithub size="1.5em" /> {/* GitHub Icon */}
                    </p>
                </Link>
            </div>
        </footer>
    );
};

export default Footer;
