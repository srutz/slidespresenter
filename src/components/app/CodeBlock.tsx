import { Check, Copy, Ellipsis, Type } from "lucide-react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { type ComponentProps, isValidElement, useRef, useState } from "react";
import { Mermaid } from "./Mermaid";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SIZES = [
	{ value: "1", label: "Normal" },
	{ value: "0.85", label: "Small" },
	{ value: "0.7", label: "Smaller" },
	{ value: "0.55", label: "Tiny" },
];

/** `pre` replacement with a small menu: copy all, code size. */
export function CodeBlock({
	children,
	node: _node,
	...props
}: ComponentProps<"pre"> & { node?: unknown }) {
	if (isValidElement<ComponentProps<"code">>(children)) {
		const { className, children: code } = children.props;
		if (/\blanguage-mermaid\b/.test(className ?? "")) {
			return <Mermaid chart={String(code ?? "").trim()} />;
		}
	}
	return <CodeBlockInner {...props}>{children}</CodeBlockInner>;
}

function CodeBlockInner({
	children,
	...props
}: ComponentProps<"pre">) {
	const ref = useRef<HTMLPreElement>(null);
	const [size, setSize] = useLocalStorage("codeblock-font-size", "1");
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(ref.current?.textContent ?? "");
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			// clipboard not available
		}
	};

	return (
		<div className="group/code relative my-3">
			<pre
				{...props}
				ref={ref}
				style={{ fontSize: `${size}em`, marginTop: 0, marginBottom: 0 }}
			>
				{children}
			</pre>
			<DropdownMenu>
				<DropdownMenuTrigger
					aria-label="Code block menu"
					className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-md bg-background/70 text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover/code:opacity-100 data-popup-open:opacity-100"
				>
					<Ellipsis className="size-4" />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-40">
					<DropdownMenuItem onClick={copy}>
						{copied ? <Check /> : <Copy />}
						{copied ? "Copied" : "Copy all"}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuLabel className="flex items-center gap-1.5">
							<Type className="size-3.5" />
							Size
						</DropdownMenuLabel>
						<DropdownMenuRadioGroup value={size} onValueChange={setSize}>
							{SIZES.map((s) => (
								<DropdownMenuRadioItem key={s.value} value={s.value}>
									{s.label}
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
