import { Moon, Sun } from 'lucide-react'
import Button from '../ui/Button'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  return (
    <Button
      variant="outline"
      iconOnly
      onClick={toggle}
      aria-label={dark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      title={dark ? 'Mode terang' : 'Mode gelap'}
      style={{ width: 42, height: 42 }}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  )
}
