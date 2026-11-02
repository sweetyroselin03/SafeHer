import React, { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useAppStore } from '../store/useAppStore'

export const App: React.FC = () => {
  const settings = useAppStore(state => state.settings)

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.darkMode])

  return <RouterProvider router={router} />
}

export default App
