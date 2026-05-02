import { useEffect, useState } from 'react'
import api from '../../services/api'
import UserLayout from '../../components/UserLayout'

const badge = (s) => {
  const m = {menunggu:{l:'Menunggu',c:'bg-yellow-100 text-yellow-700'},diproses:{l:'Diproses',c:'bg-blue-100 text-blue-700'},selesai:{l:'Selesai',c:'bg-green-100 text-green-700'},ditolak:{l:'Ditolak',c:'bg-red-100 text-red-700'}}
  const x = m[s]||m['menunggu']
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${x.c}`}>{x.l}</span>
}

export default function UserPermohonan() {
  const [list, setList] = useState([])
  const [jenisLayanan, setJenisLayanan] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedJenis, setSelectedJenis] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ id_jenis_layanan:'', keterangan:'', file_ktp:null, file_kk:null, file_pendukung:null })
  const [loading, setLoading] = useState(false)

  const fetchData = () => api.get('/permohonan').then(r => setList(r.data.data||[]))
  useEffect(() => {
    fetchData()
    api.get('/jenis-layanan').then(r => setJenisLayanan(r.data.data||[]))
  }, [])

  const pickJenis = (j) => { setSelectedJenis(j); setForm({...form, id_jenis_layanan: j.id}) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const fd = new FormData()
      fd.append('id_jenis_layanan', form.id_jenis_layanan)
      fd.append('keterangan', form.keterangan)
      if (form.file_ktp) fd.append('file_ktp', form.file_ktp)
      if (form.file_kk) fd.append('file_kk', form.file_kk)
      if (form.file_pendukung) fd.append('file_pendukung', form.file_pendukung)
      await api.post('/permohonan', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setShowForm(false); setSelectedJenis(null)
      setForm({ id_jenis_layanan:'', keterangan:'', file_ktp:null, file_kk:null, file_pendukung:null })
      fetchData()
    } catch (err) { alert(err.response?.data?.error||'Gagal mengajukan permohonan') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus permohonan ini?')) return
    await api.delete(`/permohonan/${id}`); fetchData()
  }

  return (
    <UserLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">📋 Permohonan Layanan</h1>
          <button onClick={()=>setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            + Ajukan Permohonan
          </button>
        </div>
        {list.length===0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-5xl mb-3">📋</p>
            <p className="text-gray-500">Belum ada permohonan layanan. Klik tombol di atas untuk mengajukan permohonan.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map(p=>(
              <div key={p.id} className="bg-white rounded-xl shadow p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">{badge(p.status)}<span className="text-xs text-gray-400">{new Date(p.tgl_permohonan).toLocaleDateString('id-ID')}</span></div>
                    <h3 className="font-semibold text-gray-800">{p.jenis_layanan?.nama_layanan}</h3>
                    {p.keterangan && <p className="text-sm text-gray-500 mt-1">{p.keterangan}</p>}
                    {p.catatan_petugas && <p className="text-sm text-blue-600 mt-1 bg-blue-50 px-3 py-1 rounded">💬 {p.catatan_petugas}</p>}
                    {p.file_hasil && <a href={`http://localhost:8080/${p.file_hasil}`} target="_blank" rel="noreferrer" className="text-green-600 text-xs hover:underline mt-1 block">📥 Download Hasil</a>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={()=>setSelected(p)} className="text-blue-600 border border-blue-200 px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-50">Detail</button>
                    {p.status==='menunggu' && <button onClick={()=>handleDelete(p.id)} className="text-red-600 border border-red-200 px-3 py-1.5 rounded text-xs font-medium hover:bg-red-50">Hapus</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form Permohonan */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="font-bold text-gray-800">Ajukan Permohonan Layanan</h2>
              <button onClick={()=>setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Pilih Jenis Layanan */}
              {!selectedJenis ? (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Pilih Jenis Layanan</p>
                  <div className="grid grid-cols-1 gap-3">
                    {jenisLayanan.map(j=>(
                      <button key={j.id} type="button" onClick={()=>pickJenis(j)}
                        className="text-left border border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:bg-blue-50 transition">
                        <p className="font-medium text-gray-800">{j.nama_layanan}</p>
                        <p className="text-xs text-gray-500 mt-1">{j.deskripsi}</p>
                        <p className="text-xs text-blue-600 mt-1">⏱ Estimasi {j.estimasi_hari} hari kerja</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-blue-800">{selectedJenis.nama_layanan}</p>
                        <p className="text-xs text-blue-600 mt-1">⏱ Estimasi {selectedJenis.estimasi_hari} hari kerja</p>
                      </div>
                      <button type="button" onClick={()=>{setSelectedJenis(null);setForm({...form,id_jenis_layanan:''})}} className="text-xs text-gray-400 hover:text-gray-600">Ganti</button>
                    </div>
                    {selectedJenis.syarat && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs font-semibold text-blue-800 mb-1">📋 Persyaratan:</p>
                        <p className="text-xs text-blue-700 whitespace-pre-line">{selectedJenis.syarat}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Keterangan Tambahan</label>
                    <textarea value={form.keterangan} onChange={e=>setForm({...form,keterangan:e.target.value})} rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Jelaskan keperluan Anda..."/>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Upload Dokumen</p>
                    {[
                      {label:'Foto KTP *', key:'file_ktp', required:true},
                      {label:'Foto Kartu Keluarga *', key:'file_kk', required:true},
                      {label:'Dokumen Pendukung (opsional)', key:'file_pendukung', required:false},
                    ].map(({label,key,required})=>(
                      <div key={key}>
                        <label className="text-xs text-gray-600 mb-1 block">{label}</label>
                        <input type="file" accept="image/*,.pdf" required={required}
                          onChange={e=>setForm({...form,[key]:e.target.files[0]})} className="text-sm text-gray-500"/>
                      </div>
                    ))}
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg text-sm font-medium transition">
                    {loading ? 'Mengajukan...' : 'Ajukan Permohonan'}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="font-bold text-gray-800">Detail Permohonan</h2>
              <button onClick={()=>setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              {badge(selected.status)}
              <p><span className="text-gray-500">Jenis:</span> <strong>{selected.jenis_layanan?.nama_layanan}</strong></p>
              <p><span className="text-gray-500">Tgl Permohonan:</span> {new Date(selected.tgl_permohonan).toLocaleString('id-ID')}</p>
              {selected.keterangan && <p><span className="text-gray-500">Keterangan:</span> {selected.keterangan}</p>}
              {selected.catatan_petugas && <div className="bg-blue-50 rounded-lg p-3"><p className="text-xs text-blue-600 font-medium mb-1">Catatan Petugas:</p><p>{selected.catatan_petugas}</p></div>}
              {selected.file_hasil && (
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-700 font-medium mb-1">✅ Dokumen Hasil Tersedia</p>
                  <a href={`http://localhost:8080/${selected.file_hasil}`} target="_blank" rel="noreferrer" className="text-green-600 text-sm hover:underline font-medium">📥 Download Dokumen Hasil</a>
                </div>
              )}
              {selected.tgl_selesai && <p className="text-xs text-gray-400">Selesai: {new Date(selected.tgl_selesai).toLocaleString('id-ID')}</p>}
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  )
}
