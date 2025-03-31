"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  Users,
  FileText,
  CreditCard,
  DollarSign,
  FileSpreadsheet,
  Wallet,
  Activity,
  ParkingMeterIcon as Parking,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
} from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const menuItems = [
    { name: "MOM", icon: <Home className="h-5 w-5" />, path: "/mom" },
    { name: "Integration", icon: <Activity className="h-5 w-5" />, path: "/integration" },
    { name: "Purchase", icon: <CreditCard className="h-5 w-5" />, path: "/purchase" },
    { name: "Service PR/WO", icon: <FileText className="h-5 w-5" />, path: "/service" },
    { name: "Suppliers", icon: <Users className="h-5 w-5" />, path: "/suppliers" },
    { name: "Bill Pay", icon: <FileSpreadsheet className="h-5 w-5" />, path: "/bill-pay" },
    { name: "Advance Salary", icon: <DollarSign className="h-5 w-5" />, path: "/advance-salary" },
    { name: "Other Bills", icon: <FileText className="h-5 w-5" />, path: "/other-bills" },
    { name: "Personal Financial", icon: <Wallet className="h-5 w-5" />, path: "/personal-financial" },
    { name: "Fitness", icon: <Activity className="h-5 w-5" />, path: "/fitness" },
    { name: "CAM Billing", icon: <CreditCard className="h-5 w-5" />, path: "/cam-billing" },
    { name: "Parking", icon: <Parking className="h-5 w-5" />, path: "/parking" },
    { name: "Setup", icon: <Settings className="h-5 w-5" />, path: "/setup" },
    { name: "Settings", icon: <Settings className="h-5 w-5" />, path: "/settings" },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-indigo-600 text-white p-2 rounded-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 z-40 transform ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden`}
      >
        <div className="relative flex flex-col h-full w-64 bg-gradient-to-b from-amber-700 to-indigo-800 text-white shadow-xl overflow-y-auto">
          {/* User Profile Header - Mobile */}
          <div className="p-4 flex items-center justify-between bg-amber-600 text-white border-b border-amber-800">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
                <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <span className="ml-3 font-medium">sham sarkar</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white text-green-600 flex items-center justify-center font-bold">
                P
              </div>
              <button 
                onClick={toggleDarkMode}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center"
              >
                <Moon className={`h-5 w-5 ${isDarkMode ? 'text-indigo-800' : 'text-gray-400'}`} />
              </button>
            </div>
          </div>
          
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">VIBE CONNECT</h2>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center px-4 py-3 text-sm rounded-md ${
                  pathname === item.path ? "bg-white text-indigo-800 font-medium" : "text-white hover:bg-indigo-700"
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm text-white hover:bg-indigo-700 rounded-md w-full"
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
        <div className="absolute inset-0 z-10 bg-gray-600 opacity-75" onClick={() => setIsMobileOpen(false)}></div>
      </div>

      {/* Sidebar for desktop */}
      <div
        className={`hidden md:flex flex-col ${
          isCollapsed ? "w-20" : "w-64"
        } bg-gradient-to-b from-amber-700 to-indigo-800 text-white transition-all duration-300`}
      >
        {/* User Profile Header - Desktop */}
        <div className={`${isCollapsed ? 'p-2' : 'p-4'} flex items-center justify-between bg-amber-600 text-white border-b border-amber-800`}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <span className="ml-3 font-medium">sham sarkar</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-white text-green-600 flex items-center justify-center font-bold">
                  P
                </div>
                <button 
                  onClick={toggleDarkMode}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center"
                >
                  <Moon className={`h-5 w-5 ${isDarkMode ? 'text-indigo-800' : 'text-gray-400'}`} />
                </button>
              </div>
            </>
          ) : (
            <div className="w-10 h-10 rounded-full bg-white mx-auto flex items-center justify-center overflow-hidden">
              <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {!isCollapsed && <h2 className="text-xl font-bold">VIBE CONNECT</h2>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 rounded-full hover:bg-indigo-700">
            {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center px-4 py-3 text-sm rounded-md ${
                pathname === item.path ? "bg-white text-indigo-800 font-medium" : "text-white hover:bg-indigo-700"
              }`}
            >
              {item.icon}
              {!isCollapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm text-white hover:bg-indigo-700 rounded-md w-full"
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </>
  )
}
