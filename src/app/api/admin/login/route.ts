import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Database belum dikonfigurasi. Atur SUPABASE_URL dan SUPABASE_ANON_KEY di .env.local' }, { status: 500 })
    }

    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 })
    }

    let { data, error } = await supabase
      .from('admin_accounts')
      .select('username, password_hash')
      .eq('username', username)
      .maybeSingle()

    if (error?.message?.includes('relation') && error?.message?.includes('does not exist')) {
      return NextResponse.json({ error: 'Database belum di-setup. Jalankan SQL migration dari src/lib/db-schema.sql di Supabase SQL Editor' }, { status: 500 })
    }

    if (!data) {
      const { count } = await supabase.from('admin_accounts').select('*', { count: 'exact', head: true })
      if (count === 0 && username === 'bembengpunyakuasa') {
        const hash = bcrypt.hashSync('tapitakutistri', 10)
        await supabase.from('admin_accounts').insert({ username: 'bembengpunyakuasa', password_hash: hash })
        data = { username: 'bembengpunyakuasa', password_hash: hash }
      }
    }

    if (!data) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, data.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })
    }

    const token = Buffer.from(`${data.username}:${Date.now()}`).toString('base64')

    return NextResponse.json({
      success: true,
      username: data.username,
      token,
      expires: Date.now() + 24 * 60 * 60 * 1000,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Terjadi kesalahan server' }, { status: 500 })
  }
}
