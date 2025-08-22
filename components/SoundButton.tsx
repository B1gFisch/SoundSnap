import type { Sound as SoundType } from "../types/sound";

type Props = {
    sound: SoundType;
    onEdit: (s: SoundType) => void;
    onPlay?: (id: string) => void;
};

export default function SoundButton({ sound, onEdit, onPlay }: Props) {


    return (
        <></>
    );
}