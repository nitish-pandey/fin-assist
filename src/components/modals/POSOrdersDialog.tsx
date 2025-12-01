import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Package, Calendar } from "lucide-react";
import { Order } from "@/data/types";

interface POSOrdersDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orders: Order[];
}

export default function POSOrdersDialog({ open, onOpenChange, orders }: POSOrdersDialogProps) {
    const formatCurrency = (amount: number) => `Rs ${amount.toFixed(2)}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Register Orders ({orders.length})
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                    {orders.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No orders yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">
                                                    #{order.id.slice(-6).toUpperCase()}
                                                </span>
                                                <Badge variant="outline" className="text-xs">
                                                    {order.type}
                                                </Badge>
                                            </div>
                                            {order.entity && (
                                                <p className="text-xs text-muted-foreground">
                                                    {order.entity.name}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">
                                                {formatCurrency(order.totalAmount)}
                                            </p>
                                            {order.discount > 0 && (
                                                <p className="text-xs text-green-600">
                                                    -{formatCurrency(order.discount)} discount
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Products */}
                                    {order.items && order.items.length > 0 && (
                                        <div className="bg-muted/50 rounded p-2 mb-2">
                                            {order.items.map((op) => (
                                                <div
                                                    key={op.id}
                                                    className="flex justify-between text-xs py-0.5"
                                                >
                                                    <span className="flex items-center gap-1">
                                                        <Package className="h-3 w-3" />
                                                        {op.name}
                                                        <span className="text-muted-foreground">
                                                            x{op.quantity}
                                                        </span>
                                                    </span>
                                                    <span>
                                                        {formatCurrency(op.price * op.quantity)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(order.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
