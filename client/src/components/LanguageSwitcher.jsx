import React from 'react'
import { useTranslation } from 'react-i18next'

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()

  const change = (e) => {
    i18n.changeLanguage(e.target.value)
    try { localStorage.setItem('lang', e.target.value) } catch {}
  }

  return (
    <select
      aria-label="Language"
      value={i18n.language}
      onChange={change}
      className="rounded border px-2 py-1 text-sm min-w-28
                 border-white/40 bg-white/10 hover:bg-white/20 text-white
                 dark:border-gray-300/30 dark:text-gray-100"
    >
      <option value="en">English</option>
      <option value="hi">हिंदी</option>
      <option value="ta">தமிழ்</option>
    </select>
  )
}

export default LanguageSwitcher


