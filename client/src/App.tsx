import { Switch, Route } from "wouter";
import Auth from "@/pages/Auth";
import FilesPage from "@/pages/Files";
import Shop from "@/pages/Shop";
import ShopParent from "@/pages/ShopParent";
import ShopItem from "@/pages/ShopItem";
import ChatPage from "@/pages/Chat";
import OrdersPage from "@/pages/Orders";
import OrderDetailPage from "@/pages/OrderDetail";
import UploadPage from "@/pages/Upload"; // hoặc "@/pages/UploadPage" tùy tên file của bạn
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
function Router() {
  return (
    <Switch>
      {/* Home */}
      <Route path="/" component={Home} />

      {/* ✅ Upload page */}
      <Route path="/upload" component={UploadPage} />
      <Route path="/chat" component={ChatPage} />
        <Route path="/orders" component={OrdersPage} />
        <Route path="/orders/:id" component={OrderDetailPage} />
      <Route path="/files" component={FilesPage} />
      
      <Route path="/shop/p/:parentId" component={ShopParent} />
      <Route path="/shop/i/:itemId" component={ShopItem} />
      <Route path="/auth" component={Auth} />
      {/* ✅ 404 luôn để CUỐI */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
      }
