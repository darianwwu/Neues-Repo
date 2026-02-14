import { HStack, IconButton } from '@chakra-ui/react';
import { Star } from 'lucide-react';

export function RatingStars({
  value,
  onChange,
  size = 18
}: {
  value: number | null;
  onChange?: (v: number) => void;
  size?: number;
}) {
  const v = value ?? 0;
  return (
    <HStack spacing={1}>
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1;
        const filled = idx <= v;
        return (
          <IconButton
            key={idx}
            aria-label={`${idx} Sterne`}
            size="sm"
            variant="ghost"
            icon={<Star size={size} fill={filled ? 'currentColor' : 'none'} />}
            onClick={() => onChange?.(idx)}
          />
        );
      })}
    </HStack>
  );
}
