import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
    visible: boolean;
    onSave: (p: { uri: string; title: string; description: string; duration: number }) => Promise<void> | void;
    onCancel: () => void;
};

export default function AudioRecorder({ visible, onSave, onCancel }: Props) {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [recordedUri, setRecordedUri] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [recordingStart, setRecordingStart] = useState<number | null>(null);
    const soundRef = useRef<Audio.Sound | null>(null);

    useEffect(() => {
        return () => stopPlayback();
    }, []);

    async function start() {

        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const rec = new Audio.Recording();
        await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        await rec.startAsync();
        setRecording(rec);
        setRecordedUri(null);
        setRecordingStart(Date.now());
    }

    async function stop() {
        if (!recording) return;
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        setRecordedUri(uri ?? null);
    }

   async function play() {
    if (!recordedUri) return;
    stopPlayback();

    const { sound } = await Audio.Sound.createAsync({ uri: recordedUri });
    soundRef.current = sound;

    await sound.setVolumeAsync(1.0); // max Volume

    sound.setOnPlaybackStatusUpdate((s: any) => {
        if (s.didJustFinish) setIsPlaying(false);
    });

    setIsPlaying(true);
    await sound.playAsync();
}

    function stopPlayback() {
        if (soundRef.current) {
            soundRef.current.unloadAsync();
            soundRef.current = null;
        }
        setIsPlaying(false);
    }

    async function handleSave() {
        if (!recordedUri || !title.trim()) return;
        let duration = 0;
        try {
            const { sound } = await Audio.Sound.createAsync({ uri: recordedUri });
            const status: any = await sound.getStatusAsync();
            duration = status?.durationMillis ? Math.round(status.durationMillis / 1000) : 0;
            await sound.unloadAsync();
        } catch {
            // fallback: grob anhand Aufnahmezeit
            if (recordingStart) duration = Math.max(1, Math.round((Date.now() - recordingStart) / 1000));
        }
        await onSave({ uri: recordedUri, title: title.trim(), description: description.trim(), duration });
    }

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <Text style={styles.h1}>Neuen Sound aufnehmen</Text>

                    <View style={styles.row}>
                        {!recording && (
                            <Pressable style={[styles.btn, styles.primary]} onPress={start}>
                                <Text style={styles.btnText}>Aufnehmen</Text>
                            </Pressable>
                        )}
                        {recording && (
                            <Pressable style={[styles.btn, styles.danger]} onPress={stop}>
                                <Text style={styles.btnText}>Stop</Text>
                            </Pressable>
                        )}
                        {recordedUri && (
                            <Pressable style={[styles.btn, styles.outline]} onPress={isPlaying ? stopPlayback : play}>
                                <Text style={[styles.btnText, styles.outlineText]}>{isPlaying ? "Stopp" : "Abspielen"}</Text>
                            </Pressable>
                        )}
                    </View>

                    {recordedUri && (
                        <>
                            <TextInput placeholder="Titel" value={title} onChangeText={setTitle} style={styles.input} />
                            <TextInput
                                placeholder="Beschreibung (optional)"
                                value={description}
                                onChangeText={setDescription}
                                style={[styles.input, { height: 80 }]}
                                multiline
                            />
                        </>
                    )}

                    <View style={styles.row}>
                        <Pressable
                            style={[styles.btn, styles.outline]}
                            onPress={() => {
                                stopPlayback();
                                onCancel();
                            }}
                        >
                            <Text style={[styles.btnText, styles.outlineText]}>Abbrechen</Text>
                        </Pressable>
                        <Pressable
                            disabled={!recordedUri || !title.trim()}
                            style={[styles.btn, !recordedUri || !title.trim() ? styles.disabled : styles.primary]}
                            onPress={handleSave}
                        >
                            <Text style={styles.btnText}>Speichern</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 16 },
    card: { width: "100%", maxWidth: 420, backgroundColor: "#fff", borderRadius: 16, padding: 16 },
    h1: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
    row: { flexDirection: "row", gap: 8, marginVertical: 8 },
    btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, flex: 1, alignItems: "center" },
    primary: { backgroundColor: "#f97316" },
    danger: { backgroundColor: "#ef4444" },
    outline: { borderWidth: 1, borderColor: "#d1d5db", backgroundColor: "#fff" },
    outlineText: { color: "#111827" },
    disabled: { backgroundColor: "#e5e7eb" },
    btnText: { color: "#fff", fontWeight: "600" },
    input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, marginTop: 8 },
});
 