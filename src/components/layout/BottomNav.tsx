import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Wrench, Clock, Users, ShieldAlert } from 'lucide-react'

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/tools', label: 'Safety Tools', icon: Wrench },
    { to: '/sos', label: 'SOS', icon: ShieldAlert, isSpecial: true },
    { to: '/history', label: 'History', icon: Clock },
    { to: '/contacts', label: 'Contacts', icon: Users },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 dark:bg-[#1E1423]/95 backdrop-blur-lg border-t border-[#F7DDE7] dark:border-[#3D2336] shadow-lg transition-colors pb-safe">
      <div className="max-w-md mx-auto px-2 flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon

          if (item.isSpecial) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center -mt-6 group focus:outline-none ${
                    isActive ? 'scale-105' : 'hover:scale-105'
                  } transition-transform`
                }
              >
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#E53945] to-[#FF5E6C] text-white flex items-center justify-center shadow-lg shadow-[#E53945]/40 border-4 border-[#FFF9FB] dark:border-[#140D17]">
                  <Icon className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[11px] font-bold text-[#E53945] dark:text-[#FF5260] mt-1">
                  SOS
                </span>
              </NavLink>
            )
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-[#5B214C] dark:text-[#C773B1] font-semibold scale-105'
                    : 'text-[#746B77] dark:text-[#AFA5B4] hover:text-[#5B214C] dark:hover:text-[#F7DDE7]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                  <span className="text-[10px] mt-1">{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
