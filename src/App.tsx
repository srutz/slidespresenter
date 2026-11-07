import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Menu } from "./components/app/Menu";
import { SideMenu } from "./components/app/SIdeMenu";

const SHOW_MENU = !true;

export function App() {


	return (
		<SidebarProvider>
			<SideMenu />
			<SidebarInset className="bg-taupe-100">
				<header className="flex items-center gap-1 bg-white px-3 py-1">
					<SidebarTrigger />
					{SHOW_MENU && <Menu />}
				</header>
				<div className="grow flex flex-col gap-1" />
			</SidebarInset>
		</SidebarProvider>
	);
}
