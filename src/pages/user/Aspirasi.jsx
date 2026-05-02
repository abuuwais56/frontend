import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import api from '../../services/api'
import UserLayout from '../../components/UserLayout'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const SERUA_INDAH_POLYGON = [
  [-6.3050, 106.7180], [-6.3050, 106.7310], [-6.3100, 106.7340],
  [-6.3160, 106.7330], [-6.3200, 106.7290], [-6.3210, 106.7240],
  [-6.3180, 106.7190], [-6.3130, 106.7160], [-6.3080, 106.7165],
  [-6.3050, 106.7180],
]
const CENTER = [-6.3130, 106.7250]

const statusBadge = (s) => {
  const m = { '0': ['Menunggu','bg-yellow-100 text-yellow-700'], proses: ['Diproses','bg-blue-100 text-blue-700'], selesai: ['Selesai','bg-green-100 text-green-700'] }
  const [label, cls] = m[s] || m['0']
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{label}</span>
}

function PinPicker({ onPick }) {
  useMapEvents({ click(e) { onPick(e.latlng) } })
  return null
}

export default function UserAspirasi() {
  const [list, setList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({
    judul_laporan: '', isi_laporan: '', tgl_kejadian: '',
    lokasi_kejadian: '', foto: null, latitude: null, longitude: null
  })
  const [loading, setLoading] = useState(false)

  const fetchData = () => api.get('/aspirasi').then(r => setList(r.data.data || []))
  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k, v) })
      await api.post('/aspirasi', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setShowForm(false)
      setForm({ judul_laporan: '', isi_laporan: '', tgl_kejadian: '', lokasi_kejadian: '', foto: null, latitude: null, longitude: null })
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal mengirim aspirasi')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus aspirasi ini?')) return
    await api.delete(`/aspirasi/${id}`)
    fetchData()
  }

  return (
    <UserLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Aspirasi Saya</h1>
            <p className="text-gray-500 text-sm">Sampaikan aspirasi dan pengaduan Anda</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2">
            <span>+</span> Buat Aspirasi
          </button>
        </div>

        {list.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-5xl mb-3">📢</p>
            <p className="text-gray-600 font-medium">Belum ada aspirasi</p>
            <p className="text-gray-400 text-sm mt-1">Klik tombol di atas untuk menyampaikan aspirasi baru</p>
          </div> 
        ) : (
          <div className="space-y-3">
            {list.map(p => (
              <div key={p.id_pengaduan} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {statusBadge(p.status)}
                      <span className="text-xs text-gray-400">{new Date(p.tgl_pengaduan).toLocaleDateString('id-ID')}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 truncate">{p.judul_laporan}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.isi_laporan}</p>
                    <p className="text-xs text-gray-400 mt-1.5">📍 {p.lokasi_kejadian}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setSelected(p)}
                      className="text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-200">
                      Detail
                    </button>
                    {p.status === '0' && (
                      <button onClick={() => handleDelete(p.id_pengaduan)}
                        className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200">
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form Buat Aspirasi */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="font-bold text-gray-800">Buat Aspirasi Baru</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {[
                ['Judul Aspirasi', 'judul_laporan', 'text'],
                ['Tanggal Kejadian', 'tgl_kejadian', 'date'],
              ].map(([label, key, type]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500" required />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Isi Aspirasi</label>
                <textarea value={form.isi_laporan} onChange={e => setForm({ ...form, isi_laporan: e.target.value })}
                  rows={4} placeholder="Ceritakan aspirasi atau pengaduan Anda secara detail..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Keterangan Lokasi Kejadian</label>
                <input value={form.lokasi_kejadian} onChange={e => setForm({ ...form, lokasi_kejadian: e.target.value })}
                  placeholder="Contoh: Jl. Serua Raya No. 5"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500" required />
              </div>

              {/* Map Pin Lokasi */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Pin Lokasi di Peta <span className="text-gray-400 font-normal">(klik pada peta untuk menandai)</span>
                </label>
                <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 220 }}>
                  <MapContainer center={CENTER} zoom={14} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Polygon positions={SERUA_INDAH_POLYGON}
                      pathOptions={{ color: '#059669', fillColor: '#10b981', fillOpacity: 0.15, weight: 2 }} />
                    <PinPicker onPick={ll => setForm(f => ({ ...f, latitude: ll.lat, longitude: ll.lng }))} />
                    {form.latitude && form.longitude && (
                      <Marker position={[form.latitude, form.longitude]} />
                    )}
                  </MapContainer>
                </div>
                {form.latitude && (
                  <p className="text-xs text-emerald-600 mt-1">
                    ✅ Lokasi dipilih: {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Foto Pendukung (opsional)</label>
                <input type="file" accept="image/*" onChange={e => setForm({ ...form, foto: e.target.files[0] })}
                  className="w-full text-sm text-gray-500 border border-gray-200 rounded-xl px-3 py-2" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-2.5 rounded-xl text-sm font-semibold transition">
                {loading ? 'Mengirim...' : 'Kirim Aspirasi'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="font-bold text-gray-800">Detail Aspirasi</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex gap-2">{statusBadge(selected.status)}</div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="font-semibold text-gray-800">{selected.judul_laporan}</p>
                <p className="text-gray-600">{selected.isi_laporan}</p>
                <p className="text-gray-500 text-xs">📍 {selected.lokasi_kejadian}</p>
                <p className="text-gray-400 text-xs">📅 {new Date(selected.tgl_kejadian).toLocaleDateString('id-ID')}</p>
              </div>
              {selected.foto && (
                <img src={`http://localhost:8080/${selected.foto}`} alt="foto" className="rounded-xl w-full object-cover max-h-48" />
              )}
              {selected.tanggapan?.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-700 mb-2">Tanggapan Petugas</p>
                  {selected.tanggapan.map(t => (
                    <div key={t.id_tanggapan} className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-2">
                      <p className="font-semibold text-emerald-800 text-xs">{t.petugas?.nama_petugas}</p>
                      <p className="text-gray-700 mt-1">{t.tanggapan}</p>
                      {t.file_bukti && (
                        <a href={`http://localhost:8080/${t.file_bukti}`} target="_blank" rel="noreferrer"
                          className="text-emerald-600 text-xs underline mt-1 block">📎 Lihat bukti penanganan</a>
                      )}
                      <p className="text-gray-400 text-xs mt-1">{new Date(t.tgl_tanggapan).toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  )
}
