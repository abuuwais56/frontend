import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nik: '', name: '', email: '', username: '', password: '',
    jenis_kelamin: 'Laki-laki', telp: '', alamat: '', rt: '', rw: '',
    kode_pos: '', province_id: '', regency_id: '', district_id: '', village_id: ''
  })
  const [provinces, setProvinces] = useState([])
  const [regencies, setRegencies] = useState([])
  const [districts, setDistricts] = useState([])
  const [villages, setVillages] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { api.get('/provinces').then(r => setProvinces(r.data.data)) }, [])
  useEffect(() => {
    if (form.province_id) api.get(`/regencies?province_id=${form.province_id}`).then(r => setRegencies(r.data.data))
  }, [form.province_id])
  useEffect(() => {
    if (form.regency_id) api.get(`/districts?regency_id=${form.regency_id}`).then(r => setDistricts(r.data.data))
  }, [form.regency_id])
  useEffect(() => {
    if (form.district_id) api.get(`/villages?district_id=${form.district_id}`).then(r => setVillages(r.data.data))
  }, [form.district_id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Registrasi gagal')
    } finally {
      setLoading(false)
    }
  }

  const input = (label, key, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        required
      />
    </div>
  )

  const select = (label, key, options, onChange) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={form[key]}
        onChange={e => { setForm({ ...form, [key]: e.target.value }); onChange && onChange(e.target.value) }}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        required
      >
        <option value="">-- Pilih --</option>
        {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 py-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Daftar Akun Baru</h1>
          <p className="text-gray-500 mt-1">Isi data diri Anda dengan lengkap</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="font-semibold text-gray-700 border-b pb-2">Data Akun</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {input('NIK (16 digit)', 'nik', 'text', '3275...')}
            {input('Nama Lengkap', 'name', 'text', 'Nama Anda')}
            {input('Email', 'email', 'email', 'email@gmail.com')}
            {input('Username', 'username', 'text', 'username')}
            {input('Password', 'password', 'password')}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
              <select
                value={form.jenis_kelamin}
                onChange={e => setForm({ ...form, jenis_kelamin: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option>Laki-laki</option>
                <option>Perempuan</option>
              </select>
            </div>
          </div>

          <h2 className="font-semibold text-gray-700 border-b pb-2 pt-2">Data Kontak & Alamat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {input('No. Telepon', 'telp', 'tel', '08xxxxxxxxxx')}
            {input('Alamat', 'alamat', 'text', 'Jl. ...')}
            {input('RT', 'rt', 'text', '001')}
            {input('RW', 'rw', 'text', '010')}
            {input('Kode Pos', 'kode_pos', 'text', '40xxx')}
          </div>

          <h2 className="font-semibold text-gray-700 border-b pb-2 pt-2">Wilayah</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {select('Provinsi', 'province_id', provinces, () => setForm(f => ({ ...f, regency_id: '', district_id: '', village_id: '' })))}
            {select('Kabupaten/Kota', 'regency_id', regencies, () => setForm(f => ({ ...f, district_id: '', village_id: '' })))}
            {select('Kecamatan', 'district_id', districts, () => setForm(f => ({ ...f, village_id: '' })))}
            {select('Desa/Kelurahan', 'village_id', villages)}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition mt-2"
          >
            {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Sudah punya akun?{' '}
            <a href="/login" className="text-blue-600 hover:underline font-medium">Masuk di sini</a>
          </p>
        </form>
      </div>
    </div>
  )
}
