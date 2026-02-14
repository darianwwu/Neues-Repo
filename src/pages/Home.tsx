import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Alert, AlertIcon, Button, HStack, Icon, Spacer, Text, VStack, useToast } from '@chakra-ui/react';
import { RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ClothingItem, Outfit, WeatherNow, WearHistory } from '@/lib/types';
import { acceptOutfit, getWearHistoryForDay, listClothingItems, rateWearHistory } from '@/lib/db';
import { fetchWeatherNow, getCoordsFromBrowser } from '@/lib/weather';
import { generateOutfit, outfitIsComplete } from '@/lib/outfitEngine';
import { OutfitCard } from '@/components/OutfitCard';
import { WeatherCard } from '@/components/WeatherCard';
import { EmptyState } from '@/components/EmptyState';
import { GlassCard } from '@/components/GlassCard';

const QUIPS = [
  'Heute schon stylisch gewesen? Gleich bist du es.',
  'Mode ist wie Pizza: selbst wenn’s schiefgeht, ist’s lecker.',
  'Dein Schrank hat gesprochen – ich übersetze nur.',
  'Wenn du zweifelst: Accessoire drauf. Problem gelöst.',
  'Du bist der Main Character. Das Outfit auch.',
  'Outfit-Orakel sagt: heute wird gut.'
];

function getGreeting() {
  const h = dayjs().hour();
  if (h < 11) return 'Guten Morgen';
  if (h < 17) return 'Guten Tag';
  if (h < 22) return 'Guten Abend';
  return 'Gute Nacht';
}

function pickDailyQuip() {
  const seed = Number(dayjs().format('YYYYDDD')); // deterministic per day
  return QUIPS[seed % QUIPS.length];
}

export function HomePage({ userId }: { userId: string }) {
  const toast = useToast();
  const nav = useNavigate();
  const today = dayjs().format('YYYY-MM-DD');

  const [items, setItems] = useState<ClothingItem[]>([]);
  const [weather, setWeather] = useState<WeatherNow | null>(null);
  const [historyToday, setHistoryToday] = useState<WearHistory | null>(null);
  const [suggestion, setSuggestion] = useState<Outfit | null>(null);
  const [busy, setBusy] = useState(false);
  const [warn, setWarn] = useState<string | null>(null);

  const greeting = useMemo(() => getGreeting(), []);
  const quip = useMemo(() => pickDailyQuip(), []);

  const accepted = Boolean(historyToday);
  const outfit = accepted ? (historyToday?.outfit_json as Outfit) : suggestion;

  const load = async () => {
    setWarn(null);
    setBusy(true);
    try {
      const [cl, hist] = await Promise.all([
        listClothingItems(userId),
        getWearHistoryForDay(userId, today)
      ]);
      setItems(cl);
      setHistoryToday(hist);
    } catch (e: any) {
      setWarn(e?.message ?? String(e));
    }

    try {
      const coords = await getCoordsFromBrowser();
      const w = await fetchWeatherNow(coords);
      setWeather(w);
    } catch (e: any) {
      // Weather is nice-to-have; keep app usable.
      setWeather(null);
      toast({ status: 'warning', title: 'Wetter nicht verfügbar', description: e?.message ?? String(e) });
    }
    setBusy(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (accepted) return;
    if (items.length === 0) return;
    if (!suggestion) {
      setSuggestion(generateOutfit(items, weather, today));
      return;
    }
    if (!outfitIsComplete(suggestion)) {
      setSuggestion(generateOutfit(items, weather, today));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, weather, accepted]);

  const regenerate = () => {
    if (!items.length) return;
    setSuggestion(generateOutfit(items, weather, today));
  };

  const doAccept = async () => {
    if (!outfit) return;
    setBusy(true);
    try {
      const h = await acceptOutfit(userId, outfit);
      setHistoryToday(h);
      toast({ status: 'success', title: 'Eingetragen', description: 'Wird in der History gespeichert.' });
    } catch (e: any) {
      toast({ status: 'error', title: 'Konnte nicht speichern', description: e?.message ?? String(e) });
    } finally {
    setBusy(false);
    }
  };

  const doRate = async (v: number) => {
    if (!historyToday) return;
    setHistoryToday({ ...historyToday, rating: v });
    try {
      await rateWearHistory(userId, historyToday.id, v);
    } catch (e: any) {
      toast({ status: 'error', title: 'Rating konnte nicht gespeichert werden', description: e?.message ?? String(e) });
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <GlassCard p={5}>
        <Text fontSize="2xl" fontWeight={900} letterSpacing="-0.04em">
          {greeting} 👋
        </Text>
        <Text color="gray.700" mt={1}>
          {quip}
        </Text>
        <HStack mt={4}>
          <Button leftIcon={<Icon as={RefreshCcw} />} variant="outline" size="sm" onClick={() => void load()} isLoading={busy}>
            Aktualisieren
          </Button>
          <Spacer />
          <Text fontSize="sm" color="gray.600">
            {dayjs().format('dddd, DD.MM.YYYY')}
          </Text>
        </HStack>
      </GlassCard>

      {warn ? (
        <Alert status="error" borderRadius="18px">
          <AlertIcon />
          {warn}
        </Alert>
      ) : null}

      <WeatherCard weather={weather} />

      {items.length === 0 ? (
        <EmptyState
          title="Dein Schrank ist noch leer"
          description="Füge ein paar Kleidungsstücke hinzu (mit Foto + Attributes). Dann kann das Orakel loslegen."
          actionLabel="Zum Schrank"
          onAction={() => nav('/closet')}
        />
      ) : null}

      {items.length > 0 && !outfit ? (
        <Alert status="info" borderRadius="18px">
          <AlertIcon />
          Ich bastle dir gerade einen Vorschlag …
        </Alert>
      ) : null}

      {outfit ? (
        <>
          {!outfitIsComplete(outfit) ? (
            <Alert status="warning" borderRadius="18px">
              <AlertIcon />
              Für ein „komplettes“ Outfit fehlen dir vermutlich noch Kategorien (z.B. Schuhe oder Bottom). Du kannst trotzdem
              schon starten – im Schrank ergänzen.
            </Alert>
          ) : null}

          <OutfitCard
            outfit={outfit}
            items={items}
            weather={weather}
            accepted={accepted}
            rating={historyToday?.rating ?? null}
            onRate={(v) => void doRate(v)}
            onChange={setSuggestion}
            onAccept={accepted ? undefined : () => doAccept()}
            readOnly={accepted}
          />

          {!accepted ? (
            <Button variant="ghost" onClick={regenerate} isDisabled={items.length === 0}>
              Ich will noch eine Alternative
            </Button>
          ) : null}
        </>
      ) : null}
    </VStack>
  );
}
