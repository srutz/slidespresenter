import { Link } from "@tanstack/react-router";
import type { TocNode } from "@/lib/presentations";

function Items({ nodes, id }: { nodes: TocNode[]; id: string }) {
	return (
		<ul>
			{nodes.map((n, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static list
				<li key={i}>
					<Link to="/$id/$slide" params={{ id, slide: String(n.slide + 1) }}>
						{n.title}
					</Link>
					{n.children.length > 0 && <Items nodes={n.children} id={id} />}
				</li>
			))}
		</ul>
	);
}

/** Linked table of contents shown on the first slide, below its title. */
export function SlideToc({ toc, id }: { toc: TocNode[]; id: string }) {
	// the title heading of the first slide is replaced by its children
	const first = toc[0];
	const nodes =
		first && !first.synthetic && first.slide === 0
			? [...first.children, ...toc.slice(1)]
			: toc;
	if (nodes.length === 0) return null;
	return (
		<nav aria-label="Contents">
			<Items nodes={nodes} id={id} />
		</nav>
	);
}
