import { createFileRoute } from '@tanstack/react-router'
import {
  Zap,
  Server,
  Route as RouteIcon,
  Shield,
  Waves,
  Sparkles,
} from 'lucide-react'
import Hero from '../components/Home/Hero'
import Features from '../components/Home/Features'
import Testimonials from '../components/Home/Testimonials'
import Footer from '../components/Home/Footer'
export const Route = createFileRoute('/')({ component: App })

function App() {


  return (
    <>
      <Hero />
      <Features />
      <Testimonials />
      <Footer />
    </>
  )
}
