import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    TextInput,
    FlatList,
    Pressable,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import type { Sound as SoundType } from "../../types/sound";
import { LocalSounds, saveRecordingLocally } from "@/storage/localSounds";
import AudioRecorder from "../../components/AudioRecorder";
import EditSoundDialog from "../../components/EditSoundDialog";
import SoundButton from "../../components/SoundButton";
import { Audio } from "expo-av";

type TabKey = "all" | "fav";

export default function Soundboard() {
    const [sounds, setSounds] = useState<SoundType[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [showRecorder, setShowRecorder] = useState(false);
    const [editing, setEditing] = useState<SoundType | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>("all");

    // Player-State
    const playerRef = useRef<Audio.Sound | null>(null);
    const [playingId, setPlayingId] = useState<string | null>(null);

    useEffect(() => {
        load();
        return () => {
            // Cleanup Player
            if (playerRef.current) {
                playerRef.current.unloadAsync().catch(() => {});
                playerRef.current = null;
            }
        };
    }, []);

    async function load() {
        setLoading(true);
        try {
            const data = await LocalSounds.list("-created_date");
            // optional: fehlendes favorite normalisieren
            setSounds(data.map((s: any) => ({ ...s, favorite: s.favorite ?? false })));
        } catch (e) {
            console.warn(e);
        } finally {
            setLoading(false);
        }
    }

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return sounds
            .filter(
                (x) =>
                    x.title.toLowerCase().includes(q) ||
                    (x.description?.toLowerCase().includes(q) ?? false)
            )
            .filter((x) => (activeTab === "fav" ? !!x.favorite : true));
    }, [sounds, search, activeTab]);

    async function toggleFavorite(sound: SoundType) {
        try {
            const updated = { ...sound, favorite: !sound.favorite };
            await LocalSounds.update(sound.id, { favorite: updated.favorite });
            setSounds((prev) => prev.map((s) => (s.id === sound.id ? updated : s)));
        } catch (e) {
            console.warn("Fehler beim Favorisieren", e);
        }
    }

    async function playOrPause(item: SoundType) {
        try {
            // Wenn derselbe Sound spielt → Pause/Stop
            if (playingId === item.id && playerRef.current) {
                const status = await playerRef.current.getStatusAsync();
                if (status.isLoaded && status.isPlaying) {
                    await playerRef.current.pauseAsync();
                    setPlayingId(null);
                    return;
                }
            }

            // aktuellen Sound entladen
            if (playerRef.current) {
                await playerRef.current.unloadAsync();
                playerRef.current = null;
            }

            // neuen Sound laden & spielen
            const snd = new Audio.Sound();
            await snd.loadAsync({ uri: item.audio_url }, { shouldPlay: true });
            snd.setOnPlaybackStatusUpdate((st) => {
                if (!st || !("isLoaded" in st) || !st.isLoaded) return;
                if ("didJustFinish" in st && st.didJustFinish) {
                    setPlayingId(null);
                    snd.unloadAsync().catch(() => {});
                    if (playerRef.current === snd) playerRef.current = null;
                }
            });

            playerRef.current = snd;
            setPlayingId(item.id);
        } catch (e) {
            console.warn("Fehler beim Abspielen", e);
        }
    }

    async function onSaveRecording({
                                       uri,
                                       title,
                                       description,
                                       duration,
                                   }: {
        uri: string;
        title: string;
        description: string;
        duration: number;
    }) {
        try {
            const { file_url } = await saveRecordingLocally({
                uri,
                name: `${title}.wav`,
            });
            await LocalSounds.create({
                title,
                description,
                audio_url: file_url,
                duration,
                color: "#f97316",
                favorite: false,
            });
            setShowRecorder(false);
            load();
        } catch (e) {
            console.warn("Fehler beim Speichern", e);
        }
    }

    async function onEditSave(updated: SoundType) {
        try {
            await LocalSounds.update(updated.id, {
                title: updated.title,
                description: updated.description,
                color: updated.color,
            });
            setEditing(null);
            load();
        } catch (e) {
            console.warn("Fehler beim Bearbeiten", e);
        }
    }

    async function onDelete(id: string) {
        try {
            await LocalSounds.remove(id);
            setEditing(null);
            load();
        } catch (e) {
            console.warn("Fehler beim Löschen", e);
        }
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const favCount = sounds.filter((s) => s.favorite).length;
    return (
        <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
            <View style={styles.header}>
                <Text style={styles.title}>Mein Soundboard</Text>
                <Text style={styles.subtitle}>
                    {sounds.length} {sounds.length === 1 ? "Sound" : "Sounds"} verfügbar
                </Text>

                <View style={styles.row}>
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Sounds durchsuchen…"
                        style={styles.search}
                    />
                    <Pressable
                        onPress={() => setShowRecorder(true)}
                        style={[styles.btn, styles.primary]}
                    >
                        <Text style={styles.btnText}>Neuen Sound aufnehmen</Text>
                    </Pressable>
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    <Pressable
                        onPress={() => setActiveTab("all")}
                        style={[styles.tab, activeTab === "all" && styles.tabActive]}
                    >
                        <Text
                            style={[styles.tabText, activeTab === "all" && styles.tabTextActive]}
                        >
                            Alle
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setActiveTab("fav")}
                        style={[styles.tab, activeTab === "fav" && styles.tabActive]}
                    >
                        <Text
                            style={[styles.tabText, activeTab === "fav" && styles.tabTextActive]}
                        >
                            Favoriten{favCount ? ` (${favCount})` : ""}
                        </Text>
                    </Pressable>
                </View>
            </View>

            {filtered.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyTitle}>
                        {activeTab === "fav"
                            ? "Noch keine Favoriten"
                            : "Noch keine Sounds vorhanden"}
                    </Text>
                    <Text style={styles.emptyText}>
                        {activeTab === "fav"
                            ? "Tippe auf ⭐ bei einem Sound, um ihn zu favorisieren."
                            : "Erstelle deinen ersten Sound!"}
                    </Text>
                    {activeTab !== "fav" && (
                        <Pressable
                            onPress={() => setShowRecorder(true)}
                            style={[styles.btn, styles.primary]}
                        >
                            <Text style={styles.btnText}>Ersten Sound aufnehmen</Text>
                        </Pressable>
                    )}
                </View>
            ) : (
                <FlatList
                    contentContainerStyle={{ padding: 16, gap: 12 }}
                    data={filtered}
                    keyExtractor={(x) => x.id}
                    renderItem={({ item }) => (
                        <SoundButton
                            sound={item}
                            // Gesamte Kachel = Edit öffnen
                            onPress={() => setEditing(item)}
                            // Play/Pause Button
                            onPlay={() => playOrPause(item)}
                            isPlaying={playingId === item.id}
                            // Favorit
                            onToggleFavorite={() => toggleFavorite(item)}
                            isFavorite={!!item.favorite}
                        />
                    )}
                    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                />
            )}

            <AudioRecorder
                visible={showRecorder}
                onSave={onSaveRecording}
                onCancel={() => setShowRecorder(false)}
            />
            {editing && (
                <EditSoundDialog
                    visible={!!editing}
                    sound={editing}
                    onSave={onEditSave}
                    onDelete={onDelete}
                    onCancel={() => setEditing(null)}
                />
            )}
        </View>
    );
}
const styles = StyleSheet.create({
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    header: {
        paddingTop: 24,
        paddingHorizontal: 16,
        gap: 8,
        backgroundColor: "#fff",
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eef2f7",
    },
    title: { fontSize: 22, fontWeight: "800", color: "#111827" },
    subtitle: { color: "#6b7280" },
    row: { flexDirection: "row", gap: 8, marginTop: 8 },
    search: {
        flex: 1,
        backgroundColor: "#f3f4f6",
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    btn: {
        paddingHorizontal: 14,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    primary: { backgroundColor: "#f97316" },
    btnText: { color: "#fff", fontWeight: "700" },
    tabs: {
        marginTop: 8,
        flexDirection: "row",
        backgroundColor: "#f3f4f6",
        padding: 4,
        borderRadius: 12,
        gap: 4,
    },
    tab: {
        flex: 1,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    tabActive: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    tabText: { color: "#6b7280", fontWeight: "700" },
    tabTextActive: { color: "#111827" },
    empty: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        gap: 12,
    },
    emptyTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
    emptyText: { color: "#6b7280" },
});
 