import { useEffect } from 'react'

import { Navbar } from '@/components/site/Navbar'
import { Footer } from '@/components/site/Footer'
import { Hero } from '@/sections/Hero'
import { Thesis } from '@/sections/Thesis'
import { Protocol } from '@/sections/Protocol'
import { Settlement } from '@/sections/Settlement'
import { Capabilities } from '@/sections/Capabilities'
import { Closing } from '@/sections/Closing'
import { Faq } from '@/sections/Faq'
import { site } from '@/config/brand'

export default function Home() {
  useEffect(() => {
    document.title = site.title
  }, [])

  return (
    <div className="grain">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:rounded-full focus:bg-olive focus:px-5 focus:py-2.5 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main">
        <Hero />
        <Thesis />
        <Protocol />
        <Settlement />
        <Capabilities />
        <Faq />
        <Closing />
      </main>

      <Footer />
    </div>
  )
}
