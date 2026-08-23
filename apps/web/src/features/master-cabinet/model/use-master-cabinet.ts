'use client'

import { useEffect, useState } from 'react'
import type { MasterProfileView, ServiceView } from '@lustra/contracts'

import {
  pickUpcomingBookings,
  type UpcomingBookingsPick,
} from '@/features/master-cabinet/model/pick-upcoming-bookings'
import { ApiError } from '@/shared/api/http'
import { getMasterCalendar } from '@/shared/api/master-calendar-client'
import { getMasterProfile } from '@/shared/api/master-profile-client'
import { listMasterServices } from '@/shared/api/master-services-client'
import {
  addDaysToYmdDate,
  formatYmdDateInTimeZone,
  MASTER_TIMEZONE,
} from '@/shared/lib/tz'

const UPCOMING_DAYS = 14

type LoadStatus = 'loading' | 'error' | 'success'

export function useMasterCabinet() {
  const [profile, setProfile] = useState<MasterProfileView | null>(null)
  const [profileStatus, setProfileStatus] = useState<LoadStatus>('loading')
  const [profileError, setProfileError] = useState<string | null>(null)
  const [services, setServices] = useState<ServiceView[]>([])
  const [upcomingBookings, setUpcomingBookings] =
    useState<UpcomingBookingsPick | null>(null)
  const [calendarStatus, setCalendarStatus] = useState<LoadStatus>('loading')

  useEffect(() => {
    let cancelled = false

    const loadProfile = async () => {
      setProfileStatus('loading')
      setProfileError(null)

      try {
        const [nextProfile, serviceList] = await Promise.all([
          getMasterProfile(),
          listMasterServices().catch(() => ({ services: [] as ServiceView[] })),
        ])

        if (cancelled) {
          return
        }

        setProfile(nextProfile)
        setServices(serviceList.services)
        setProfileStatus('success')
      } catch (error) {
        if (cancelled) {
          return
        }

        setProfile(null)
        setProfileStatus('error')
        setProfileError(
          error instanceof ApiError
            ? error.message
            : 'Не удалось загрузить профиль мастера',
        )
      }
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!profile) {
      return
    }

    let cancelled = false
    const range = buildCalendarRange()

    const loadCalendar = async () => {
      setCalendarStatus('loading')

      try {
        const response = await getMasterCalendar(range.from, range.to)

        if (cancelled) {
          return
        }

        if (!response) {
          setUpcomingBookings(null)
          setCalendarStatus('error')

          return
        }

        setUpcomingBookings(
          pickUpcomingBookings(response.slots, response.exceptions, Date.now()),
        )
        setCalendarStatus('success')
      } catch {
        if (cancelled) {
          return
        }

        setUpcomingBookings(null)
        setCalendarStatus('error')
      }
    }

    void loadCalendar()

    return () => {
      cancelled = true
    }
  }, [profile])

  return {
    profile: profile ?? undefined,
    profileError,
    isProfileLoading: profileStatus === 'loading',
    services,
    upcomingBookings,
    isCalendarLoading: calendarStatus === 'loading',
    setProfile,
  }
}

function buildCalendarRange() {
  const from = formatYmdDateInTimeZone(new Date(), MASTER_TIMEZONE)
  const to = addDaysToYmdDate(from, UPCOMING_DAYS)

  return { from, to }
}
