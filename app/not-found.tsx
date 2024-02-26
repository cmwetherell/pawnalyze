'use client'
import Link from "next/link"
import styled from 'styled-components';

// bold text
//hex code for neon green: #39ff14
const StyledLink = styled.a`
    font-weight: bold;
    text-decoration: none;
    &:hover {
        text-decoration: underline;
    }
`;

export default function Custom404() {
    return(
        <main className="flex flex-col bg-white min-h-screen container mx-auto">
            <div className="flex-1 flex flex-col bg-white p-8 justify-center text-center text-4xl">
            <h1>404 - Page Not Found</h1>
            <Link href="https://blog.pawnalyze.com/" passHref={true}><StyledLink>Looking for the older version of Pawnalyze? Click here.</StyledLink></Link>
            </div>
        </main>
    )
  }