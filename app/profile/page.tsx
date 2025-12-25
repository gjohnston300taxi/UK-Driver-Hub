'use client'

import { useState, useEffect } from 'react'
import Nav from '@/components/nav'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Phone, MapPin, Car, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUserData({
          email: user.email,
          fullName: user.user_metadata?.full_name || 'Driver',
          phoneNumber: user.user_metadata?.phone_number || 'Not set',
          address: user.user_metadata?.address || 'Not set',
          city: user.user_metadata?.city || 'Not set',
          postcode: user.user_metadata?.postcode || 'Not set',
          userType: user.user_metadata?.user_type || 'passenger',
          role: user.user_metadata?.role || 'user',
          licenseNumber: user.user_metadata?.license_number || 'N/A',
          vehicleModel: user.user_metadata?.vehicle_model || 'N/A',
          vehicleReg: user.user_metadata?.vehicle_registration || 'N/A',
        })
      }
      setLoading(false)
    }

    fetchUserData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Nav />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border p-6 text-center">
              <div className="h-24 w-24 rounded-full bg-taxi-yellow/10 flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-taxi-yellow" />
              </div>
              <h2 className="text-xl font-bold mb-1">{userData?.fullName}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {userData?.email}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-taxi-yellow/10 text-taxi-yellow text-sm font-medium mb-4">
                {userData?.userType === 'driver' ? (
                  <>
                    <Car className="h-4 w-4" />
                    Driver
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4" />
                    Passenger
                  </>
                )}
              </div>
              {userData?.role === 'admin' && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                  <Award className="h-4 w-4" />
                  Admin
                </div>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <InfoRow
                  icon={<Mail className="h-5 w-5" />}
                  label="Email"
                  value={userData?.email || 'Not set'}
                />
                <InfoRow
                  icon={<Phone className="h-5 w-5" />}
                  label="Phone Number"
                  value={userData?.phoneNumber}
                />
                <InfoRow
                  icon={<MapPin className="h-5 w-5" />}
                  label="Address"
                  value={`${userData?.address}, ${userData?.city}, ${userData?.postcode}`}
                />
              </div>
            </div>

            {/* Driver Information (if applicable) */}
            {userData?.userType === 'driver' && (
              <div className="bg-white rounded-xl border p-6">
                <h3 className="text-lg font-semibold mb-4">Driver Information</h3>
                <div className="space-y-4">
                  <InfoRow
                    icon={<Award className="h-5 w-5" />}
                    label="License Number"
                    value={userData?.licenseNumber}
                  />
                  <InfoRow
                    icon={<Car className="h-5 w-5" />}
                    label="Vehicle Model"
                    value={userData?.vehicleModel}
                  />
                  <InfoRow
                    icon={<Car className="h-5 w-5" />}
                    label="Vehicle Registration"
                    value={userData?.vehicleReg}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                >
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="text-taxi-yellow mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="text-sm text-muted-foreground mb-0.5">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  )
}
