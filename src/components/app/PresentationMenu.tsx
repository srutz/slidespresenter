import { Link } from "@tanstack/react-router";
import { Presentation as PresentationIcon } from "lucide-react";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { Presentation } from "@/lib/presentations";

type Props = {
	presentations: Presentation[] | null;
	error: string | null;
	selectedId: string | null;
};

export function PresentationMenu({ presentations, error, selectedId }: Props) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Presentations</SidebarGroupLabel>
			<SidebarMenu>
				{error && <p className="px-2 text-sm text-destructive">{error}</p>}
				{!presentations && !error && (
					<p className="px-2 text-sm text-muted-foreground">Loading…</p>
				)}
				{presentations?.length === 0 && (
					<p className="px-2 text-sm text-muted-foreground">
						No presentations found in public/
					</p>
				)}
				{presentations?.map((p) => (
					<SidebarMenuItem key={p.id}>
						<SidebarMenuButton
							isActive={p.id === selectedId}
							render={<Link to="/$id/$slide" params={{ id: p.id, slide: "1" }} />}
						>
							<PresentationIcon />
							<span>{p.id}</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
