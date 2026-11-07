import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
} from "@/components/ui/sidebar";
import { PresentationMenu } from "./PresentationMenu";

type Props = React.ComponentProps<typeof PresentationMenu>;

export function SideMenu(props: Props) {
	return (
		<Sidebar>
			<SidebarHeader>
				<span className="px-2 py-1 text-lg font-semibold">Slides Presenter</span>
			</SidebarHeader>
			<SidebarContent>
				<PresentationMenu {...props} />
			</SidebarContent>
			<SidebarFooter>
				<span className="px-2 py-1 text-xs text-muted-foreground">(c) Stepan Rutz</span>
			</SidebarFooter>
		</Sidebar>
	);
}
