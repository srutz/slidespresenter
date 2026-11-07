import { ChevronLeft, ChevronRight } from "lucide-react";
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/settings";
import type { Presentation, TocNode } from "@/lib/presentations";
import { CodeBlock } from "./CodeBlock";
import { SlideToc } from "./SlideToc";

/** width in px the slide is laid out at before scaling */
const FIT_WIDTH = 1280;

type Props = {
	presentation: Presentation | null;
	/** all slides of the presentation, null while loading */
	slides: string[] | null;
	/** table of contents, shown below the title of the first slide */
	toc?: TocNode[];
	index: number;
	onIndexChange: (index: number) => void;
};

export function PresentationViewer({
	presentation,
	slides,
	toc = [],
	index,
	onIndexChange,
}: Props) {
	const count = slides?.length ?? 0;
	const [{ scaleToFit }] = useSettings();
	const containerRef = useRef<HTMLDivElement>(null);
	const articleRef = useRef<HTMLElement>(null);
	const [fit, setFit] = useState({ scale: 1, height: 0 });

	// scale the slide (laid out at FIT_WIDTH) so it fits the container
	useLayoutEffect(() => {
		const container = containerRef.current;
		const article = articleRef.current;
		if (!scaleToFit || !container || !article) return;
		function measure() {
			if (!container || !article) return;
			const cs = getComputedStyle(container);
			const w =
				container.clientWidth -
				parseFloat(cs.paddingLeft) -
				parseFloat(cs.paddingRight);
			const h =
				container.clientHeight -
				parseFloat(cs.paddingTop) -
				parseFloat(cs.paddingBottom);
			const height = article.offsetHeight;
			if (w <= 0 || h <= 0 || height <= 0) return;
			const scale = Math.min(w / FIT_WIDTH, h / height);
			setFit((f) =>
				f.scale === scale && f.height === height ? f : { scale, height },
			);
		}
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(container);
		ro.observe(article);
		return () => ro.disconnect();
	}, [scaleToFit]);

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.target instanceof HTMLElement && e.target.closest("input,textarea"))
				return;
			if (["ArrowRight", "PageDown", " "].includes(e.key))
				onIndexChange(Math.min(count - 1, index + 1));
			else if (["ArrowLeft", "PageUp"].includes(e.key))
				onIndexChange(Math.max(0, index - 1));
			else if (e.key === "Home") onIndexChange(0);
			else if (e.key === "End") onIndexChange(count - 1);
			else return;
			e.preventDefault();
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [count, index, onIndexChange]);

	if (!presentation) {
		return (
			<div className="grow flex items-center justify-center text-muted-foreground">
				Select a presentation
			</div>
		);
	}

	// resolve relative image paths against the presentation directory
	const base = `/${encodeURIComponent(presentation.id)}/`;
	const text = slides?.[index] ?? "";
	// on the first slide the toc goes right below the title line, or after the
	// whole slide when it has no "# " title (e.g. only front matter)
	const parts = [text];
	if (index === 0 && toc.length > 0) {
		const m = text.match(/^# .*$/m);
		const end = m?.index !== undefined ? m.index + m[0].length : text.length;
		parts.splice(0, 1, text.slice(0, end), text.slice(end));
	}

	return (
		<div className="grow h-1 min-w-0 flex flex-col">
			<div
				ref={containerRef}
				className={
					scaleToFit
						? "grow overflow-hidden px-2.5 py-6 flex"
						: "grow overflow-y-auto overflow-x-hidden px-2.5 py-6"
				}
			>
				<div
					className={scaleToFit ? "m-auto shrink-0" : "contents"}
					style={
						scaleToFit
							? { width: FIT_WIDTH * fit.scale, height: fit.height * fit.scale }
							: undefined
					}
				>
					<article
						ref={articleRef}
						className="slide min-w-0 mx-auto max-w-7xl rounded-lg bg-white p-10 shadow-sm"
						style={
							scaleToFit
								? {
										width: FIT_WIDTH,
										maxWidth: "none",
										transform: `scale(${fit.scale})`,
										transformOrigin: "top left",
									}
								: undefined
						}
					>
						{parts.map((part, i) => (
							<Fragment key={i === 1 ? "toc" : i}>
								{i === 1 && <SlideToc toc={toc} id={presentation.id} />}
								{part && (
									<ReactMarkdown
										remarkPlugins={[remarkGfm]}
										components={{ pre: CodeBlock }}
										rehypePlugins={[[rehypeHighlight, { detect: false }]]}
										urlTransform={(u) =>
											/^([a-z]+:|\/|#)/i.test(u) ? u : base + u.replace(/^\.\//, "")
										}
									>
										{part}
									</ReactMarkdown>
								)}
							</Fragment>
						))}
					</article>
				</div>
			</div>
			<footer className="chrome flex items-center justify-center gap-3 bg-white px-3 py-1">
				<Button
					variant="ghost"
					size="icon"
					disabled={index <= 0}
					onClick={() => onIndexChange(index - 1)}
				>
					<ChevronLeft />
				</Button>
				<span className="text-sm tabular-nums">
					{index + 1} / {count}
				</span>
				<Button
					variant="ghost"
					size="icon"
					disabled={index >= count - 1}
					onClick={() => onIndexChange(index + 1)}
				>
					<ChevronRight />
				</Button>
			</footer>
		</div>
	);
}
