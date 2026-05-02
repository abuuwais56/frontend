import { useEffect, useState } from 'react'
import api from '../../services/api'
import AdminLayout from '../../components/AdminLayout'

export default function AdminMasyarakat() {
  const [list, setList] = useState([])

  useEffect(() => {
    api.get('/masyarakat').then(r => setList(r.data.data || []))
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Data Masyarakat</h1>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">NIK</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Nama</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Username</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">No. HP</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Jenis Kelamin</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Tidak ada data</td></tr>
              ) : list.map(m => (
                <tr key={m.nik} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{m.nik}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{m.name}</td>
                  <td className="px-4 py-3 text-gray-600">{m.username}</td>
                  <td className="px-4 py-3 text-gray-600">{m.email}</td>
                  <td className="px-4 py-3 text-gray-600">{m.telp}</td>
                  <td className="px-4 py-3 text-gray-600">{m.jenis_kelamin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
