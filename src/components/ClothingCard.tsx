import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/de';
import {
  Badge,
  Box,
  HStack,
  IconButton,
  Image,
  Spacer,
  Text,
  VStack
} from '@chakra-ui/react';
import { Pencil, Trash2 } from 'lucide-react';
import type { ClothingItem } from '@/lib/types';

dayjs.extend(relativeTime);
dayjs.locale('de');

export function ClothingCard({
  item,
  onEdit,
  onDelete
}: {
  item: ClothingItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const last = item.last_worn_at ? `zuletzt ${dayjs(item.last_worn_at).fromNow()}` : 'noch nie getragen';
  return (
    <Box border="1px solid" borderColor="blackAlpha.100" borderRadius="18px" overflow="hidden" bg="white">
      {item.image_url ? (
        <Image src={item.image_url} alt={item.name ?? item.type} w="full" h="160px" objectFit="cover" />
      ) : (
        <Box w="full" h="160px" bg="gray.100" />
      )}
      <Box p={3}>
        <HStack align="start">
          <VStack align="start" spacing={0}>
            <Text fontWeight={800} noOfLines={1}>
              {item.name || item.type}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {item.type} • {last}
            </Text>
          </VStack>
          <Spacer />
          <HStack spacing={1}>
            <IconButton aria-label="Bearbeiten" size="sm" variant="ghost" icon={<Pencil size={18} />} onClick={onEdit} />
            <IconButton aria-label="Löschen" size="sm" variant="ghost" icon={<Trash2 size={18} />} onClick={onDelete} />
          </HStack>
        </HStack>

        <HStack mt={2} spacing={2} flexWrap="wrap">
          <Badge borderRadius="999px" px={2} py={1} fontWeight={700}>
            Wärme: {item.warmth}/5
          </Badge>
          {item.waterproof ? (
            <Badge colorScheme="blue" borderRadius="999px" px={2} py={1} fontWeight={700}>
              regenfest
            </Badge>
          ) : null}
          {item.tags?.slice(0, 3).map((t) => (
            <Badge key={t} colorScheme="gray" borderRadius="999px" px={2} py={1} fontWeight={700}>
              {t}
            </Badge>
          ))}
        </HStack>
      </Box>
    </Box>
  );
}
