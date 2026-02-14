import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import {
  Alert,
  AlertIcon,
  Badge,
  Button,
  ButtonGroup,
  HStack,
  Image,
  SimpleGrid,
  Spacer,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react';
import type { Outfit, WearHistory } from '@/lib/types';
import { listWearHistory } from '@/lib/db';
import { GlassCard } from '@/components/GlassCard';
import { RatingStars } from '@/components/RatingStars';

dayjs.locale('de');

export function HistoryPage({ userId }: { userId: string }) {
  const toast = useToast();
  const [days, setDays] = useState(7);
  const [items, setItems] = useState<WearHistory[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const range = useMemo(() => {
    const to = dayjs().format('YYYY-MM-DD');
    const from = dayjs().subtract(days - 1, 'day').format('YYYY-MM-DD');
    return { from, to };
  }, [days]);

  const load = async () => {
    setBusy(true);
    setErr(null);
    try {
      const d = await listWearHistory(userId, range.from, range.to);
      setItems(d);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
      toast({ status: 'error', title: 'History konnte nicht geladen werden', description: e?.message ?? String(e) });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, range.from, range.to]);

  return (
    <VStack spacing={4} align="stretch">
      <GlassCard p={5}>
        <HStack>
          <Text fontSize="xl" fontWeight={900} letterSpacing="-0.03em">
            History
          </Text>
          <Spacer />
          <Button isLoading={busy} variant="outline" size="sm" onClick={() => void load()}>
            Aktualisieren
          </Button>
        </HStack>
        <Text color="gray.600" mt={1}>
          Standard: letzte Woche.
        </Text>
        <ButtonGroup mt={4} size="sm" variant="outline" isAttached>
          {[7, 14, 30].map((d) => (
            <Button key={d} onClick={() => setDays(d)} isActive={days === d}>
              {d} Tage
            </Button>
          ))}
        </ButtonGroup>
      </GlassCard>

      {err ? (
        <Alert status="error" borderRadius="18px">
          <AlertIcon />
          {err}
        </Alert>
      ) : null}

      {items.length === 0 && !busy ? (
        <Alert status="info" borderRadius="18px">
          <AlertIcon />
          Noch keine Einträge. Sobald du auf der Startseite ein Outfit „akzeptierst“, taucht es hier auf.
        </Alert>
      ) : null}

      {items.map((h) => {
        const o = h.outfit_json as Outfit;
        const slotItems = Object.values(o.slots).filter(Boolean);
        return (
          <GlassCard key={h.id} p={4}>
            <HStack>
              <VStack align="start" spacing={0}>
                <Text fontWeight={900} letterSpacing="-0.02em">
                  {dayjs(h.worn_on).format('dddd, DD.MM')}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {slotItems.length} Teile
                </Text>
              </VStack>
              <Spacer />
              <HStack>
                <Badge borderRadius="999px" px={2} py={1} fontWeight={800}>
                  Rating
                </Badge>
                <RatingStars value={h.rating ?? null} />
              </HStack>
            </HStack>

            <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3} mt={4}>
              {slotItems.map((it: any) => (
                <VStack
                  key={it.id}
                  align="start"
                  spacing={1}
                  border="1px solid"
                  borderColor="blackAlpha.100"
                  borderRadius="16px"
                  overflow="hidden"
                  bg="white"
                >
                  {it.image_url ? (
                    <Image src={it.image_url} alt={it.name ?? it.type} w="full" h="120px" objectFit="cover" />
                  ) : (
                    <div style={{ width: '100%', height: 120, background: '#f3f4f6' }} />
                  )}
                  <VStack align="start" spacing={0} px={3} pb={3}>
                    <Text fontWeight={800} fontSize="sm" noOfLines={1}>
                      {it.name || it.type}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {it.type}
                    </Text>
                  </VStack>
                </VStack>
              ))}
            </SimpleGrid>
          </GlassCard>
        );
      })}
    </VStack>
  );
}
