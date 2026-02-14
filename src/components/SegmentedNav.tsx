import { HStack, Icon, IconButton, Text } from '@chakra-ui/react';
import { Home, History, Shirt } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

type Item = {
  label: string;
  path: string;
  icon: any;
};

const items: Item[] = [
  { label: 'Start', path: '/', icon: Home },
  { label: 'History', path: '/history', icon: History },
  { label: 'Schrank', path: '/closet', icon: Shirt }
];

export function SegmentedNav() {
  const loc = useLocation();
  const nav = useNavigate();
  const current = loc.pathname || '/';

  return (
    <HStack
      spacing={0}
      w="full"
      p="6px"
      border="1px solid"
      borderColor="blackAlpha.100"
      bg="rgba(255,255,255,0.7)"
      backdropFilter="blur(12px)"
      borderRadius="18px"
      boxShadow="0 6px 20px rgba(0,0,0,0.07)"
      justify="space-between"
    >
      {items.map((it) => {
        const active = current === it.path;
        return (
          <HStack
            key={it.path}
            flex="1"
            justify="center"
            py={2}
            borderRadius="14px"
            bg={active ? 'blackAlpha.100' : 'transparent'}
            cursor="pointer"
            onClick={() => nav(it.path)}
            transition="all 120ms ease"
            _hover={{ bg: active ? 'blackAlpha.100' : 'blackAlpha.50' }}
          >
            <Icon as={it.icon} boxSize={4} />
            <Text fontSize="sm" fontWeight={active ? 700 : 600}>
              {it.label}
            </Text>
          </HStack>
        );
      })}
    </HStack>
  );
}
