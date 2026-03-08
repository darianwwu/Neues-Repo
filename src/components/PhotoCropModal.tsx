import { useCallback, useState } from 'react';
import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  VStack
} from '@chakra-ui/react';
import Cropper, { Area } from 'react-easy-crop';
import { getCroppedPng } from '@/lib/image';

export function PhotoCropModal({
  isOpen,
  onClose,
  imageSrc,
  onCropped
}: {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  onCropped: (blob: Blob) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_cropped: Area, croppedAreaPixels: Area) => {
    setArea(croppedAreaPixels);
  }, []);

  const handleUse = async () => {
    if (!imageSrc || !area) return;
    setBusy(true);
    try {
      const blob = await getCroppedPng(imageSrc, area, 1080);
      onCropped(blob);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'xl' }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Foto zuschneiden</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {imageSrc ? (
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                Tipp: Quadratisch zuschneiden, möglichst neutraler Hintergrund.
              </Text>
              <div style={{ position: 'relative', width: '100%', height: 360, borderRadius: 16, overflow: 'hidden' }}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <HStack>
                <Text fontSize="sm" w="70px">
                  Zoom
                </Text>
                <Slider value={zoom} min={1} max={3} step={0.01} onChange={setZoom}>
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </HStack>
            </VStack>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} variant="ghost">
            Abbrechen
          </Button>
          <Button colorScheme="blue" onClick={handleUse} isLoading={busy} isDisabled={!imageSrc}>
            Verwenden
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
