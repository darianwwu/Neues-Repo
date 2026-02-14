import { Button, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import { GlassCard } from './GlassCard';

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <GlassCard p={5}>
      <VStack align="start" spacing={2}>
        <Text fontWeight={800} fontSize="lg">
          {title}
        </Text>
        <Text color="gray.600" fontSize="sm">
          {description}
        </Text>
        {actionLabel && onAction ? (
          <Button mt={2} colorScheme="blue" leftIcon={<Icon as={Plus} />} onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </VStack>
    </GlassCard>
  );
}
