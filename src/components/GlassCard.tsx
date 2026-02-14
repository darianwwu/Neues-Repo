import { Box, BoxProps } from '@chakra-ui/react';

export function GlassCard(props: BoxProps) {
  return (
    <Box
      bg="rgba(255,255,255,0.78)"
      border="1px solid"
      borderColor="blackAlpha.100"
      borderRadius="18px"
      boxShadow="0 8px 24px rgba(0,0,0,0.06)"
      backdropFilter="blur(12px)"
      {...props}
    />
  );
}
