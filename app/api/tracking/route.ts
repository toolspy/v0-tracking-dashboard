import { NextResponse } from 'next/server'
import { sql, type Tracking } from '@/lib/db'
import { nanoid } from 'nanoid'

export async function POST(request: Request) {
  try {
    const { nomor_target } = await request.json()

    if (!nomor_target || typeof nomor_target !== 'string') {
      return NextResponse.json(
        { error: 'Nomor target wajib diisi' },
        { status: 400 }
      )
    }

    const id = nanoid(21)

    const result = await sql`
      INSERT INTO tracking (id, nomor_target)
      VALUES (${id}, ${nomor_target})
      RETURNING *
    `

    const tracking = result[0] as Tracking

    return NextResponse.json({
      success: true,
      data: {
        id: tracking.id,
        linkTarget: `/t/${tracking.id}`,
        linkView: `/view/${tracking.id}`
      }
    })
  } catch (error) {
    console.error('Error creating tracking:', error)
    return NextResponse.json(
      { error: 'Gagal membuat tracking' },
      { status: 500 }
    )
  }
}
