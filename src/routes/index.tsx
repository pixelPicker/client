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
import Header from '../components/Header'
import Footer from '../components/Home/Footer'
export const Route = createFileRoute('/')({ component: App })

function App() {


  return (
    <>
      <Header />
      <Hero />
      <Features />
      <Testimonials />
      <Footer />
    </>
  )
}
