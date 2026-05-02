import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Polygon, Popup, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import api from '../../services/api'
import AdminLayout from '../../components/AdminLayout'

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Koordinat polygon batas wilayah Kelurahan Serua Indah, Ciputat
const SERUA_INDAH_POLYGON = [
  [-6.3050, 106.7180],
  [-6.3050, 106.7310],
  [-6.3100, 106.7340],
  [-6.3160, 106.7330],
  [-6.3200, 106.7290],
  [-6.3210, 106.7240],
  [-6.3180, 106.7190],
  [-6.3130, 106.7160],
  [-6.3080, 106.7165],
  [-6.3050, 106.7180],
]

const CENTER = [-6.3130, 106.7250]

const StatCard = ({ label, value, color, icon }) => (
  <div className={`bg-white rounded-2xl shadow-sm p-5 border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value ?? '-'}</p>
      </div>
      <span className="text-3xl opacity-80">{icon}</span>
    </div>
  </div>
)

const statusBadge = (status) => {
  const map = {
    '0': { label: 'Menunggu', cls: 'bg-yellow-100 text-yellow-700' },
    proses: { label: 'Diproses', cls: 'bg-blue-100 text-blue-700' },
    selesai: { label: 'Selesai', cls: 'bg-green-100 text-green-700' },
  }
  const s = map[status] || map['0']
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>
}

function MapBounds({ polygon }) {
  const map = useMap()
  useEffect(() => {
    if (polygon.length) {
      const bounds = L.latLngBounds(polygon)
      map.fitBounds(bounds, { padding: [30, 30] })
    }
  }, [polygon, map])
  return null
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [kelurahan, setKelurahan] = useState(null)
  const [showKelurahan, setShowKelurahan] = useState(false)
  const [aspirasi, setAspirasi] = useState([])

  useEffect(() => {
    api.get('/dashboard').then(r => setStats(r.data))
    api.get('/kelurahan').then(r => setKelurahan(r.data.data))
    api.get('/aspirasi').then(r => setAspirasi((r.data.data || []).filter(a => a.latitude && a.longitude)))
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm">Kelurahan Serua Indah — Kecamatan Ciputat</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Aspirasi" value={stats?.total_pengaduan} color="border-emerald-500" icon="📢" />
          <StatCard label="Menunggu" value={stats?.menunggu} color="border-yellow-500" icon="⏳" />
          <StatCard label="Diproses" value={stats?.proses} color="border-blue-500" icon="🔄" />
          <StatCard label="Selesai" value={stats?.selesai} color="border-green-500" icon="✅" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* MAP */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-800">Peta Wilayah Kelurahan Serua Indah</h2>
                <p className="text-xs text-gray-400">Klik area hijau untuk info kelurahan · Marker = lokasi aspirasi</p>
              </div>
              <button onClick={() => setShowKelurahan(true)}
                className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-100 transition">
                Info Kelurahan
              </button>
            </div>
            <div style={{ height: 380 }}>
              <MapContainer center={CENTER} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl>
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapBounds polygon={SERUA_INDAH_POLYGON} />

                {/* Polygon wilayah */}
                <Polygon
                  positions={SERUA_INDAH_POLYGON}
                  pathOptions={{ color: '#059669', fillColor: '#10b981', fillOpacity: 0.25, weight: 2.5 }}
                  eventHandlers={{ click: () => setShowKelurahan(true) }}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold text-emerald-700">Kelurahan Serua Indah</p>
                      <p className="text-gray-500">Kecamatan Ciputat, Tangerang Selatan</p>
                      {kelurahan && <p className="mt-1">👥 {kelurahan.jumlah_penduduk?.toLocaleString()} jiwa</p>}
                      <button onClick={() => setShowKelurahan(true)}
                        className="mt-2 text-emerald-600 underline text-xs">Lihat detail →</button>
                    </div>
                  </Popup>
                </Polygon>

                {/* Markers aspirasi */}
                {aspirasi.map(a => (
                  <Marker key={a.id_pengaduan} position={[a.latitude, a.longitude]}>
                    <Popup>
                      <div className="text-xs">
                        <p className="font-semibold">{a.judul_laporan}</p>
                        <p className="text-gray-500">{a.lokasi_kejadian}</p>
                        {statusBadge(a.status)}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Aspirasi terbaru */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-base font-bold text-gray-800 mb-3">Aspirasi Terbaru</h2>
              <div className="space-y-2">
                {stats?.recent?.slice(0, 4).map(p => (
                  <div key={p.id_pengaduan} className="flex items-start gap-3 pb-2 border-b last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{p.judul_laporan}</p>
                      <p className="text-xs text-gray-400">{p.masyarakat?.name}</p>
                    </div>
                    {statusBadge(p.status)}
                  </div>
                ))}
              </div>
              <a href="/admin/aspirasi" className="text-emerald-600 text-xs hover:underline mt-3 block">
                Lihat semua →
              </a>
            </div>

            {/* Ringkasan */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-bold text-gray-700 mb-3">Statistik Penanganan</h2>
              <div className="space-y-2">
                {[
                  { label: 'Selesai', val: stats?.selesai, total: stats?.total_pengaduan, color: 'bg-green-500' },
                  { label: 'Diproses', val: stats?.proses, total: stats?.total_pengaduan, color: 'bg-blue-500' },
                  { label: 'Menunggu', val: stats?.menunggu, total: stats?.total_pengaduan, color: 'bg-yellow-400' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">{s.label}</span>
                      <span className="font-semibold text-gray-700">{s.val ?? 0}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className={`${s.color} h-1.5 rounded-full transition-all`}
                        style={{ width: s.total ? `${((s.val ?? 0) / s.total) * 100}%` : '0%' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t flex justify-between text-xs text-gray-500">
                <span>Total Masyarakat</span>
                <span className="font-bold text-gray-700">{stats?.total_masyarakat}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Info Kelurahan */}
      {showKelurahan && kelurahan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-700 rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-white">{kelurahan.nama}</h2>
                <p className="text-emerald-200 text-xs">Kec. {kelurahan.kecamatan} · {kelurahan.kota}</p>
              </div>
              <button onClick={() => setShowKelurahan(false)} className="text-white/70 hover:text-white text-xl">✕</button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Jumlah Penduduk', val: `${kelurahan.jumlah_penduduk?.toLocaleString()} jiwa` },
                  { label: 'Jumlah KK', val: `${kelurahan.jumlah_kk?.toLocaleString()} KK` },
                  { label: 'Luas Wilayah', val: kelurahan.luas_wilayah },
                  { label: 'Kode Pos', val: kelurahan.kode_pos },
                ].map(i => (
                  <div key={i.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-gray-400 text-xs">{i.label}</p>
                    <p className="font-semibold text-gray-800 mt-0.5">{i.val}</p>
                  </div>
                ))}
              </div>

              {kelurahan.visi && (
                <div>
                  <p className="font-semibold text-gray-700 mb-1">🎯 Visi</p>
                  <p className="text-gray-600 bg-emerald-50 rounded-xl p-3">{kelurahan.visi}</p>
                </div>
              )}
              {kelurahan.misi && (
                <div>
                  <p className="font-semibold text-gray-700 mb-1">📌 Misi</p>
                  <p className="text-gray-600 bg-gray-50 rounded-xl p-3 whitespace-pre-line">{kelurahan.misi}</p>
                </div>
              )}
              {kelurahan.sejarah && (
                <div>
                  <p className="font-semibold text-gray-700 mb-1">📖 Sejarah</p>
                  <p className="text-gray-600 bg-gray-50 rounded-xl p-3">{kelurahan.sejarah}</p>
                </div>
              )}
              <div className="border-t pt-3 space-y-1 text-gray-600">
                <p>📍 {kelurahan.alamat_kantor}</p>
                <p>📞 {kelurahan.telp_kantor}</p>
                <p>🕐 {kelurahan.jam_operasional}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
