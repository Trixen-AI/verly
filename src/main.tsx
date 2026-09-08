import { StrictMode, Suspense, lazy, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router'

import { Preloader } from '@/components/site/Preloader'
import Home from '@/routes/Home'
import Docs from '@/routes/Docs'
import NotFound from '@/routes/NotFound'
import './index.css'

/**
 * The dashboard pulls in wagmi, viem and Reown AppKit, which together are far
 * larger than the rest of the site. Loading it lazily keeps that weight off
 * the marketing and docs routes entirely.
 */
const AppLayout = lazy(() => import('@/routes/app/AppLayout'))
const Overview = lazy(() => import('@/routes/app/Overview'))
const Deposit = lazy(() => import('@/routes/app/Deposit'))
const Transfer = lazy(() => import('@/routes/app/Transfer'))
const Redeem = lazy(() => import('@/routes/app/Redeem'))
const Activity = lazy(() => import('@/routes/app/Activity'))

/** Browsers restore scroll on history nav; a fresh route should start at top. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

/** Shown only while the dashboard chunk is in flight. */
function RouteFallback() {
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas">
      <p className="label-mono">Loading</p>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Preloader />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/docs/:slug" element={<Docs />} />
        <Route
          path="/app"
          element={
            <Suspense fallback={<RouteFallback />}>
              <AppLayout />
            </Suspense>
          }
        >
          <Route index element={<Overview />} />
          <Route path="deposit" element={<Deposit />} />
          <Route path="transfer" element={<Transfer />} />
          <Route path="redeem" element={<Redeem />} />
          <Route path="activity" element={<Activity />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
