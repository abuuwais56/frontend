import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '', role: 'masyarakat' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const data = await login(form.username, form.password, form.role)
      if (data.role === 'admin' || data.role === 'petugas') navigate('/admin/dashboard')
      else navigate('/user/aspirasi')
    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-teal-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">🏛️</span>
          </div>
          <h1 className="text-white text-xl font-bold leading-tight">Sistem Informasi Pusat Layanan</h1>
          <h1 className="text-white text-xl font-bold leading-tight">dan Aspirasi Masyarakat Berbasis Web</h1>
          <div className="mt-3 bg-white/20 rounded-full px-4 py-1.5 inline-block">
            <p className="text-white text-sm font-semibold">📍 Kelurahan Serua Indah, Ciputat</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-5 text-center">Masuk ke Akun Anda</h2>
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            {['masyarakat','petugas'].map(r => (
              <button key={r} onClick={() => setForm({...form, role: r})}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${form.role===r ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}>
                {r==='masyarakat' ? '👤 Masyarakat' : '🛡️ Petugas / Admin'}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Masukkan username" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Masukkan password" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            Belum punya akun? <a href="/register" className="text-blue-600 hover:underline font-medium">Daftar sekarang</a>
          </p>
        </div>
        <p className="text-center text-blue-100 text-xs mt-4">© 2024 Kelurahan Serua Indah · Kec. Ciputat · Kota Tangerang Selatan</p>
      </div>
    </div>
  )
}
