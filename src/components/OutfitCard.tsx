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

// Komponente für layered Tops (übereinander)
function LayeredTopDisplay({
  mainTop,
  layeredTop,
  items,
  weather,
  outfit,
  onChange,
  readOnly
}: {
  mainTop: ClothingItem;
  layeredTop?: ClothingItem;
  items?: ClothingItem[];
  weather: WeatherNow | null;
  outfit: Outfit;
  onChange?: (o: Outfit) => void;
  readOnly?: boolean;
}) {
  // Bestimme Reihenfolge: "under" zuerst, dann "over"
  const underItem = mainTop.layer_position === 'under' ? mainTop : layeredTop;
  const overItem = mainTop.layer_position === 'over' ? mainTop : layeredTop;

  return (
    <Box
      border="1px solid"
      borderColor="blackAlpha.100"
      borderRadius="16px"
      overflow="hidden"
      bg="white"
      position="relative"
    >
      {/* Layered Images */}
      <Box position="relative" w="full" h="200px" bg="gray.50">
        {/* Under Layer */}
        {underItem?.image_url && (
          <Image
            src={underItem.image_url}
            alt={underItem.name ?? underItem.type}
            position="absolute"
            top={0}
            left={0}
            w="full"
            h="full"
            objectFit="contain"
            pointerEvents="none"
          />
        )}
        {/* Over Layer */}
        {overItem?.image_url && (
          <Image
            src={overItem.image_url}
            alt={overItem.name ?? overItem.type}
            position="absolute"
            top={0}
            left={0}
            w="full"
            h="full"
            objectFit="contain"
            pointerEvents="none"
          />
        )}
        {/* Fallback wenn keine Bilder */}
        {!underItem?.image_url && !overItem?.image_url && (
          <Box w="full" h="full" bg="gray.100" />
        )}
      </Box>
      
      {/* Info */}
      <Box p={3}>
        <HStack mb={2}>
          <Text fontWeight={800} fontSize="sm">
            Top {layeredTop ? '(Layered)' : ''}
          </Text>
          <Spacer />
          {!readOnly && (
            <Icon
              as={RefreshCw}
              cursor="pointer"
              opacity={0.75}
              _hover={{ opacity: 1 }}
              onClick={() => {
                if (!items) return;
                onChange?.(replaceSlot(outfit, items, weather, 'Top'));
              }}
            />
          )}
        </HStack>
        <VStack align="start" spacing={1}>
          <Text fontWeight={700} fontSize="sm" noOfLines={1}>
            {mainTop.name || mainTop.type}
          </Text>
          {layeredTop && (
            <Text fontWeight={600} fontSize="xs" color="gray.600" noOfLines={1}>
              + {layeredTop.name || layeredTop.type}
            </Text>
          )}
          <Text fontSize="xs" color="gray.500">
            {lastWornLabel(mainTop)}
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}

// Standard Item Card
function ItemCard({
  slot,
  item,
  items,
  weather,
  outfit,
  onChange,
  readOnly
}: {
  slot: ClothingCategory;
  item: ClothingItem;
  items?: ClothingItem[];
  weather: WeatherNow | null;
  outfit: Outfit;
  onChange?: (o: Outfit) => void;
  readOnly?: boolean;
}) {
  return (
    <Box
      border="1px solid"
      borderColor="blackAlpha.100"
      borderRadius="16px"
      overflow="hidden"
      bg="white"
    >
      {item.image_url ? (
        <Image src={item.image_url} alt={item.name ?? item.type} w="full" h="140px" objectFit="contain" bg="gray.50" />
      ) : (
        <Box w="full" h="140px" bg="gray.100" />
      )}
      <Box p={3}>
        <HStack>
          <Text fontWeight={800} fontSize="sm">
            {SLOT_LABEL[slot]}
          </Text>
          <Spacer />
          {!readOnly && (
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
          )}
        </HStack>
        <Text fontWeight={700} fontSize="sm" mt={1} noOfLines={1}>
          {item.name || item.type}
        </Text>
        <Text fontSize="xs" color="gray.600">
          {lastWornLabel(item)}
        </Text>
      </Box>
    </Box>
  );
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
  const { slots, layeredTop } = outfit;
  
  // Gruppiere Items
  const topSection = slots.Onepiece || slots.Top;
  const bottomSection = slots.Bottom;
  const otherSlots = [
    { slot: 'Outerwear' as ClothingCategory, item: slots.Outerwear },
    { slot: 'Shoes' as ClothingCategory, item: slots.Shoes },
    { slot: 'Accessory' as ClothingCategory, item: slots.Accessory }
  ].filter(x => x.item);

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

      {/* Neue Darstellung: Vertical Layout */}
      <VStack spacing={3} mt={4} align="stretch">
        {/* Top Section (Onepiece oder Top mit Layer) */}
        {slots.Onepiece && (
          <ItemCard
            slot="Onepiece"
            item={slots.Onepiece}
            items={items}
            weather={weather}
            outfit={outfit}
            onChange={onChange}
            readOnly={readOnly}
          />
        )}
        
        {!slots.Onepiece && topSection && (
          <LayeredTopDisplay
            mainTop={topSection}
            layeredTop={layeredTop}
            items={items}
            weather={weather}
            outfit={outfit}
            onChange={onChange}
            readOnly={readOnly}
          />
        )}

        {/* Bottom Section */}
        {bottomSection && (
          <ItemCard
            slot="Bottom"
            item={bottomSection}
            items={items}
            weather={weather}
            outfit={outfit}
            onChange={onChange}
            readOnly={readOnly}
          />
        )}

        {/* Other Slots (Outerwear, Shoes, Accessory) */}
        {otherSlots.length > 0 && (
          <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
            {otherSlots.map(({ slot, item }) => (
              <ItemCard
                key={slot}
                slot={slot}
                item={item!}
                items={items}
                weather={weather}
                outfit={outfit}
                onChange={onChange}
                readOnly={readOnly}
              />
            ))}
          </SimpleGrid>
        )}
      </VStack>

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
