import { Toaster } from "sonner";
import { useMarket } from "@/lib/marketplace/store";
import { CartScreen } from "./CartScreen";
import { CategoryScreen } from "./CategoryScreen";
import { CheckoutScreen } from "./CheckoutScreen";
import { CouponQrScreen, CouponWallet } from "./CouponWallet";
import { DealDetail, ProductDetail, SubscriptionDetail } from "./ListingDetail";
import { MarketplaceHeader } from "./MarketplaceHeader";
import { MarketplaceHome } from "./MarketplaceHome";
import { MarketplaceSearch } from "./MarketplaceSearch";
import { MyMarketplace, OrderDetail, ReviewScreen } from "./MyMarketplace";
import { SportixImpactHome } from "./SportixImpactHome";

function StackScreen() {
  const screen = useMarket((s) => s.stack[s.stack.length - 1]);
  if (!screen) return null;
  switch (screen.type) {
    case "search":
      return <MarketplaceSearch />;
    case "category":
      return <CategoryScreen category={screen.category} />;
    case "deal":
      return <DealDetail id={screen.id} />;
    case "product":
      return <ProductDetail id={screen.id} />;
    case "subscription":
      return <SubscriptionDetail id={screen.id} />;
    case "impact":
      return <SportixImpactHome id={screen.id} />;
    case "cart":
      return <CartScreen />;
    case "checkout":
      return <CheckoutScreen listingId={screen.listingId} source={screen.source} />;
    case "wallet":
      return <CouponWallet />;
    case "coupon-qr":
      return <CouponQrScreen couponId={screen.couponId} />;
    case "activity":
      return <MyMarketplace />;
    case "order":
      return <OrderDetail id={screen.id} />;
    case "review":
      return <ReviewScreen orderId={screen.orderId} />;
    default:
      return null;
  }
}

export function MarketplaceShell() {
  const stacked = useMarket((s) => s.stack.length > 0);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col pb-14 md:max-w-3xl lg:max-w-4xl">
        {stacked ? (
          <StackScreen />
        ) : (
          <>
            <MarketplaceHeader />
            <main className="flex-1">
              <MarketplaceHome />
            </main>
          </>
        )}
      </div>
      <Toaster
        theme="dark"
        position="bottom-center"
        toastOptions={{
          className: "!bg-elevated !text-fg !border-border !text-sm",
        }}
      />
    </div>
  );
}
