import { useEffect, useState } from "react";

export type Presentation = {
	/** directory name below public/ */
	id: string;
	/** slide file names, in order */
	slides: string[];
};

export function usePresentations() {
	const [presentations, setPresentations] = useState<Presentation[] | null>(
		null,
	);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetch("/presentations.json")
			.then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.statusText))))
			.then(setPresentations)
			.catch((e) => setError(String(e)));
	}, []);

	return { presentations, error };
}

/**
 * A file may contain several slides: each top-level heading ("# ...")
 * outside of a code fence starts a new slide.
 */
export function splitSlides(markdown: string): string[] {
	const slides: string[] = [];
	let current: string[] = [];
	let fence: string | null = null;
	const flush = () => {
		const text = current.join("\n").trim();
		if (text) slides.push(text);
		current = [];
	};
	for (const line of markdown.split(/\r?\n/)) {
		const m = line.match(/^\s*(```+|~~~+)/);
		if (m) {
			if (!fence) fence = m[1][0];
			else if (m[1][0] === fence) fence = null;
		}
		if (!fence && /^# /.test(line)) flush();
		current.push(line);
	}
	flush();
	return slides;
}

/** Loads all files of a presentation and returns its slides in order. */
export function useSlides(p: Presentation | null) {
	const [loaded, setLoaded] = useState<{ id: string; slides: string[] } | null>(
		null,
	);

	useEffect(() => {
		if (!p) return;
		let cancelled = false;
		Promise.all(
			p.slides.map((file) =>
				fetch(`/${encodeURIComponent(p.id)}/${encodeURIComponent(file)}`)
					.then((r) => (r.ok ? r.text() : `**Error loading ${file}**`))
					.catch(() => `**Error loading ${file}**`),
			),
		).then((texts) => {
			if (!cancelled)
				setLoaded({ id: p.id, slides: texts.flatMap(splitSlides) });
		});
		return () => {
			cancelled = true;
		};
	}, [p]);

	return p && loaded?.id === p.id ? loaded.slides : null;
}
