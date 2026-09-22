import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Pencil, DollarSign, Package } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  description: string;
  price_amount: number;
  period: string;
  stripe_product_id: string | null;
  stripe_price_id: string;
  enabled: boolean;
  display_order: number;
}

interface AdminProductsProps {
  products: Product[];
  onProductUpdated: () => void;
}

const AdminProducts = ({ products, onProductUpdated }: AdminProductsProps) => {
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [syncing, setSyncing] = useState<string | null>(null);
  const { toast } = useToast();

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setEditName(p.name);
    setEditDesc(p.description);
    setEditPrice(String(p.price_amount / 100));
  };

  const syncToStripe = async (productId: string, updates: Record<string, unknown>) => {
    setSyncing(productId);
    try {
      const { data, error } = await supabase.functions.invoke("sync-product-to-stripe", {
        body: { product_id: productId, ...updates },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      toast({ title: "Product synced", description: "Changes saved and synced with Stripe." });
      onProductUpdated();
    } catch (err: any) {
      toast({ title: "Sync failed", description: err.message, variant: "destructive" });
    } finally {
      setSyncing(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editProduct) return;
    const priceInCents = Math.round(parseFloat(editPrice) * 100);
    if (isNaN(priceInCents) || priceInCents <= 0) {
      toast({ title: "Invalid price", variant: "destructive" });
      return;
    }
    await syncToStripe(editProduct.id, {
      name: editName,
      description: editDesc,
      price_amount: priceInCents,
    });
    setEditProduct(null);
  };

  const handleToggle = async (p: Product) => {
    await syncToStripe(p.id, { enabled: !p.enabled });
  };

  const sorted = [...products].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Package className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-foreground">Products & Plans</h3>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-left">
              <th className="px-4 py-2.5 font-medium text-muted-foreground">Product</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground">Price</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.description}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-semibold text-foreground">{(p.price_amount / 100).toFixed(0)}</span>
                    <span className="text-xs text-muted-foreground">{p.period}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={p.enabled}
                      onCheckedChange={() => handleToggle(p)}
                      disabled={syncing === p.id}
                    />
                    <Badge variant={p.enabled ? "default" : "secondary"} className="text-[10px]">
                      {p.enabled ? "Active" : "Disabled"}
                    </Badge>
                    {syncing === p.id && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(p)} disabled={syncing === p.id}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Changes are automatically synced with Stripe. Price changes create a new Stripe Price and archive the old one.
      </p>

      {/* Edit Dialog */}
      <Dialog open={!!editProduct} onOpenChange={(o) => !o && setEditProduct(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground">Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="mt-1" rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Price (USD)</label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="pl-9" type="number" min="1" step="1" />
              </div>
            </div>
            {editProduct && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Stripe Price ID: <code className="bg-muted px-1 rounded">{editProduct.stripe_price_id}</code></p>
                {editProduct.stripe_product_id && (
                  <p>Stripe Product ID: <code className="bg-muted px-1 rounded">{editProduct.stripe_product_id}</code></p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProduct(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={syncing !== null}>
              {syncing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Save & Sync
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
