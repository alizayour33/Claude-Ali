import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="py-32 text-center">
      <Container>
        <p className="text-grad font-display text-8xl font-extrabold">404</p>
        <h1 className="mt-4 text-3xl font-extrabold">This page melted away</h1>
        <p className="mt-3 text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/">Go home</ButtonLink>
          <ButtonLink href="/machines" variant="ghost">See machines</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
