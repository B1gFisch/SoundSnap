import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import type {Sound} from "@/types/sound";

const STORAGE_KEY = "@sounds";

async function readAll(): Promise<Sound[]> {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
}

async function writeAll(list: Sound[]) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export const LocalSounds = {
    async list(order: "-created_date" | "created_date" = "-created_date"): Promise<Sound[]> {
        const data = await readAll();
        return data.sort((a, b) =>
            order === "-created_date"
                ? (b.created_date! > a.created_date! ? 1 : -1)
                : (a.created_date! > b.created_date! ? 1 : -1)
        );
    },

    async create(payload: Omit<Sound, "id" | "created_date">): Promise<Sound> {
        const list = await readAll();
        const item: Sound = {
            id: String(Date.now()),
            created_date: new Date().toISOString(),
            ...payload,
        };
        list.unshift(item);
        await writeAll(list);
        return item;
    },

    async update(id: string, patch: Partial<Sound>): Promise<Sound> {
        const list = await readAll();
        const idx = list.findIndex((s) => s.id === id);
        if (idx === -1) throw new Error("Not found");
        const updated = {...list[idx], ...patch} as Sound;
        list[idx] = updated;
        await writeAll(list);
        return updated;
    },

    async remove(id: string): Promise<void> {
        const list = await readAll();
        const s = list.find((x) => x.id === id);
        const next = list.filter((x) => x.id !== id);
        await writeAll(next);

        // lokale Datei im Sandbox-Ordner ebenfalls löschen (best effort)
        const docDir = FileSystem.documentDirectory ?? "";
        if (s?.audio_url && s.audio_url.startsWith(docDir)) {
            try {
                await FileSystem.deleteAsync(s.audio_url, {idempotent: true});
            } catch {
            }
        }
    },
};

// Speichert die aufgenommene Datei dauerhaft im App-Sandbox-Ordner
export async function saveRecordingLocally({
                                               uri, name,
                                           }: {
    uri: string;
    name: string;
}): Promise<{ file_url: string }> {
    const filename = `${FileSystem.documentDirectory}${Date.now()}-${name}`;
    await FileSystem.copyAsync({from: uri, to: filename});
    return {file_url: filename};
}
