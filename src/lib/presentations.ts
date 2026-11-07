import { useEffect, useState } from "react";

export type Presentation = {
	/** directory name below public/ */
	id: string;
	/** slide file names, in order */
	slides: string[];
};

export function fetchPresentations(): Promise<Presentation[]> {
	return fetch("/presentations.json").then((r) =>
		r.ok ? r.json() : Promise.reject(new Error(r.statusText)),
	);
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
			if (!cancelled) setLoaded({ id: p.id, slides: texts.flatMap(splitSlides) });
		});
		return () => {
			cancelled = true;
		};
	}, [p]);

	return p && loaded?.id === p.id ? loaded.slides : null;
}

export type TocNode = {
	title: string;
	/** 0-based index of the slide containing the heading */
	slide: number;
	level: number;
	children: TocNode[];
	/** chapter entry generated from the common title prefix, not a heading */
	synthetic?: boolean;
};

const stripInline = (s: string) =>
	s
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/[`*_~]/g, "")
		.trim();

/** Builds a hierarchical table of contents from the headings of all slides. */
export function buildToc(slides: string[]): TocNode[] {
	const roots: TocNode[] = [];
	const stack: TocNode[] = [];
	slides.forEach((slide, slideIndex) => {
		let fence: string | null = null;
		for (const line of slide.split(/\r?\n/)) {
			const f = line.match(/^\s*(```+|~~~+)/);
			if (f) {
				if (!fence) fence = f[1][0];
				else if (f[1][0] === fence) fence = null;
				continue;
			}
			if (fence) continue;
			const m = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
			if (!m) continue;
			const node: TocNode = {
				title: stripInline(m[2]),
				slide: slideIndex,
				level: m[1].length,
				children: [],
			};
			while (stack.length && stack[stack.length - 1].level >= node.level)
				stack.pop();
			(stack.length ? stack[stack.length - 1].children : roots).push(node);
			stack.push(node);
		}
	});
	return groupChapters(mergeSameTitle(roots));
}

/** Consecutive top-level headings with an identical title become one entry. */
function mergeSameTitle(nodes: TocNode[]): TocNode[] {
	const out: TocNode[] = [];
	for (const n of nodes) {
		const prev = out[out.length - 1];
		if (prev && prev.title === n.title) prev.children.push(...n.children);
		else out.push({ ...n, children: [...n.children] });
	}
	return out;
}

// "2.1 React Einführung / Überblick" -> number "2.1", chapter, rest
const CHAPTER_RE = /^(\d+(?:\.\d+)?)\s+(.+?)\s+\/\s+(.+)$/;
// unnumbered: "React Patterns / P1 - Foo" -> chapter, rest
const TOPIC_RE = /^(.+?)\s+\/\s+(.+)$/;

/**
 * Top-level titles of the form "<n.m> <Chapter> / <Title>" are grouped below
 * a synthetic "<n> <Chapter>" entry (even when interrupted by other entries)
 * and shortened to "<n.m> <Title>". Unnumbered "<Topic> / <Title>" entries are
 * grouped below "<Topic>" (an existing heading of that name is reused).
 */
function groupChapters(nodes: TocNode[]): TocNode[] {
	const out: TocNode[] = [];
	const numbered = new Map<string, TocNode>();
	for (const n of nodes) {
		const m = n.title.match(CHAPTER_RE);
		if (m) {
			const key = `${m[1].split(".")[0]} ${m[2]}`;
			const item = { ...n, title: `${m[1]} ${m[3]}` };
			const group = numbered.get(key);
			if (group) group.children.push(item);
			else {
				const g: TocNode = {
					title: key,
					slide: n.slide,
					level: 0,
					children: [item],
					synthetic: true,
				};
				numbered.set(key, g);
				out.push(g);
			}
			continue;
		}
		const t = n.title.match(TOPIC_RE);
		if (t) {
			const prev = out[out.length - 1];
			if (prev && prev.title === t[1] && !numbered.has(t[1])) {
				prev.children.push({ ...n, title: t[2] });
				continue;
			}
			out.push({
				title: t[1],
				slide: n.slide,
				level: 0,
				children: [{ ...n, title: t[2] }],
				synthetic: true,
			});
			continue;
		}
		out.push(n);
	}
	return out;
}
