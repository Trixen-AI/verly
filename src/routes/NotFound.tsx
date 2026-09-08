import { Button } from '@/components/ui/button'
import { AppLink } from '@/components/site/AppLink'
import { SlimHeader } from '@/components/site/SlimHeader'

export default function NotFound() {
  return (
    <div className="grain flex min-h-dvh flex-col bg-canvas">
      <SlimHeader />
      <main id="main" className="shell grid flex-1 place-items-center py-24 text-center">
        <div>
          <p className="label-mono">Error 404</p>
          <h1 className="display mt-5 text-[2.5rem] md:text-[3rem]">This page is not here.</h1>
          <p className="mx-auto mt-4 max-w-[44ch] text-[1rem] leading-[1.7] text-ink-soft">
            The link may be out of date, or the page may have moved.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <AppLink href="/">Back to home</AppLink>
            </Button>
            <Button asChild variant="outline">
              <AppLink href="/docs">Read the docs</AppLink>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
