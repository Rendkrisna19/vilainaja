import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import './styles/global.css'
import Hero from './components/Hero/Hero'
import About from './components/About/About'
import Gallery from './components/Gallery/Gallery'
import Rooms from './components/Rooms/Rooms'
import Facilities from './components/Facilities/Facilities'
import Testimonials from './components/Testimonials/Testimonials'
import Faq from './components/Faq/Faq'
import Cta from './components/Cta/Cta'
import LeadForm from './components/LeadForm/LeadForm'
import Footer from './components/Footer/Footer'

export default function LandingPage() {
  const { hash } = useLocation()

  // Tautan dari halaman lain (mis. /#kamar) harus menggulir ke section setelah halaman dimuat.
  useEffect(() => {
    if (!hash) return
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 80)
    return () => clearTimeout(t)
  }, [hash])

  return (
    <main>
      <Hero />
      <About />
      <Gallery />
      <Rooms />
      <Facilities />
      <Testimonials />
      <Faq />
      <Cta />
      <LeadForm />
      <Footer />
    </main>
  )
}
