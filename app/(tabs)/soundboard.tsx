import React from "react";
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from "react-native";
import type { Sound } from "../../types/sound";

export default function Soundboard() {
    const sounds: Sound[] = [
        {
            id: "1",
            title: "Ton1",
            description: "beschreibung 1",
            audio_url: "file://sound1.wav",
        },
        {
            id: "2",
            title: "Ton2",
            description: "Beschreibung ton 2",
            audio_url: "file://sound2.wav",
        },
    ];

    return (
        <View style={{ flex: 1, padding: 16 }}>
            {/* Header */}
            <Text style={styles.title}>Mein Soundboard</Text>
            <Text style={styles.subtitle}>
                {sounds.length} {sounds.length === 1 ? "Sound" : "Sounds"} verfügbar
            </Text>

            {/* Suche + Button */}
            <View style={styles.row}>
                <TextInput placeholder="Sounds durchsuchen…" style={styles.input} />
                <Pressable style={styles.button}>
                    <Text style={styles.buttonText}>Neuer Sound</Text>
                </Pressable>
            </View>

            {/* Liste oder Empty */}
            {sounds.length === 0 ? (
                <View style={styles.empty}>
                    <Text>Noch keine Sounds vorhanden</Text>
                    <Pressable style={styles.button}>
                        <Text style={styles.buttonText}>Ersten Sound aufnehmen</Text>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    data={sounds}
                    keyExtractor={(x) => x.id}
                    renderItem={({ item }) => (
                        <View style={styles.soundItem}>
                            <Text style={styles.soundTitle}>{item.title}</Text>
                            {item.description ? (
                                <Text style={styles.soundDesc}>{item.description}</Text>
                            ) : null}
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: 20, fontWeight: "bold" },
    subtitle: { marginBottom: 12 },
    row: { flexDirection: "row", marginBottom: 12 },
    input: {
        flex: 1,
        borderWidth: 1,
        padding: 8,
        marginRight: 8,
    },
    button: {
        backgroundColor: "gray",
        paddingHorizontal: 12,
        justifyContent: "center",
    },
    buttonText: { color: "white" },
    empty: { alignItems: "center", marginTop: 40 },
    soundItem: {
        borderWidth: 1,
        padding: 12,
        marginBottom: 8,
    },
    soundTitle: { fontWeight: "bold", color: "gray"},
    soundDesc: { color: "gray" },
});
