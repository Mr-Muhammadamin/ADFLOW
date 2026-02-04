import { useEffect } from 'react'

export function useDarkMode() {
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true'
    if (isDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle('dark')
    localStorage.setItem('darkMode', isDark)
  }

  const isDark = () => document.documentElement.classList.contains('dark')

  return { toggleDarkMode, isDark }
}
