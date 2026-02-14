import { useEffect, useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Alert, AlertIcon, Box, Button, Code, Link, Text, VStack } from '@chakra-ui/react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { Shell } from '@/components/Shell';
import { AuthPage } from '@/pages/Auth';
import { HomePage } from '@/pages/Home';
import { HistoryPage } from '@/pages/History';
import { ClosetPage } from '@/pages/Closet';
import { SettingsPage } from '@/pages/Settings';
import { GlassCard } from '@/components/GlassCard';

function MissingConfig() {
  return (
    <Box minH="100vh" bg="#f5f5f7" display="flex" alignItems="center" justifyContent="center" p={6}>
      <GlassCard p={6} maxW="2xl">
        <VStack align="stretch" spacing={3}>
          <Text fontSize="xl" fontWeight={900} letterSpacing="-0.03em">
            Supabase ist noch nicht konfiguriert
          </Text>
          <Text color="gray.700">
            Lege eine <Code>.env.local</Code> im Projektroot an und trage deine Keys ein:
          </Text>
          <Code p={3} borderRadius="14px" whiteSpace="pre">
{`VITE_SUPABASE_URL=...\nVITE_SUPABASE_ANON_KEY=...\nVITE_OPENWEATHER_API_KEY=...`}
          </Code>
          <Alert status="info" borderRadius="14px">
            <AlertIcon />
            Danach: <Code>npm install</Code> und <Code>npm run dev</Code>
          </Alert>
          <Text fontSize="sm" color="gray.600">
            Tipp: Für GitHub Pages kannst du die Env-Variablen in GitHub Actions als Secrets setzen.
          </Text>
          <Button as={Link} href="https://supabase.com" isExternal colorScheme="blue">
            Supabase öffnen
          </Button>
        </VStack>
      </GlassCard>
    </Box>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setReady(true);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!supabase) return <MissingConfig />;

  if (!ready) {
    return (
      <Box minH="100vh" bg="#f5f5f7" display="flex" alignItems="center" justifyContent="center" p={6}>
        <Text color="gray.600">Lädt…</Text>
      </Box>
    );
  }

  if (!session) {
    return (
      <HashRouter>
        <Routes>
          <Route path="*" element={<AuthPage />} />
        </Routes>
      </HashRouter>
    );
  }

  const userId = session.user.id;

  return (
    <HashRouter>
      <Routes>
        <Route element={<Shell session={session} />}>
          <Route path="/" element={<HomePage userId={userId} />} />
          <Route path="/history" element={<HistoryPage userId={userId} />} />
          <Route path="/closet" element={<ClosetPage userId={userId} />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
