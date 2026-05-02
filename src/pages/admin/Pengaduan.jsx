import { useEffect, useState } from 'react'
import api from '../../services/api'
import AdminLayout from '../../components/AdminLayout'

const statusBadge = (status) => {
  const map = {
    '0': { label: 'Menunggu', cls: 'bg-yellow-100 text-yellow-700' },
    proses: { label: 'Diproses', cls: 'bg-blue-100 text-blue-700' },
    selesai: { label: 'Selesai', cls: 'bg-green-100 text-green-700' },
  }
  const s = map[status] || map['0']
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>
}

export default function AdminPengaduan() {
  const [list, setList] = useState([])
  const [selected, setSelected] = useState(null)
  const [tanggapan, setTanggapan] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchData = () => {
    const params = filterStatus ? `?status=${filterStatus}` : ''
    api.get(`/pengaduan${params}`).then(r => setList(r.data.data || []))
  }

  useEffect(() => { fetchData() }, [filterStatus])

  const openDetail = (p) => {
    setSelected(p)
    setNewStatus(p.status)
    setTanggapan('')
  }

  const handleTanggapan = async () => {
    if (!tanggapan.trim()) return
    setLoading(true)
    try {
      await api.post('/tanggapan', {
        id_pengaduan: selected.id_pengaduan,
        tanggapan,
        status: newStatus,
      })
      fetchData()
      setSelected(null)
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal kirim tanggapan')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus pengaduan ini?')) return
    await api.delete(`/pengaduan/${id}`)
    fetchData()
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengaduan</h1>
          {/* Filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Semua Status</option>
            <option value="0">Menunggu</option>
            <option value="proses">Diproses</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">No</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Judul Laporan</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Pelapor</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Tgl Pengaduan</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Tidak ada data</td></tr>
              ) : list.map((p, i) => (
                <tr key={p.id_pengaduan} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-xs">
                    <div className="truncate">{p.judul_laporan}</div>
                    <div className="text-xs text-gray-400 truncate">{p.isi_laporan}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.masyarakat?.name || p.nik}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(p.tgl_pengaduan).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3">{statusBadge(p.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openDetail(p)}
                        className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-xs font-medium"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => handleDelete(p.id_pengaduan)}
                        className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs font-medium"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Detail Pengaduan</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Pelapor:</span> <span className="font-medium">{selected.masyarakat?.name || selected.nik}</span></div>
                <div><span className="text-gray-500">NIK:</span> <span className="font-medium">{selected.nik}</span></div>
                <div><span className="text-gray-500">Tgl Pengaduan:</span> <span className="font-medium">{new Date(selected.tgl_pengaduan).toLocaleString('id-ID')}</span></div>
                <div><span className="text-gray-500">Tgl Kejadian:</span> <span className="font-medium">{new Date(selected.tgl_kejadian).toLocaleDateString('id-ID')}</span></div>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Judul Laporan</p>
                <p className="font-semibold text-gray-800">{selected.judul_laporan}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Isi Laporan</p>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{selected.isi_laporan}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Lokasi Kejadian</p>
                <p className="text-gray-700">{selected.lokasi_kejadian}</p>
              </div>
              {selected.foto && (
                <div>
                  <p className="text-gray-500 text-sm mb-2">Foto</p>
                  <img src={`http://localhost:8080/${selected.foto}`} alt="foto" className="rounded-lg max-h-48 object-cover" />
                </div>
              )}

              {/* Tanggapan sebelumnya */}
              {selected.tanggapan?.length > 0 && (
                <div>
                  <p className="text-gray-500 text-sm mb-2">Tanggapan Sebelumnya</p>
                  {selected.tanggapan.map(t => (
                    <div key={t.id_tanggapan} className="bg-blue-50 rounded-lg p-3 text-sm mb-2">
                      <p className="font-medium text-blue-800">{t.petugas?.nama_petugas}</p>
                      <p className="text-gray-700 mt-1">{t.tanggapan}</p>
                      <p className="text-gray-400 text-xs mt-1">{new Date(t.tgl_tanggapan).toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Form Tanggapan */}
              <div className="border-t pt-4 space-y-3">
                <p className="font-medium text-gray-800">Kirim Tanggapan</p>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Update Status</label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="0">Menunggu</option>
                    <option value="proses">Diproses</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
                <textarea
                  value={tanggapan}
                  onChange={e => setTanggapan(e.target.value)}
                  placeholder="Tulis tanggapan..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleTanggapan}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition disabled:bg-blue-400"
                >
                  {loading ? 'Mengirim...' : 'Kirim Tanggapan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
