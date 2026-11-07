import { useLocalStorage } from "@uidotdev/usehooks";

export type Settings = {
	/** scale the slide up/down so it always fits the viewport without scrolling */
	scaleToFit: boolean;
	/** in fullscreen, hide header, sidebar and footer until the mouse moves */
	hideChromeInFullscreen: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
	scaleToFit: false,
	hideChromeInFullscreen: true,
};

/** Settings persisted in localStorage (shared between components, same tab and across tabs). */
export function useSettings() {
	const [stored, setStored] = useLocalStorage<Partial<Settings>>(
		"slidespresenter:settings",
		DEFAULT_SETTINGS,
	);
	// merge so settings added later get their default
	const settings: Settings = { ...DEFAULT_SETTINGS, ...stored };
	const update = (patch: Partial<Settings>) =>
		setStored({ ...settings, ...patch });
	return [settings, update] as const;
}
