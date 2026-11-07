import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
} from "@/components/ui/sidebar";
import type { TocNode } from "@/lib/presentations";
import { PresentationMenu } from "./PresentationMenu";
import { SidebarResizeHandle } from "./SidebarResizeHandle";
import { Toc } from "./Toc";

type Props = React.ComponentProps<typeof PresentationMenu> & {
	toc: TocNode[];
};

export function SideMenu({ toc, ...props }: Props) {
	return (
		<Sidebar>
			<SidebarHeader>
				<span className="px-2 py-1 text-lg font-semibold">Slides Presenter</span>
			</SidebarHeader>
			<SidebarContent>
				<PresentationMenu {...props} />
				{props.selectedId && <Toc presentationId={props.selectedId} toc={toc} />}
			</SidebarContent>
			<SidebarFooter>
				<span className="px-2 py-1 text-xs text-muted-foreground">
					(c) Stepan Rutz
				</span>
			</SidebarFooter>
			<SidebarResizeHandle />
		</Sidebar>
	);
}
