import { Box, Container, HStack, Icon, IconButton, Menu, MenuButton, MenuItem, MenuList, Spacer, Text } from '@chakra-ui/react';
import { Settings, LogOut } from 'lucide-react';
import { Outlet, useNavigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { SegmentedNav } from './SegmentedNav';

export function Shell({ session }: { session: Session }) {
  const nav = useNavigate();

  return (
    <Box minH="100vh" bg="#f5f5f7" position="relative">
      <Container maxW="lg" pt={6} pb="96px" px={4}>
        <HStack mb={4}>
          <Text fontSize="lg" fontWeight={800} letterSpacing="-0.02em">
            Outfit Oracle
          </Text>
          <Spacer />
          <Menu>
            <MenuButton as={IconButton} aria-label="Einstellungen" icon={<Icon as={Settings} />} variant="ghost" />
            <MenuList>
              <MenuItem onClick={() => nav('/settings')}>Einstellungen</MenuItem>
              <MenuItem icon={<Icon as={LogOut} />} onClick={() => supabase?.auth.signOut()}>
                Abmelden
              </MenuItem>
              <Box px={3} py={2} fontSize="xs" color="gray.600">
                {session.user.email}
              </Box>
            </MenuList>
          </Menu>
        </HStack>
        <Outlet />
      </Container>

      <Box position="fixed" left={0} right={0} bottom={0} pb="calc(env(safe-area-inset-bottom) + 14px)" pt={2}>
        <Container maxW="lg" px={4}>
          <SegmentedNav />
        </Container>
      </Box>
    </Box>
  );
}
