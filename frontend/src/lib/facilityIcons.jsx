import {
  Armchair, Baby, Bath, Car, Check, Coffee, Droplet, GlassWater, Laptop, Lock, Snowflake, Sun, Tv, Waves, Wifi,
} from 'lucide-react'

// Nama ikon di database (kolom facilities.icon) → komponen ikon.
const MAP = {
  snowflake: Snowflake,
  wifi: Wifi,
  bath: Bath,
  droplet: Droplet,
  tv: Tv,
  glass: GlassWater,
  coffee: Coffee,
  waves: Waves,
  sun: Sun,
  desk: Laptop,
  lock: Lock,
  car: Car,
  baby: Baby,
  armchair: Armchair,
}

export const FacilityIcon = ({ name, size = 18 }) => {
  const Icon = MAP[name] ?? Check
  return <Icon size={size} aria-hidden="true" />
}
