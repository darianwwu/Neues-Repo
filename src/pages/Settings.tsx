import { Button, Divider, HStack, Text, VStack, useToast } from '@chakra-ui/react';
import { GlassCard } from '@/components/GlassCard';

export function SettingsPage() {
  const toast = useToast();
  const clearCoords = () => {
    localStorage.removeItem('oo:coords');
    toast({ status: 'success', title: 'Standort zurückgesetzt', description: 'Beim nächsten Laden wird neu gefragt.' });
  };

  return (
    <VStack spacing={4} align="stretch">
      <GlassCard p={5}>
        <Text fontSize="lg" fontWeight={800} mb={2} letterSpacing="-0.02em">
          Einstellungen
        </Text>
        <Divider my={3} />
        <HStack justify="space-between">
          <VStack align="start" spacing={0}>
            <Text fontWeight={700}>Standort für Wetter</Text>
            <Text fontSize="sm" color="gray.600">
              Wird lokal gespeichert (lat/lon) und für die Wetterabfrage verwendet.
            </Text>
          </VStack>
          <Button onClick={clearCoords} variant="outline" size="sm">
            Reset
          </Button>
        </HStack>
      </GlassCard>

      <GlassCard p={5}>
        <Text fontWeight={800} mb={2} letterSpacing="-0.02em">
          Foto-Guide (einheitliche Bilder)
        </Text>
        <VStack align="start" spacing={2} color="gray.700" fontSize="sm">
          <Text>• Immer ähnliches Licht (z.B. Tageslicht am Fenster), neutraler Hintergrund.</Text>
          <Text>• Das Kleidungsstück flach ausbreiten oder aufhängen – möglichst ohne Falten.</Text>
          <Text>• In der App: quadratisch zuschneiden (1:1). Optional: leicht reinzoomen.</Text>
          <Text>• Bonus-Idee: eine einfarbige Decke als „Fotostudio“ nutzen.</Text>
        </VStack>
      </GlassCard>

      <GlassCard p={5}>
        <Text fontWeight={800} mb={2} letterSpacing="-0.02em">
          PWA-Icon
        </Text>
        <Text fontSize="sm" color="gray.700">
          Icons liegen in <b>public/icons</b>. Du kannst sie durch deine eigenen PNGs ersetzen (192 und 512px, gern auch
          maskable).
        </Text>
      </GlassCard>
    </VStack>
  );
}
