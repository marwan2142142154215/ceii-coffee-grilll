'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Visit } from '@/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#D4A73C', '#e74c3c', '#3498db', '#27ae60', '#9b59b6']

export default function AdminAnalytics() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [filter, setFilter] = useState('today')

  useEffect(() => {
    loadVisits()
    const sub = supabase.channel('admin-analytics').on('postgres_changes', { event: '*', schema: 'public', table: 'visits' }, () => loadVisits()).subscribe()
    return () => { sub.unsubscribe() }
  }, [filter])

  async function loadVisits() {
    let query = supabase.from('visits').select('*').order('timestamp', { ascending: false })
    if (filter === 'today') {
      query = query.gte('timestamp', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
    } else if (filter === '7days') {
      const d = new Date(); d.setDate(d.getDate() - 7)
      query = query.gte('timestamp', d.toISOString())
    } else if (filter === '30days') {
      const d = new Date(); d.setDate(d.getDate() - 30)
      query = query.gte('timestamp', d.toISOString())
    }
    const { data } = await query
    if (data) setVisits(data)
  }

  const deviceData = [
    { name: 'HP', value: visits.filter(v => v.device_type === 'HP').length },
    { name: 'Tablet', value: visits.filter(v => v.device_type === 'Tablet').length },
    { name: 'PC', value: visits.filter(v => v.device_type === 'PC').length },
  ].filter(d => d.value > 0)

  const sourceData = [
    { name: 'QR', value: visits.filter(v => v.source === 'qr').length },
    { name: 'Link', value: visits.filter(v => !v.source || v.source === 'link').length },
    { name: 'Promo', value: visits.filter(v => v.source === 'promo').length },
  ].filter(d => d.value > 0)

  const countryData = Object.entries(
    visits.reduce((acc: Record<string, number>, v) => {
      if (v.negara) acc[v.negara] = (acc[v.negara] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  const dailyData = Object.entries(
    visits.reduce((acc: Record<string, number>, v) => {
      const day = new Date(v.timestamp).toLocaleDateString('id-ID')
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', margin: 0 }}>Analitik Pengunjung</h1>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, outline: 'none' }}>
          <option value="today">Hari Ini</option>
          <option value="7days">7 Hari</option>
          <option value="30days">30 Hari</option>
          <option value="all">Semua</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Pengunjung', value: visits.length, color: '#D4A73C' },
          { label: 'HP', value: visits.filter(v => v.device_type === 'HP').length, color: '#3498db' },
          { label: 'Tablet', value: visits.filter(v => v.device_type === 'Tablet').length, color: '#9b59b6' },
          { label: 'PC', value: visits.filter(v => v.device_type === 'PC').length, color: '#27ae60' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e0ddd5' }}>
            <p style={{ fontSize: 11, color: '#888', margin: '0 0 4px' }}>{s.label}</p>
            <p style={{ fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e0ddd5' }}>
          <h3 style={{ fontSize: 14, fontWeight: 'bold', color: '#333', margin: '0 0 12' }}>Kunjungan Harian</h3>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#D4A73C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: '#aaa', fontSize: 12 }}>Belum ada data</p>}
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e0ddd5' }}>
          <h3 style={{ fontSize: 14, fontWeight: 'bold', color: '#333', margin: '0 0 12' }}>Perangkat</h3>
          {deviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                  {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: '#aaa', fontSize: 12 }}>Belum ada data</p>}
        </div>
      </div>

      <h3 style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 12 }}>Log Pengunjung Terbaru</h3>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e0ddd5', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f8f7f4' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#666' }}>Waktu</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#666' }}>Lokasi</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#666' }}>Device</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#666' }}>Presisi</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#666' }}>Sumber</th>
            </tr>
          </thead>
          <tbody>
            {visits.slice(0, 50).map(v => (
              <tr key={v.id} style={{ borderTop: '1px solid #f0efe8' }}>
                <td style={{ padding: '6px 12px', color: '#555' }}>{new Date(v.timestamp).toLocaleString('id-ID')}</td>
                <td style={{ padding: '6px 12px' }}>{v.kota}, {v.negara}</td>
                <td style={{ padding: '6px 12px' }}>{v.device_type}</td>
                <td style={{ padding: '6px 12px' }}>
                  {v.location_accuracy === 'gps' ? (
                    <span style={{ color: '#27ae60', fontWeight: 'bold' }}>Lokasi presisi</span>
                  ) : (
                    <span style={{ color: '#f39c12' }}>Estimasi dari IP</span>
                  )}
                </td>
                <td style={{ padding: '6px 12px' }}>{v.source || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
