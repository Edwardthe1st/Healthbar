import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useApp } from '@/hooks/useApp';
import { Colors } from '@/constants/theme';
import { CloseIcon } from '@/components/icons/Icons';

export default function ScannerScreen() {
  const router = useRouter();
  const { dispatch } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const lockRef = useRef(false);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setScanned(true);
    dispatch({ type: 'SET_PENDING_BARCODE', payload: data });
    router.back();
  };

  const handleClose = () => {
    router.back();
  };

  // Loading state while permission is being determined
  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.messageText}>Requesting camera access...</Text>
        </View>
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <CloseIcon size={12} />
        </TouchableOpacity>
        <View style={styles.centered}>
          <Text style={styles.deniedTitle}>Camera access needed</Text>
          <Text style={styles.deniedMessage}>
            Allow camera access to scan food barcodes.
          </Text>
          {permission.canAskAgain ? (
            <TouchableOpacity style={styles.grantButton} onPress={requestPermission}>
              <Text style={styles.grantButtonText}>Allow camera</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.grantButton} onPress={() => Linking.openSettings()}>
              <Text style={styles.grantButtonText}>Open settings</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Permission granted — show camera
  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <View style={styles.overlay} pointerEvents="box-none">
        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <CloseIcon size={12} />
        </TouchableOpacity>

        {/* Scan frame */}
        <View style={styles.frameCentering} pointerEvents="none">
          <View style={styles.frame}>
            {/* Corner accents */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.hint}>Point at a barcode</Text>
        </View>
      </View>
    </View>
  );
}

const FRAME_SIZE = 260;
const CORNER_LENGTH = 28;
const CORNER_WIDTH = 3.5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    top: 58,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  frameCentering: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
  },
  corner: {
    position: 'absolute',
    width: CORNER_LENGTH,
    height: CORNER_LENGTH,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: '#fff',
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: '#fff',
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: '#fff',
    borderBottomRightRadius: 4,
  },
  hint: {
    marginTop: 20,
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  messageText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  deniedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  deniedMessage: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 24,
  },
  grantButton: {
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: Colors.accent,
  },
  grantButtonText: {
    fontSize: 15,
    fontWeight: '650',
    color: '#fff',
  },
});
