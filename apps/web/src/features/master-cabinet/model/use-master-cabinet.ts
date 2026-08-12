'use client'

import { useEffect, useState } from 'react'
import type {
  MasterCalendarSlotView,
  MasterProfileView,
} from '@lustra/contracts'

import { pickUpcomingOpenSlots } from '@/features/master-cabinet/model/pick-upcoming-open-slots'
import { ApiError } from '@/shared/api/http'
import { getMasterCalendar } from '@/shared/api/master-calendar-client'
import { getMasterProfile } from '@/shared/api/master-profile-client'
import {
  addDaysToYmdDate,
  formatYmdDateInTimeZone,
  MASTER_TIMEZONE,
} from '@/shared/lib/tz'

const UPCOMING_DAYS = 7
const UPCOMING_LIMIT = 6

type LoadStatus = 'loading' | 'error' | 'success'

export function useMasterCabinet() {
  const [profile, setProfile] = useState<MasterProfileView | null>(null)
  const [profileStatus, setProfileStatus] = useState<LoadStatus>('loading')
  const [profileError, setProfileError] = useState<string | null>(null)

  const [upcomingSlots, setUpcomingSlots] = useState<MasterCalendarSlotView[]>(
    [],
  )
  const [calendarStatus, setCalendarStatus] = useState<LoadStatus>('loading')

  useEffect(() => {
    let cancelled = false

    const loadProfile = async () => {
      setProfileStatus('loading')
      setProfileError(null)

      try {
        const next = await getMasterProfile()

        if (cancelled) {
          return
        }

        setProfile(next)
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

        setUpcomingSlots(
          pickUpcomingOpenSlots(response.slots, Date.now(), UPCOMING_LIMIT),
        )
        setCalendarStatus('success')
      } catch {
        if (cancelled) {
          return
        }

        setUpcomingSlots([])
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
    upcomingSlots,
    isCalendarLoading: calendarStatus === 'loading',
  }
}

function buildCalendarRange() {
  const from = formatYmdDateInTimeZone(new Date(), MASTER_TIMEZONE)
  const to = addDaysToYmdDate(from, UPCOMING_DAYS)

  return { from, to }
}
