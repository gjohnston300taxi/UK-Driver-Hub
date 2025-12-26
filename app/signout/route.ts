import { signOut } from '@/lib/auth/actions'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  await signOut()
}

export async function GET(request: NextRequest) {
  await signOut()
}
