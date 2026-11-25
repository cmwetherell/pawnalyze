import { Section } from '@/components/layout/Section';
import { Logo, LogoRow, type LogoItem } from '@/components/ui/LogoRow';
import { Quote } from '@/components/ui/Quote';
import { Row, Rows } from '@/components/ui/Rows';

const NYT: LogoItem = { src: '/img/nyt-logo.svg', alt: 'The New York Times', width: 114, height: 18 };
const NPR: LogoItem = { src: '/img/npr-logo.svg', alt: 'NPR', width: 64, height: 32, colour: true };
const ALSO: LogoItem[] = [
  { src: '/img/japantimes-logo.svg', alt: 'The Japan Times', width: 138, height: 20 },
  { src: '/img/gulfnews-logo.svg', alt: 'Gulf News', width: 152, height: 18 },
  { src: '/img/deccanherald-logo.svg', alt: 'Deccan Herald', width: 112, height: 14 },
];

export function Press() {
  return (
    <Section title="In the press">
      <Quote
        logo={NYT}
        text="“Statistical analysis by Pawnalyze showed that Mr. Niemann had consistently outperformed his rating strength to an astonishing degree.”"
        cite="“The Chess World Isn’t Ready for a Cheating Scandal,” Sept. 2022"
      />
      <Rows label="Also in the press" className="mt-12">
        <Row
          lead={<Logo logo={NPR} />}
          title="Weekend Edition Saturday with Scott Simon, Sept. 2022"
          meta="Pawnalyze founder Caleb Wetherell was interviewed on Weekend Edition Saturday about the Niemann–Carlsen cheating controversy and his statistical analysis of Niemann’s unprecedented rating rise."
        />
      </Rows>
      <LogoRow className="mt-8" label="Also seen in" logos={ALSO} />
    </Section>
  );
}
