import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { useSettings } from "@/lib/settings";

type Props = {
	onClose: () => void;
};

export function SettingsDialog({ onClose }: Props) {
	const [settings, update] = useSettings();

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="min-w-[80%] min-h-[80%] flex flex-col">
				<DialogHeader>
					<DialogTitle>Settings</DialogTitle>
					<DialogDescription>
						Saved in this browser and applied immediately.
					</DialogDescription>
				</DialogHeader>
				<FieldGroup>
					<Field orientation="horizontal">
						<Checkbox
							id="scale-to-fit"
							checked={settings.scaleToFit}
							onCheckedChange={(checked) => update({ scaleToFit: checked })}
						/>
						<FieldContent>
							<FieldLabel htmlFor="scale-to-fit">Scale slides to fit</FieldLabel>
							<FieldDescription>
								Resize each slide to fill the screen, with no scrolling.
							</FieldDescription>
						</FieldContent>
					</Field>
					<Field orientation="horizontal">
						<Checkbox
							id="hide-chrome"
							checked={settings.hideChromeInFullscreen}
							onCheckedChange={(checked) =>
								update({ hideChromeInFullscreen: checked })
							}
						/>
						<FieldContent>
							<FieldLabel htmlFor="hide-chrome">
								Hide controls in fullscreen
							</FieldLabel>
							<FieldDescription>
								Header, sidebar and navigation fade away when the mouse is idle.
							</FieldDescription>
						</FieldContent>
					</Field>
				</FieldGroup>
			</DialogContent>
		</Dialog>
	);
}
