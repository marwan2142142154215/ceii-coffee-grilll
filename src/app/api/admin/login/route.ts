import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 })
    }

    const valid = username === 'bembengpunyakuasa' &&
      bcrypt.compareSync(password, '$2b$10$mSeN7VkO/5aMC330nBBrv.V6B/IXsEFIvTP/Vot3Nb1Do8.U5ebk2')

    if (!valid) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })
    }

    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64')

    return NextResponse.json({
      success: true,
      username,
      token,
      expires: Date.now() + 24 * 60 * 60 * 1000,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Terjadi kesalahan server' }, { status: 500 })
  }
}
