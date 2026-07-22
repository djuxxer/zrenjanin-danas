'use client'

import { useEffect, useState } from 'react'
import { Cloud, Sun, CloudRain, CloudSnow, CloudFog } from 'lucide-react'

const LAT = 45.3778
const LON = 20.3897

function weatherFromCode(code: number): { label: string; Icon: typeof Cloud } {
  if (code === 0) return { label: 'vedro', Icon: Sun }
  if ([1, 2, 3].includes(code)) return { label: 'oblačno', Icon: Cloud }
  if ([45, 48].includes(code)) return { label: 'magla', Icon: CloudFog }
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: 'kiša', Icon: CloudRain }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'sneg', Icon: CloudSnow }
  if ([95, 96, 99].includes(code)) return { label: 'grmljavina', Icon: CloudRain }
  return { label: 'promenljivo', Icon: Cloud }
}

export interface WeatherData {
  temp: number
  label: string
  humidity: number
  windSpeed: number
  Icon: typeof Cloud
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadWeather() {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Europe%2FBelgrade`
        )
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (cancelled) return

        const { label, Icon } = weatherFromCode(data.current.weather_code)
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          label,
          humidity: Math.round(data.current.relative_humidity_2m),
          windSpeed: Math.round(data.current.wind_speed_10m),
          Icon,
        })
      } catch {
        if (!cancelled) setError(true)
      }
    }

    loadWeather()
    const interval = setInterval(loadWeather, 30 * 60 * 1000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return { weather, error }
}
