import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import EditSoundDialog from "../components/EditSoundDialog";

const mockSound = {
    id: "1",
    title: "Test Sound",
    description: "Beschreibung",
    color: "#f97316",
    audio_url: "file://test.wav",
    duration: 5,
};

describe("EditSoundDialog Component", () => {
    it("renders correctly (snapshot)", () => {
        const { toJSON } = render(
            <EditSoundDialog
                visible={true}
                sound={mockSound}
                onSave={jest.fn()}
                onDelete={jest.fn()}
                onCancel={jest.fn()}
            />
        );
        expect(toJSON()).toMatchSnapshot();
    });

    it("calls onSave with updated title", () => {
        const onSave = jest.fn();
        const { getByText, getByDisplayValue } = render(
            <EditSoundDialog
                visible={true}
                sound={mockSound}
                onSave={onSave}
                onDelete={jest.fn()}
                onCancel={jest.fn()}
            />
        );

        const input = getByDisplayValue("Test Sound");
        fireEvent.changeText(input, "Updated Sound");

        fireEvent.press(getByText("Speichern"));
        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: "Updated Sound" }));
    });

    it("calls onCancel when Abbrechen pressed", () => {
        const onCancel = jest.fn();
        const { getByText } = render(
            <EditSoundDialog
                visible={true}
                sound={mockSound}
                onSave={jest.fn()}
                onDelete={jest.fn()}
                onCancel={onCancel}
            />
        );

        fireEvent.press(getByText("Abbrechen"));
        expect(onCancel).toHaveBeenCalled();
    });
});
