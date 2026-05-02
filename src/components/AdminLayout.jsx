import { useAuth } from '../context/AuthContext'
import { useNavigate, Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/admin/aspirasi', label: 'Aspirasi Masyarakat', icon: '📢' },
  { path: '/admin/permohonan', label: 'Permohonan Layanan', icon: '📋' },
  { path: '/admin/masyarakat', label: 'Data Masyarakat', icon: '👥' },
]

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const handleLogout = () => { logout(); navigate('/login') }
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-5 border-b bg-gradient-to-br from-blue-600 to-teal-500">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🏛️</span>
            <div>
              <p className="text-white font-bold text-sm">SILAYAM</p>
              <p className="text-blue-100 text-xs">Serua Indah</p>
            </div>
          </div>
          <p className="text-blue-100 text-xs mt-1">Pusat Layanan & Aspirasi Masyarakat</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                location.pathname === item.path
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.nama_petugas?.[0] || 'A'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.nama_petugas}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.roles}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full text-left text-sm text-red-500 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition">
            🚪 Keluar
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}
