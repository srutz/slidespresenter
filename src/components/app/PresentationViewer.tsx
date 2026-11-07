import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import type { Presentation } from "@/lib/presentations";

type Props = {
	presentation: Presentation | null;
	/** all slides of the presentation, null while loading */
	slides: string[] | null;
	index: number;
	onIndexChange: (index: number) => void;
};

export function PresentationViewer({
	presentation,
	slides,
	index,
	onIndexChange,
}: Props) {
	const count = slides?.length ?? 0;

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

	return (
		<div className="grow h-1 min-w-0 flex flex-col">
			<div className="grow overflow-y-auto overflow-x-hidden p-6">
				<article className="slide min-w-0 mx-auto max-w-4xl rounded-lg bg-white p-10 shadow-sm">
					<ReactMarkdown
						remarkPlugins={[remarkGfm]}
						urlTransform={(u) =>
							/^([a-z]+:|\/|#)/i.test(u) ? u : base + u.replace(/^\.\//, "")
						}
					>
						{text}
					</ReactMarkdown>
				</article>
			</div>
			<footer className="flex items-center justify-center gap-3 bg-white px-3 py-1">
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
