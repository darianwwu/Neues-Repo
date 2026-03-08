import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/de';
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  HStack,
  Icon,
  Image,
  SimpleGrid,
  Spacer,
  Text,
  VStack
} from '@chakra-ui/react';
import { RefreshCw, Check, Shuffle } from 'lucide-react';
import type { ClothingCategory, ClothingItem, Outfit, WeatherNow } from '@/lib/types';
import { replaceSlot, generateOutfit } from '@/lib/outfitEngine';
import { GlassCard } from './GlassCard';
import { RatingStars } from './RatingStars';

dayjs.extend(relativeTime);
dayjs.locale('de');

const SLOT_ORDER: ClothingCategory[] = ['Onepiece', 'Top', 'Bottom', 'Outerwear', 'Shoes', 'Accessory'];
const SLOT_LABEL: Record<ClothingCategory, string> = {
  Onepiece: 'Kleid',
  Top: 'Top',
  Bottom: 'Bottom',
  Outerwear: 'Jacke/Mantel',
  Shoes: 'Schuhe',
  Accessory: 'Accessoire'
};

function lastWornLabel(item: ClothingItem) {
  if (!item.last_worn_at) return 'noch nie getragen';
  return `zuletzt ${dayjs(item.last_worn_at).fromNow()}`;
}

export function OutfitCard({
  outfit,
  items,
  weather,
  accepted,
  rating,
  onRate,
  onChange,
  onAccept,
  readOnly = false
}: {
  outfit: Outfit;
  items?: ClothingItem[];
  weather: WeatherNow | null;
  accepted?: boolean;
  rating?: number | null;
  onRate?: (v: number) => void;
  onChange?: (o: Outfit) => void;
  onAccept?: () => Promise<void>;
  readOnly?: boolean;
}) {
  const slotItems = SLOT_ORDER.map((s) => ({ slot: s, item: outfit.slots[s] })).filter((x) => x.item);
  
  // Add layered top if present
  const allDisplayItems = [...slotItems];
  if (outfit.layeredTop) {
    allDisplayItems.push({ slot: 'Top' as ClothingCategory, item: outfit.layeredTop });
  }

  return (
    <GlassCard p={4}>
      <HStack align="start" spacing={3}>
        <VStack align="start" spacing={1}>
          <Text fontWeight={800} fontSize="lg" letterSpacing="-0.02em">
            Outfit-Vorschlag
          </Text>
          <HStack spacing={2} flexWrap="wrap">
            {outfit.reason.slice(0, 3).map((r) => (
              <Badge key={r} colorScheme="gray" borderRadius="999px" px={2} py={1} fontWeight={700}>
                {r}
              </Badge>
            ))}
          </HStack>
        </VStack>
        <Spacer />
        {!readOnly ? (
          <ButtonGroup size="sm" variant="ghost">
            <Button
              leftIcon={<Icon as={Shuffle} />}
              onClick={() => onChange?.(generateOutfit(items ?? [], weather, outfit.created_for))}
              isDisabled={!items || items.length === 0}
            >
              Alles ersetzen
            </Button>
          </ButtonGroup>
        ) : null}
      </HStack>

      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3} mt={4}>
        {allDisplayItems.map(({ slot, item }, idx) => {
          const isLayer = idx >= slotItems.length; // Layered item
          return (
            <Box
              key={`${slot}-${idx}`}
              border="1px solid"
              borderColor="blackAlpha.100"
              borderRadius="16px"
              overflow="hidden"
              bg="white"
            >
              {item?.image_url ? (
                <Image src={item.image_url} alt={item.name ?? item.type} w="full" h="120px" objectFit="cover" />
              ) : (
                <Box w="full" h="120px" bg="gray.100" />
              )}
              <Box p={3}>
                <HStack>
                  <Text fontWeight={800} fontSize="sm">
                    {isLayer ? `${SLOT_LABEL[slot]} (Layer)` : SLOT_LABEL[slot]}
                  </Text>
                  <Spacer />
                  {!readOnly && !isLayer ? (
                    <Icon
                      as={RefreshCw}
                      cursor="pointer"
                      opacity={0.75}
                      _hover={{ opacity: 1 }}
                      onClick={() => {
                        if (!items) return;
                        onChange?.(replaceSlot(outfit, items, weather, slot));
                      }}
                    />
                  ) : null}
                </HStack>
                <Text fontWeight={700} fontSize="sm" mt={1} noOfLines={1}>
                  {item?.name || item?.type}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  {lastWornLabel(item!)}
                </Text>
              </Box>
            </Box>
          );
        })}
      </SimpleGrid>

      <HStack mt={4}>
        {accepted ? (
          <HStack spacing={2}>
            <Badge colorScheme="green" borderRadius="999px" px={3} py={1} fontWeight={800}>
              <HStack spacing={1}>
                <Icon as={Check} />
                <Text>Heute getragen</Text>
              </HStack>
            </Badge>
            <RatingStars value={rating ?? null} onChange={onRate} />
          </HStack>
        ) : null}
        <Spacer />
        {!readOnly ? (
          <Button
            colorScheme="blue"
            onClick={onAccept}
            leftIcon={<Icon as={Check} />}
            isDisabled={!onAccept}
          >
            Ziehe ich heute an
          </Button>
        ) : null}
      </HStack>
    </GlassCard>
  );
}
