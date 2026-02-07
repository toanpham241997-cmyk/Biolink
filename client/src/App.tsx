import { Switch, Route } from "wouter";

import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import FilesPage from "@/pages/Files";
import Shop from "@/pages/Shop";
import ShopParent from "@/pages/ShopParent";
import ShopItem from "@/pages/ShopItem";
import ChatPage from "@/pages/Chat";
import OrdersPage from "@/pages/Orders";
import OrderDetailPage from "@/pages/OrderDetail";
import UploadPage from "@/pages/Upload";
import NotFound from "@/pages/not-found";

import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

function Router() {
  return (
    <Switch>
      {/* HOME – PHẢI ĐỨNG ĐẦU */}
      <Route path="/" component={Home} />

      {/* SHOP */}
      <Route path="/shop" component={Shop} />
      <Route path="/shop/p/:parentId" component={ShopParent} />
      <Route path="/shop/i/:itemId" component={ShopItem} />

      {/* OTHER */}
      <Route path="/auth" component={Auth} />
      <Route path="/files" component={FilesPage} />
      <Route path="/upload" component={UploadPage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/orders" component={OrdersPage} />
      <Route path="/orders/:id" component={OrderDetailPage} />

      {/* 404 */}
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
