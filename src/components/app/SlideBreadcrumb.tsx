import { ChevronRight } from "lucide-react";
import { Fragment } from "react";
import type { TocNode } from "@/lib/presentations";

/** Path from the root of the toc to the heading that contains `slide`. */
export function findTocPath(toc: TocNode[], slide: number): TocNode[] {
	let best: { slide: number; path: TocNode[] } | null = null;
	const walk = (nodes: TocNode[], parents: TocNode[]) => {
		for (const n of nodes) {
			const path = [...parents, n];
			if (n.slide <= slide && (!best || n.slide >= best.slide))
				best = { slide: n.slide, path };
			walk(n.children, path);
		}
	};
	walk(toc, []);
	return (best as { path: TocNode[] } | null)?.path ?? [];
}

type Props = {
	presentationId: string;
	toc: TocNode[];
	/** 0-based index of the current slide */
	slide: number;
	onNavigate: (slide: number) => void;
};

export function SlideBreadcrumb({
	presentationId,
	toc,
	slide,
	onNavigate,
}: Props) {
	const path = findTocPath(toc, slide);
	return (
		<nav aria-label="Breadcrumb" className="min-w-0">
			<ol className="flex items-center gap-1 text-sm">
				<li className="shrink-0 font-medium">{presentationId}</li>
				{path.map((node, i) => {
					const last = i === path.length - 1;
					return (
						<Fragment key={`${i}-${node.title}`}>
							<li aria-hidden className="shrink-0 text-muted-foreground">
								<ChevronRight className="size-3.5" />
							</li>
							<li className="min-w-0 truncate">
								{last ? (
									<span aria-current="page">{node.title}</span>
								) : (
									<button
										type="button"
										className="truncate text-muted-foreground hover:text-foreground"
										onClick={() => onNavigate(node.slide)}
									>
										{node.title}
									</button>
								)}
							</li>
						</Fragment>
					);
				})}
			</ol>
		</nav>
	);
}
