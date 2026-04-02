import { Nav } from '@/components/nav';
import { Hero } from '@/components/hero';
import { Problem } from '@/components/problem';
import { Solution } from '@/components/solution';
import { HowItWorks } from '@/components/how-it-works';
import { TrustControl } from '@/components/trust-control';
import { UseCases } from '@/components/use-cases';
import { CtaSection } from '@/components/cta-section';
import { Footer } from '@/components/footer';

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <HowItWorks />
        <TrustControl />
        <UseCases />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
