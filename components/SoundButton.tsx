import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";
import type { Sound as SoundType } from "../types/sound";

export default function SoundButton({
                                        sound,
                                        onPress,            // gesamte Kachel -> Edit öffnen
                                        onPlay,             // Play/Pause Button
                                        onToggleFavorite,   // Stern
                                        isFavorite,
                                        isPlaying,
                                    }: {
    sound: SoundType;
    onPress: () => void;
    onPlay: () => void;
    onToggleFavorite: () => void;
    isFavorite?: boolean;
    isPlaying?: boolean;
}) {
    const accent = sound.color ?? "#14b8a6";
    const durationLabel = formatDuration(sound.duration);

    return (
        <Pressable
            onPress={onPress}
            style={{
                backgroundColor: "#f0fdfa",
                borderRadius: 16,
                padding: 14,
                flexDirection: "row",          // <-- Hauptlayout: links + rechts
                justifyContent: "space-between",
                alignItems: "center",          // <-- vertikal zentrieren
                borderWidth: 2,
                borderColor: accent,
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 2,
            }}
        >
            {/* linker Teil: Titel + Beschreibung + Dauer */}
            <View style={{ flex: 1, paddingRight: 12 }}>
                <Text
                    style={{ fontWeight: "800", color: "#0f172a", fontSize: 16 }}
                    numberOfLines={1}
                >
                    {sound.title}
                </Text>

                {!!sound.description && (
                    <Text
                        style={{ color: "#475569", marginTop: 2 }}
                        numberOfLines={2}
                    >
                        {sound.description}
                    </Text>
                )}

                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 6,
                        opacity: 0.8,
                    }}
                >
                    <Ionicons name="volume-medium" size={14} color="#64748b" />
                    <Text
                        style={{
                            color: "#64748b",
                            marginLeft: 6,
                            fontVariant: ["tabular-nums"],
                            fontWeight: "600",
                        }}
                    >
                        {durationLabel}
                    </Text>
                </View>
            </View>

            {/* rechter Teil: Play + Stern nebeneinander, vertikal zentriert */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                {/* Play Button */}
                <Pressable
                    onPress={onPlay}
                    hitSlop={8}
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 999,
                        overflow: "hidden",
                        marginRight: 12,
                    }}
                >
                    <LinearGradient
                        colors={["#14b8a6", "#06b6d4"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Ionicons
                            name={isPlaying ? "pause" : "play"}
                            size={22}
                            color="#ffffff"
                            style={{ marginLeft: isPlaying ? 0 : 2 }}
                        />
                    </LinearGradient>
                </Pressable>

                {/* Stern */}
                <Pressable onPress={onToggleFavorite} hitSlop={8}>
                    <Ionicons
                        name={isFavorite ? "star" : "star-outline"}
                        size={26}
                        color={isFavorite ? "#f59e0b" : "#94a3b8"}
                    />
                </Pressable>
            </View>
        </Pressable>
    );
}

function formatDuration(d?: number) {
    if (!d || d <= 0) return "0:00";
    const sec = d > 1000 ? Math.round(d / 1000) : Math.round(d);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}
 