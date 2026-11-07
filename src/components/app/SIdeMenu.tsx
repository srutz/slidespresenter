import { ChevronDown } from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

export function SideMenu() {
	return (
		<Sidebar>
			<SidebarHeader>
				<span className="px-2 py-1 text-lg font-semibold">AppTitle</span>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup />
				<SidebarGroup />
			</SidebarContent>
			<SidebarFooter>
				<span className="px-2 py-1 text-xs text-muted-foreground">(c) Stepan Rutz</span>
			</SidebarFooter>
		</Sidebar>
	);
}
