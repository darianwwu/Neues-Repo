import { HStack, Image, Spacer, Text, VStack } from '@chakra-ui/react';
import { GlassCard } from './GlassCard';
import type { WeatherNow } from '@/lib/types';

export function WeatherCard({ weather }: { weather: WeatherNow | null }) {
  if (!weather) {
    return (
      <GlassCard p={4}>
        <Text fontWeight={700}>Wetter</Text>
        <Text fontSize="sm" color="gray.600">
          ...lädt
        </Text>
      </GlassCard>
    );
  }

  const iconUrl = weather.icon
    ? `https://openweathermap.org/img/wn/${weather.icon}@2x.png`
    : null;

  return (
    <GlassCard p={4}>
      <HStack align="start" spacing={3}>
        {iconUrl ? <Image src={iconUrl} alt={weather.description} boxSize="56px" /> : null}
        <VStack align="start" spacing={0}>
          <Text fontWeight={700}>{weather.locationName}</Text>
          <Text fontSize="sm" color="gray.600">
            {weather.description}
          </Text>
        </VStack>
        <Spacer />
        <VStack align="end" spacing={0}>
          <Text fontSize="2xl" fontWeight={800} letterSpacing="-0.04em">
            {weather.tempC}°
          </Text>
          <Text fontSize="xs" color="gray.600">
            fühlt sich an wie {weather.feelsLikeC}°
          </Text>
        </VStack>
      </HStack>

      <HStack mt={3} spacing={4} color="gray.600" fontSize="sm">
        <Text>💨 {Math.round(weather.windMs)} m/s</Text>
        <Text>💧 {Math.round(weather.humidity)}%</Text>
        {weather.rainMm1h != null ? <Text>🌧️ {weather.rainMm1h} mm</Text> : null}
        {weather.snowMm1h != null ? <Text>❄️ {weather.snowMm1h} mm</Text> : null}
      </HStack>
    </GlassCard>
  );
}
