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
      className="rounded border border-gray-300/20 bg-white/10 hover:bg-white/20 px-2 py-1 text-sm"
    >
      <option value="en">English</option>
      <option value="hi">हिंदी</option>
      <option value="ta">தமிழ்</option>
    </select>
  )
}

export default LanguageSwitcher


