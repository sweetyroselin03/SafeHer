import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { WelcomePage } from '../pages/WelcomePage'
import { SOSPage } from '../pages/SOSPage'
import { ContactsPage } from '../pages/ContactsPage'
import { SafetyToolsPage } from '../pages/SafetyToolsPage'
import { FakeCallPage } from '../pages/FakeCallPage'
import { SirenPage } from '../pages/SirenPage'
import { StrobePage } from '../pages/StrobePage'
import { RecorderPage } from '../pages/RecorderPage'
import { EvidencePage } from '../pages/EvidencePage'
import { HistoryPage } from '../pages/HistoryPage'
import { SettingsPage } from '../pages/SettingsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'welcome', element: <WelcomePage /> },
      { path: 'sos', element: <SOSPage /> },
      { path: 'contacts', element: <ContactsPage /> },
      { path: 'tools', element: <SafetyToolsPage /> },
      { path: 'fake-call', element: <FakeCallPage /> },
      { path: 'siren', element: <SirenPage /> },
      { path: 'strobe', element: <StrobePage /> },
      { path: 'recorder', element: <RecorderPage /> },
      { path: 'evidence', element: <EvidencePage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'profile', element: <SettingsPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
