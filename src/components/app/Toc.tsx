import { Collapsible } from "@base-ui/react/collapsible";
import { Link, useParams } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { TocNode } from "@/lib/presentations";

type Props = {
	presentationId: string;
	toc: TocNode[];
};

/** last slide covered by this node (including all descendants) */
function lastSlide(n: TocNode): number {
	return n.children.reduce((m, c) => Math.max(m, lastSlide(c)), n.slide);
}

function TocItem({
	node,
	presentationId,
	current,
	Item,
	Sub,
}: {
	node: TocNode;
	presentationId: string;
	current: number;
	Item: typeof SidebarMenuItem | typeof SidebarMenuSubItem;
	Sub: typeof SidebarMenuSub;
}) {
	const hasChildren = node.children.length > 0;
	const active = !node.synthetic && node.slide === current;
	// expanded by default when the current slide lies within this branch
	const defaultOpen = current >= node.slide && current <= lastSlide(node);

	const link = (
		<Link
			to="/$id/$slide"
			params={{ id: presentationId, slide: String(node.slide + 1) }}
			data-active={active || undefined}
			className="flex h-7 min-w-0 flex-1 items-center overflow-hidden rounded-md px-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:font-medium"
		>
			<span className="truncate">{node.title}</span>
		</Link>
	);

	if (!hasChildren) return <Item>{link}</Item>;

	return (
		<Collapsible.Root defaultOpen={defaultOpen} render={<Item />}>
			<div className="flex items-center">
				<Collapsible.Trigger
					aria-label="Toggle section"
					className="group/trigger flex size-6 shrink-0 items-center justify-center rounded-md hover:bg-sidebar-accent"
				>
					<ChevronRight className="size-4 transition-transform group-data-panel-open/trigger:rotate-90" />
				</Collapsible.Trigger>
				{link}
			</div>
			<Collapsible.Panel>
				<Sub className="mx-2 gap-0 pr-0 pl-1">
					{node.children.map((c, i) => (
						<TocItem
							// biome-ignore lint/suspicious/noArrayIndexKey: static list
							key={i}
							node={c}
							presentationId={presentationId}
							current={current}
							Item={SidebarMenuSubItem}
							Sub={SidebarMenuSub}
						/>
					))}
				</Sub>
			</Collapsible.Panel>
		</Collapsible.Root>
	);
}

export function Toc({ presentationId, toc }: Props) {
	const { slide } = useParams({ strict: false });
	const current = Math.max(0, (Number(slide) || 1) - 1);
	if (toc.length === 0) return null;
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Contents</SidebarGroupLabel>
			<SidebarMenu>
				{toc.map((n, i) => (
					<TocItem
						// biome-ignore lint/suspicious/noArrayIndexKey: static list
						key={i}
						node={n}
						presentationId={presentationId}
						current={current}
						Item={SidebarMenuItem}
						Sub={SidebarMenuSub}
					/>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
