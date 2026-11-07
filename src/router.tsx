import {
	createHashHistory,
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
	redirect,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
import { useMemo } from "react";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import {
	buildToc,
	fetchPresentations,
	type Presentation,
	useSlides,
} from "@/lib/presentations";
import { FullscreenToggle } from "./components/app/FullscreenToggle";
import { PresentationViewer } from "./components/app/PresentationViewer";
import { SlideBreadcrumb } from "./components/app/SlideBreadcrumb";
import { SideMenu } from "./components/app/SIdeMenu";

const rootRoute = createRootRoute({
	loader: async () => {
		try {
			return {
				presentations: await fetchPresentations(),
				error: null as string | null,
			};
		} catch (e) {
			return { presentations: null, error: String(e) };
		}
	},
	component: RootLayout,
});

function RootLayout() {
	const { presentations, error } = rootRoute.useLoaderData();
	const { id, slide } = useParams({ strict: false });
	const navigate = useNavigate();
	const presentation = presentations?.find((p) => p.id === id) ?? null;

	const slides = useSlides(presentation);
	const toc = useMemo(() => (slides ? buildToc(slides) : []), [slides]);

	return (
		<SidebarProvider>
			<SideMenu
				toc={toc}
				presentations={presentations}
				error={error}
				selectedId={presentation?.id ?? null}
			/>
			<SidebarInset className="min-w-0 bg-taupe-100">
				<header className="flex items-center gap-1 bg-white px-3 py-1">
					<SidebarTrigger />
					{presentation && (
						<SlideBreadcrumb
							presentationId={presentation.id}
							toc={toc}
							slide={Math.max(0, (Number(slide) || 1) - 1)}
							onNavigate={(i) =>
								navigate({
									to: "/$id/$slide",
									params: { id: presentation.id, slide: String(i + 1) },
								})
							}
						/>
					)}
					<FullscreenToggle />
				</header>
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
}

const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: () => (
		<PresentationViewer
			presentation={null}
			slides={null}
			index={0}
			onIndexChange={() => {}}
		/>
	),
});

// /<presentation-id> -> first slide
const presentationRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/$id",
	beforeLoad: ({ params }) => {
		throw redirect({ to: "/$id/$slide", params: { ...params, slide: "1" } });
	},
});

// /<presentation-id>/<slide-number, 1-based>
const slideRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/$id/$slide",
	component: SlidePage,
});

function SlidePage() {
	const { id, slide } = slideRoute.useParams();
	const { presentations } = rootRoute.useLoaderData();
	const navigate = useNavigate();
	const presentation: Presentation | null =
		presentations?.find((p) => p.id === id) ?? null;
	const slides = useSlides(presentation);
	const toc = useMemo(() => (slides ? buildToc(slides) : []), [slides]);
	const index = Math.max(0, (Number(slide) || 1) - 1);
	const clamped = slides ? Math.min(index, slides.length - 1) : 0;

	return (
		<PresentationViewer
			presentation={presentation}
			slides={slides}
			toc={toc}
			index={clamped}
			onIndexChange={(i) =>
				navigate({
					to: "/$id/$slide",
					params: { id, slide: String(i + 1) },
				})
			}
		/>
	);
}

const routeTree = rootRoute.addChildren([
	indexRoute,
	presentationRoute,
	slideRoute,
]);

// hash history keeps the existing #/<id>/<n> URLs working
export const router = createRouter({
	routeTree,
	history: createHashHistory(),
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
