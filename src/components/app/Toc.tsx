import { Collapsible } from "@base-ui/react/collapsible";
import { Link, useParams } from "@tanstack/react-router";
import { ChevronRight, Crosshair, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
	SidebarGroup,
	SidebarGroupAction,
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
	focusTick,
	Item,
	Sub,
}: {
	node: TocNode;
	presentationId: string;
	current: number;
	focusTick: number;
	Item: typeof SidebarMenuItem | typeof SidebarMenuSubItem;
	Sub: typeof SidebarMenuSub;
}) {
	const hasChildren = node.children.length > 0;
	// a parent sharing its slide with a descendant defers to that descendant
	const active =
		!node.synthetic &&
		node.slide === current &&
		!node.children.some((c) => c.slide <= current && current <= lastSlide(c));
	// expanded by default when the current slide lies within this branch
	const contains = current >= node.slide && current <= lastSlide(node);
	const [open, setOpen] = useState(contains);
	// "select current slide" button: expand the branch containing the slide
	// biome-ignore lint/correctness/useExhaustiveDependencies: only react to the button
	useEffect(() => {
		if (focusTick > 0 && contains) setOpen(true);
	}, [focusTick]);

	const link = (
		<Link
			to="/$id/$slide"
			params={{ id: presentationId, slide: String(node.slide + 1) }}
			data-active={active || undefined}
			className="flex min-h-7 min-w-0 flex-1 items-center rounded-md px-2 py-0.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-foreground/15 data-active:font-medium"
		>
			<span className="wrap-break-word" title={node.title}>
				{node.title}
			</span>
		</Link>
	);

	// leaf without chevron: indent 20px
	if (!hasChildren) return <Item className="pl-5">{link}</Item>;

	return (
		<Collapsible.Root open={open} onOpenChange={setOpen} render={<Item />}>
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
							focusTick={focusTick}
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
	const [focusTick, setFocusTick] = useState(0);
	const groupRef = useRef<HTMLDivElement>(null);
	// after expanding, scroll the current slide's entry into view
	useEffect(() => {
		if (focusTick === 0) return;
		const t = setTimeout(() => {
			groupRef.current
				?.querySelector("[data-active]")
				?.scrollIntoView({ block: "center" });
		}, 60);
		return () => clearTimeout(t);
	}, [focusTick]);
	// pointer y-position (relative to the group) of the active entry
	const [markerTop, setMarkerTop] = useState<number | null>(null);
	// biome-ignore lint/correctness/useExhaustiveDependencies: re-measure on navigation
	useEffect(() => {
		const g = groupRef.current;
		if (!g) return;
		const measure = () => {
			const el = g.querySelector("[data-active]");
			if (!el) return setMarkerTop(null);
			const r = el.getBoundingClientRect();
			setMarkerTop(r.top - g.getBoundingClientRect().top + r.height / 2);
		};
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(g);
		const mo = new MutationObserver(measure);
		mo.observe(g, { childList: true, subtree: true, attributes: true });
		return () => {
			ro.disconnect();
			mo.disconnect();
		};
	}, [current, toc]);
	if (toc.length === 0) return null;
	return (
		<SidebarGroup ref={groupRef} className="relative">
			{markerTop !== null && (
				<Play
					aria-label="Current slide"
					style={{ top: markerTop }}
					className="pointer-events-none absolute left-0.5 size-2 -translate-y-1/2 fill-current"
				/>
			)}
			<SidebarGroupLabel>Contents</SidebarGroupLabel>
			<SidebarGroupAction
				title="Select current slide"
				aria-label="Select current slide"
				onClick={() => setFocusTick((t) => t + 1)}
			>
				<Crosshair />
			</SidebarGroupAction>
			<SidebarMenu>
				{toc.map((n, i) => (
					<TocItem
						// biome-ignore lint/suspicious/noArrayIndexKey: static list
						key={i}
						node={n}
						presentationId={presentationId}
						current={current}
						focusTick={focusTick}
						Item={SidebarMenuItem}
						Sub={SidebarMenuSub}
					/>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
