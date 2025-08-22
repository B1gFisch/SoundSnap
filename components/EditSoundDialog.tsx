import React, { useState } from "react";
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import type { Sound } from "@/types/sound";

const COLORS = [
    "#f97316",
    "#3b82f6",
    "#10b981",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#84cc16",
    "#ec4899",
    "#6366f1",
    "#14b8a6",
    "#f43f5e",
];

type Props = {
    visible: boolean;
    sound: Sound;
    onSave: (s: Sound) => void | Promise<void>;
    onDelete: (id: string) => void | Promise<void>;
    onCancel: () => void;
};

export default function EditSoundDialog({ visible, sound, onSave, onDelete, onCancel }: Props) {
    const [title, setTitle] = useState(sound.title);
    const [description, setDescription] = useState(sound.description ?? "");
    const [color, setColor] = useState<string>(sound.color ?? COLORS[0]);

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <Text style={styles.h1}>Sound bearbeiten</Text>

                    <Text style={styles.label}>Titel</Text>
                    <TextInput value={title} onChangeText={setTitle} style={styles.input} />

                    <Text style={styles.label}>Beschreibung</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        style={[styles.input, { height: 80 }]}
                        multiline
                    />

                    <Text style={styles.label}>Farbe</Text>
                    <View style={styles.colors}>
                        {COLORS.map((c) => (
                            <Pressable
                                key={c}
                                onPress={() => setColor(c)}
                                style={[
                                    styles.swatch,
                                    { backgroundColor: c, borderWidth: color === c ? 3 : 1 },
                                ]}
                            />
                        ))}
                    </View>

                    <View style={styles.row}>
                        <Pressable style={[styles.btn, styles.outline]} onPress={onCancel}>
                            <Text style={[styles.btnText, styles.outlineText]}>Abbrechen</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.btn, styles.primary]}
                            onPress={() =>
                                onSave({ ...sound, title: title.trim(), description: description.trim(), color })
                            }
                        >
                            <Text style={styles.btnText}>Speichern</Text>
                        </Pressable>
                    </View>

                    <Pressable style={[styles.btn, styles.danger]} onPress={() => onDelete(sound.id)}>
                        <Text style={styles.btnText}>Sound löschen</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 16 },
    card: { width: "100%", maxWidth: 420, backgroundColor: "#fff", borderRadius: 16, padding: 16 },
    h1: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
    label: { fontSize: 12, color: "#374151", marginTop: 8 },
    input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, marginTop: 4 },
    colors: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 8 },
    swatch: { width: 28, height: 28, borderRadius: 14, borderColor: "#111827" },
    row: { flexDirection: "row", gap: 8, marginTop: 8 },
    btn: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignItems: "center", marginTop: 8 },
    primary: { backgroundColor: "#3b82f6" },
    danger: { backgroundColor: "#ef4444" },
    outline: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#d1d5db" },
    outlineText: { color: "#111827" },
    btnText: { color: "#fff", fontWeight: "700" },
});
