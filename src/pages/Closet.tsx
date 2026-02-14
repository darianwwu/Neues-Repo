import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AlertIcon,
  Button,
  HStack,
  Icon,
  Input,
  SimpleGrid,
  Spacer,
  Text,
  VStack,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { Plus, Search } from 'lucide-react';
import type { ClothingItem } from '@/lib/types';
import { deleteClothingItem, listClothingItems } from '@/lib/db';
import { removeClothingImage } from '@/lib/storage';
import { GlassCard } from '@/components/GlassCard';
import { ClothingCard } from '@/components/ClothingCard';
import { ClothingFormModal } from '@/components/ClothingFormModal';

export function ClosetPage({ userId }: { userId: string }) {
  const toast = useToast();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<ClothingItem | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      `${it.name ?? ''} ${it.type} ${it.color ?? ''} ${(it.tags ?? []).join(' ')}`.toLowerCase().includes(q)
    );
  }, [items, query]);

  const load = async () => {
    setBusy(true);
    setErr(null);
    try {
      const d = await listClothingItems(userId);
      setItems(d);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
      toast({ status: 'error', title: 'Schrank konnte nicht geladen werden', description: e?.message ?? String(e) });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const openNew = () => {
    setEditing(null);
    onOpen();
  };

  const openEdit = (it: ClothingItem) => {
    setEditing(it);
    onOpen();
  };

  const closeAndRefresh = () => {
    onClose();
    void load();
  };

  const del = async (it: ClothingItem) => {
    const ok = confirm(`"${it.name || it.type}" wirklich löschen?`);
    if (!ok) return;
    setBusy(true);
    try {
      await deleteClothingItem(userId, it.id);
      await removeClothingImage({ userId, itemId: it.id });
      setItems((prev) => prev.filter((x) => x.id !== it.id));
      toast({ status: 'success', title: 'Gelöscht' });
    } catch (e: any) {
      toast({ status: 'error', title: 'Löschen fehlgeschlagen', description: e?.message ?? String(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <GlassCard p={5}>
        <HStack>
          <Text fontSize="xl" fontWeight={900} letterSpacing="-0.03em">
            Schrank
          </Text>
          <Spacer />
          <Button leftIcon={<Icon as={Plus} />} colorScheme="blue" size="sm" onClick={openNew}>
            Neue Klamotte
          </Button>
        </HStack>
        <HStack mt={4} spacing={2}>
          <Icon as={Search} opacity={0.7} />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Suchen (Name, Typ, Tags…)" />
          <Button variant="outline" size="sm" onClick={() => void load()} isLoading={busy}>
            Reload
          </Button>
        </HStack>
        <Text fontSize="sm" color="gray.600" mt={2}>
          {filtered.length} von {items.length} Teilen
        </Text>
      </GlassCard>

      {err ? (
        <Alert status="error" borderRadius="18px">
          <AlertIcon />
          {err}
        </Alert>
      ) : null}

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {filtered.map((it) => (
          <ClothingCard key={it.id} item={it} onEdit={() => openEdit(it)} onDelete={() => void del(it)} />
        ))}
      </SimpleGrid>

      <ClothingFormModal isOpen={isOpen} onClose={closeAndRefresh} userId={userId} initial={editing} />
    </VStack>
  );
}
