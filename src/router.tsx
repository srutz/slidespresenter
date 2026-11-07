import {
	createHashHistory,
	createRootRoute,
	createRoute,
	createRouter,
	Link,
	Outlet,
	redirect,
	useCanGoBack,
	useNavigate,
	useParams,
	useRouter,
} from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
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
import { ChromeAutoHide } from "./components/app/ChromeAutoHide";
import { FullscreenToggle } from "./components/app/FullscreenToggle";
import { PresentationViewer } from "./components/app/PresentationViewer";
import { SettingsDialog } from "./components/app/SettingsDialog";
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
			<ChromeAutoHide />
			<SideMenu
				toc={toc}
				presentations={presentations}
				error={error}
				selectedId={presentation?.id ?? null}
			/>
			<SidebarInset className="min-w-0 bg-taupe-100">
				<header className="chrome flex items-center gap-1 bg-white px-3 py-1">
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
					<div className="ml-auto flex items-center">
						<FullscreenToggle />
						<Button
							variant="ghost"
							size="icon"
							aria-label="Settings"
							title="Settings"
							render={<Link to="/settings" />}
						>
							<Settings />
						</Button>
					</div>
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

// /settings -> settings dialog (static route wins over /$id)
const settingsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/settings",
	component: SettingsPage,
});

function SettingsPage() {
	const navigate = useNavigate();
	const canGoBack = useCanGoBack();
	const router = useRouter();
	return (
		<SettingsDialog
			onClose={() => (canGoBack ? router.history.back() : navigate({ to: "/" }))}
		/>
	);
}

const routeTree = rootRoute.addChildren([
	indexRoute,
	settingsRoute,
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
