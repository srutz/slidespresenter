import { useCallback, useEffect, useState } from "react";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePresentations, useSlides } from "@/lib/presentations";
import { PresentationViewer } from "./components/app/PresentationViewer";
import { SideMenu } from "./components/app/SIdeMenu";

// location hash: #/<presentation-id>/<slide-number, 1-based>
function parseHash() {
	const [, id, n] = decodeURIComponent(location.hash).split("/");
	return { id: id || null, index: Math.max(0, (Number(n) || 1) - 1) };
}

export function App() {
	const { presentations, error } = usePresentations();
	const [{ id, index }, setPos] = useState(parseHash);

	useEffect(() => {
		const onHash = () => setPos(parseHash());
		window.addEventListener("hashchange", onHash);
		return () => window.removeEventListener("hashchange", onHash);
	}, []);

	const go = useCallback((id: string, index: number) => {
		location.hash = `/${encodeURIComponent(id)}/${index + 1}`;
	}, []);

	const presentation = presentations?.find((p) => p.id === id) ?? null;
	const slides = useSlides(presentation);
	const clamped = slides ? Math.min(index, slides.length - 1) : 0;

	return (
		<SidebarProvider>
			<SideMenu
				presentations={presentations}
				error={error}
				selectedId={presentation?.id ?? null}
				onSelect={(id) => go(id, 0)}
			/>
			<SidebarInset className="min-w-0 bg-taupe-100">
				<header className="flex items-center gap-1 bg-white px-3 py-1">
					<SidebarTrigger />
					<span className="text-sm font-medium">{presentation?.id}</span>
				</header>
				<PresentationViewer
					presentation={presentation}
					slides={slides}
					index={clamped}
					onIndexChange={(i) => presentation && go(presentation.id, i)}
				/>
			</SidebarInset>
		</SidebarProvider>
	);
}
