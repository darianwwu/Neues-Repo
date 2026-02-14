import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Switch,
  Text,
  Textarea,
  VStack,
  useToast
} from '@chakra-ui/react';
import type { ClothingItem, ClothingType } from '@/lib/types';
import { categoryForType } from '@/lib/outfitEngine';
import { readFileAsDataURL } from '@/lib/image';
import { uploadClothingImage } from '@/lib/storage';
import { upsertClothingItem } from '@/lib/db';
import { PhotoCropModal } from './PhotoCropModal';

const TYPE_OPTIONS: ClothingType[] = [
  'Pullover',
  'Hoodie',
  'T-Shirt',
  'Bluse',
  'Top',
  'Hemd',
  'Jacke',
  'Mantel',
  'Hose',
  'Jeans',
  'Rock',
  'Kleid',
  'Schuhe',
  'Sneaker',
  'Stiefel',
  'Accessoire'
];

export function ClothingFormModal({
  isOpen,
  onClose,
  userId,
  initial
}: {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initial?: ClothingItem | null;
}) {
  const toast = useToast();
  const isEdit = Boolean(initial?.id);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<ClothingType>((initial?.type ?? 'T-Shirt') as ClothingType);
  const [warmth, setWarmth] = useState(initial?.warmth ?? 2);
  const [waterproof, setWaterproof] = useState(initial?.waterproof ?? false);
  const [color, setColor] = useState(initial?.color ?? '');
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(', '));
  const [rating, setRating] = useState(initial?.rating ?? 3);

  const [imageUrl, setImageUrl] = useState<string | null>(initial?.image_url ?? null);
  const [pendingSrc, setPendingSrc] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [itemId, setItemId] = useState<string>(initial?.id ?? crypto.randomUUID());

  useEffect(() => {
    if (!isOpen) return;
    setItemId(initial?.id ?? crypto.randomUUID());
    setName(initial?.name ?? '');
    setType((initial?.type ?? 'T-Shirt') as ClothingType);
    setWarmth(initial?.warmth ?? 2);
    setWaterproof(initial?.waterproof ?? false);
    setColor(initial?.color ?? '');
    setTagsText((initial?.tags ?? []).join(', '));
    setRating(initial?.rating ?? 3);
    setImageUrl(initial?.image_url ?? null);
    setPendingSrc(null);
  }, [isOpen, initial]);

  const tags = useMemo(
    () =>
      tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 12),
    [tagsText]
  );

  const resetAndClose = () => {
    onClose();
  };

  const pickPhoto = () => fileRef.current?.click();

  const onFile = async (file: File) => {
    const src = await readFileAsDataURL(file);
    setPendingSrc(src);
  };

  const handleCropped = async (blob: Blob) => {
    setBusy(true);
    try {
      const url = await uploadClothingImage({ userId, itemId, blob });
      setImageUrl(url);
      toast({ status: 'success', title: 'Foto gespeichert' });
    } catch (e: any) {
      toast({ status: 'error', title: 'Upload fehlgeschlagen', description: e?.message ?? String(e) });
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      const category = categoryForType(type);
      await upsertClothingItem({
        id: itemId,
        user_id: userId,
        name: name.trim() || null,
        type,
        category,
        warmth,
        waterproof,
        color: color.trim() || null,
        tags,
        rating: Math.max(1, Math.min(5, Number(rating))),
        image_url: imageUrl,
        created_at: initial?.created_at ?? new Date().toISOString()
      });
      toast({ status: 'success', title: isEdit ? 'Gespeichert' : 'Hinzugefügt' });
      resetAndClose();
    } catch (e: any) {
      toast({ status: 'error', title: 'Speichern fehlgeschlagen', description: e?.message ?? String(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={resetAndClose} size={{ base: 'full', md: 'xl' }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEdit ? 'Klamotte bearbeiten' : 'Neue Klamotte'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <FormControl>
                <FormLabel>Foto</FormLabel>
                <HStack spacing={3} align="start">
                  {imageUrl ? (
                    <Image src={imageUrl} alt="Foto" boxSize="96px" borderRadius="18px" objectFit="cover" />
                  ) : (
                    <HStack
                      boxSize="96px"
                      borderRadius="18px"
                      bg="gray.100"
                      justify="center"
                      color="gray.500"
                    >
                      <Text fontSize="sm">—</Text>
                    </HStack>
                  )}
                  <VStack align="start" spacing={1}>
                    <Button onClick={pickPhoto} variant="outline" size="sm" isDisabled={busy}>
                      Foto auswählen
                    </Button>
                    <Text fontSize="xs" color="gray.600">
                      Tipp: Immer ähnlich fotografieren (gleiches Licht, neutraler Hintergrund). In der App kannst du
                      quadratisch zuschneiden.
                    </Text>
                    <Input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      display="none"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void onFile(f);
                        e.target.value = '';
                      }}
                    />
                  </VStack>
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel>Name (optional)</FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="z.B. Schwarzer Rollkragen" />
              </FormControl>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Art</FormLabel>
                  <Select value={type} onChange={(e) => setType(e.target.value as ClothingType)}>
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Farbe (optional)</FormLabel>
                  <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="z.B. schwarz" />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Wärme-Level: {warmth}/5</FormLabel>
                <Slider value={warmth} min={0} max={5} step={1} onChange={setWarmth}>
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </FormControl>

              <FormControl display="flex" alignItems="center" gap={3}>
                <Switch isChecked={waterproof} onChange={(e) => setWaterproof(e.target.checked)} />
                <FormLabel m={0}>Regenfest (für Jacke/Schuhe relevant)</FormLabel>
              </FormControl>

              <FormControl>
                <FormLabel>Tags (Komma-separiert)</FormLabel>
                <Textarea
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="z.B. casual, büro, date"
                  rows={2}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Persönliches Rating: {rating}/5</FormLabel>
                <Slider value={Number(rating)} min={1} max={5} step={1} onChange={setRating}>
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <Text fontSize="xs" color="gray.600" mt={1}>
                  Das Rating hilft der Outfit-Logik – du kannst später auch Outfit-Ratings ableiten.
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={resetAndClose}>
              Abbrechen
            </Button>
            <Button colorScheme="blue" onClick={() => void save()} isLoading={busy}>
              Speichern
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <PhotoCropModal
        isOpen={!!pendingSrc}
        onClose={() => setPendingSrc(null)}
        imageSrc={pendingSrc}
        onCropped={handleCropped}
      />
    </>
  );
}
