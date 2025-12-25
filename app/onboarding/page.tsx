'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Car } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Profile fields
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postcode, setPostcode] = useState('')
  const [userType, setUserType] = useState<'passenger' | 'driver'>('passenger')

  // Additional driver fields
  const [licenseNumber, setLicenseNumber] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [vehicleReg, setVehicleReg] = useState('')

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Update user metadata to mark onboarding as complete
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          onboarding_complete: true,
          phone_number: phoneNumber,
          address,
          city,
          postcode,
          user_type: userType,
          ...(userType === 'driver' && {
            license_number: licenseNumber,
            vehicle_model: vehicleModel,
            vehicle_registration: vehicleReg,
          }),
        },
      })

      if (updateError) throw updateError

      // Redirect to feed after successful onboarding
      router.push('/feed')
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="h-12 w-12 rounded-lg bg-black flex items-center justify-center">
              <Car className="h-7 w-7 text-taxi-yellow" />
            </div>
            <span className="text-2xl font-bold">TaxiApp</span>
          </div>
        </div>

        {/* Onboarding Form */}
        <div className="bg-white rounded-2xl shadow-lg border p-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to TaxiApp!</h1>
          <p className="text-muted-foreground mb-8">
            Let's get you set up. This will only take a minute.
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleComplete} className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">
                I want to use TaxiApp as a:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUserType('passenger')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    userType === 'passenger'
                      ? 'border-taxi-yellow bg-taxi-yellow/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold mb-1">Passenger</div>
                  <div className="text-sm text-muted-foreground">
                    Book and ride
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('driver')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    userType === 'driver'
                      ? 'border-taxi-yellow bg-taxi-yellow/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold mb-1">Driver</div>
                  <div className="text-sm text-muted-foreground">
                    Drive and earn
                  </div>
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-taxi-yellow focus:border-transparent"
                  placeholder="+44 7700 900000"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium mb-2">
                Address
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-taxi-yellow focus:border-transparent"
                placeholder="123 Main Street"
                disabled={loading}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium mb-2">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-taxi-yellow focus:border-transparent"
                  placeholder="London"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="postcode" className="block text-sm font-medium mb-2">
                  Postcode
                </label>
                <input
                  id="postcode"
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-taxi-yellow focus:border-transparent"
                  placeholder="SW1A 1AA"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Driver-specific fields */}
            {userType === 'driver' && (
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-lg">Driver Information</h3>

                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium mb-2">
                    Driver License Number
                  </label>
                  <input
                    id="licenseNumber"
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    required={userType === 'driver'}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-taxi-yellow focus:border-transparent"
                    placeholder="ABCD123456AB1CD"
                    disabled={loading}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="vehicleModel" className="block text-sm font-medium mb-2">
                      Vehicle Model
                    </label>
                    <input
                      id="vehicleModel"
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      required={userType === 'driver'}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-taxi-yellow focus:border-transparent"
                      placeholder="Toyota Prius"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="vehicleReg" className="block text-sm font-medium mb-2">
                      Vehicle Registration
                    </label>
                    <input
                      id="vehicleReg"
                      type="text"
                      value={vehicleReg}
                      onChange={(e) => setVehicleReg(e.target.value)}
                      required={userType === 'driver'}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-taxi-yellow focus:border-transparent"
                      placeholder="AB12 CDE"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-taxi-yellow hover:bg-taxi-yellow/90 text-black font-semibold"
              disabled={loading}
            >
              {loading ? 'Completing setup...' : 'Complete Setup'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
