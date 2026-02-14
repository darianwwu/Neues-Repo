import { useState } from 'react';
import { Button, FormControl, FormLabel, Input, Text, VStack, useToast } from '@chakra-ui/react';
import { GlassCard } from '@/components/GlassCard';
import { supabase } from '@/lib/supabaseClient';

export function AuthPage() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    if (!supabase) {
      toast({ status: 'error', title: 'Supabase nicht konfiguriert' });
      return;
    }
    const e = email.trim();
    if (!e) return;
    setBusy(true);
    try {
      const redirectTo = window.location.origin + window.location.pathname;
      const { error } = await supabase.auth.signInWithOtp({ email: e, options: { emailRedirectTo: redirectTo } });
      if (error) throw error;
      toast({ status: 'success', title: 'Magic Link verschickt', description: 'Schau in dein Postfach.' });
    } catch (err: any) {
      toast({ status: 'error', title: 'Login fehlgeschlagen', description: err?.message ?? String(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <GlassCard p={5}>
        <VStack align="stretch" spacing={3}>
          <Text fontSize="xl" fontWeight={800} letterSpacing="-0.03em">
            Willkommen 👋
          </Text>
          <Text color="gray.600">
            Melde dich mit deiner E-Mail an. Du bekommst einen Magic Link (kein Passwort).
          </Text>
          <FormControl>
            <FormLabel>E-Mail</FormLabel>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </FormControl>
          <Button colorScheme="blue" onClick={() => void signIn()} isLoading={busy}>
            Magic Link senden
          </Button>
          <Text fontSize="xs" color="gray.600">
            Hinweis: In Supabase Auth → URL Configuration sollte deine Site als Redirect URL erlaubt sein.
          </Text>
        </VStack>
      </GlassCard>
    </VStack>
  );
}
