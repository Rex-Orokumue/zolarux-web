export type ThemeChoice = 'light' | 'dark' | 'system'
const KEY = 'zlx_theme'

export function getStoredTheme(): ThemeChoice {
  if (typeof localStorage === 'undefined') return 'system'
  const v = localStorage.getItem(KEY)
  return v === 'light' || v === 'dark' ? v : 'system'
}

export function resolveIsDark(choice: ThemeChoice): boolean {
  if (choice === 'dark') return true
  if (choice === 'light') return false
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
}

export function applyTheme(choice: ThemeChoice): void {
  document.documentElement.classList.toggle('dark', resolveIsDark(choice))
}

export function setTheme(choice: ThemeChoice): void {
  if (choice === 'system') localStorage.removeItem(KEY)
  else localStorage.setItem(KEY, choice)
  applyTheme(choice)
}
