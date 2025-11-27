import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Extend jsPDF interface to include autoTable
declare module "jspdf" {
    interface jsPDF {
        autoTable: typeof autoTable;
        lastAutoTable: {
            finalY: number;
        };
    }
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "NPR",
        minimumFractionDigits: 2,
    }).format(amount || 0);
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

export const exportToExcel = (report: any) => {
    if (!report) return;

    const wb = XLSX.utils.book_new();

    // 1. Summary sheet
    const summaryData = [
        [
            "Report Period",
            `${formatDate(report.reportPeriod?.startDate)} to ${formatDate(
                report.reportPeriod?.endDate
            )}`,
        ],
        ["Days Count", report.reportPeriod?.daysCount],
        ["", ""],
        ["FINANCIAL SUMMARY", ""],
        ["Total Revenue", report.summary?.totalRevenue],
        ["Actual Revenue", report.summary?.actualRevenue],
        ["Total Cost", report.summary?.totalCost],
        ["Actual Cost", report.summary?.actualCost],
        ["Gross Profit", report.summary?.grossProfit],
        ["Net Profit", report.summary?.netProfit],
        ["", ""],
        ["ORDER SUMMARY", ""],
        ["Total Orders", report.summary?.totalOrders],
        ["Sell Orders", report.summary?.sellOrders],
        ["Buy Orders", report.summary?.buyOrders],
        ["Total Transactions", report.summary?.totalTransactions],
        ["Total Expenses", report.summary?.totalExpenses],
        ["Total Incomes", report.summary?.totalIncomes],
        ["Net Income/Expense", report.summary?.netIncomeExpense],
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    // 2. Payment Analysis sheet
    if (report.paymentAnalysis) {
        const paymentData = [
            ["PAYMENT STATUS ANALYSIS", ""],
            ["", ""],
            ["Status", "Count", "Percentage", "Revenue"],
            [
                "Paid",
                report.paymentAnalysis.paid,
                `${report.paymentAnalysis.paymentStatusPercentages?.paid}%`,
                report.paymentAnalysis.revenueByStatus?.paid,
            ],
            [
                "Pending",
                report.paymentAnalysis.pending,
                `${report.paymentAnalysis.paymentStatusPercentages?.pending}%`,
                report.paymentAnalysis.revenueByStatus?.pending,
            ],
            [
                "Partial",
                report.paymentAnalysis.partial,
                `${report.paymentAnalysis.paymentStatusPercentages?.partial}%`,
                report.paymentAnalysis.revenueByStatus?.partial,
            ],
            ["Cancelled", report.paymentAnalysis.cancelled, "0%", 0],
            ["Refunded", report.paymentAnalysis.refunded, "0%", 0],
            ["", ""],
            ["Total Orders", report.paymentAnalysis.total],
        ];
        const paymentWs = XLSX.utils.aoa_to_sheet(paymentData);
        XLSX.utils.book_append_sheet(wb, paymentWs, "Payment Analysis");
    }

    // 3. Top Products sheet
    if (report.topProducts?.length) {
        const productsData = [
            [
                "Product Name",
                "Quantity Sold",
                "Total Revenue",
                "Number of Orders",
                "Average Order Value",
            ],
        ];
        report.topProducts.forEach((product: any) => {
            productsData.push([
                product.name,
                product.quantity,
                product.revenue,
                product.orders,
                product.revenue / product.orders,
            ]);
        });
        const productsWs = XLSX.utils.aoa_to_sheet(productsData);
        XLSX.utils.book_append_sheet(wb, productsWs, "Top Products");
    }

    // 4. Top Customers sheet
    if (report.topCustomers?.length) {
        const customersData = [
            [
                "Customer Name",
                "Total Orders",
                "Total Revenue",
                "Average Order Value",
                "Phone",
                "Email",
            ],
        ];
        report.topCustomers.forEach((customer: any) => {
            customersData.push([
                customer.name,
                customer.orders,
                customer.revenue,
                customer.revenue / customer.orders,
                customer.phone,
                customer.email,
            ]);
        });
        const customersWs = XLSX.utils.aoa_to_sheet(customersData);
        XLSX.utils.book_append_sheet(wb, customersWs, "Top Customers");
    }

    // 5. Daily Breakdown sheet
    if (report.dailyBreakdown?.length) {
        const dailyData = [["Date", "Revenue", "Cost", "Profit", "Orders", "Transactions"]];
        report.dailyBreakdown.forEach((day: any) => {
            dailyData.push([
                day.date,
                day.revenue,
                day.cost,
                day.profit,
                day.orders,
                day.transactions,
            ]);
        });
        const dailyWs = XLSX.utils.aoa_to_sheet(dailyData);
        XLSX.utils.book_append_sheet(wb, dailyWs, "Daily Breakdown");
    }

    // 6. All Transactions sheet
    if (report.rawData?.transactions?.length) {
        const transactionData = [
            [
                "Date",
                "Type",
                "Amount",
                "Account Name",
                "Account Type",
                "Description",
                "Order Number",
                "Entity",
            ],
        ];
        report.rawData.transactions.forEach((transaction: any) => {
            transactionData.push([
                formatDate(transaction.createdAt),
                transaction.type,
                transaction.amount,
                transaction.account?.name || "N/A",
                transaction.account?.type || "N/A",
                transaction.description,
                transaction.order?.orderNumber || "N/A",
                transaction.order?.entity || "N/A",
            ]);
        });
        const transactionWs = XLSX.utils.aoa_to_sheet(transactionData);
        XLSX.utils.book_append_sheet(wb, transactionWs, "All Transactions");
    }

    // 7. All Orders sheet
    if (report.rawData?.orders?.length) {
        const orderData = [
            [
                "Order Number",
                "Date",
                "Type",
                "Customer",
                "Total Amount",
                "Payment Status",
                "Paid Amount",
                "Items Count",
                "Net Profit",
                "Phone",
            ],
        ];
        report.rawData.orders.forEach((order: any) => {
            orderData.push([
                order.orderNumber,
                formatDate(order.createdAt),
                order.type,
                order.entity?.name || "N/A",
                order.totalAmount,
                order.paymentStatus,
                order.paidTillNow,
                order.items?.length || 0,
                order.netProfit,
                order.entity?.phone || "N/A",
            ]);
        });
        const orderWs = XLSX.utils.aoa_to_sheet(orderData);
        XLSX.utils.book_append_sheet(wb, orderWs, "All Orders");
    }

    // 8. Order Items Detail sheet
    if (report.rawData?.orders?.length) {
        const itemData = [
            [
                "Order Number",
                "Item Name",
                "Product Code",
                "Quantity",
                "Unit Price",
                "Subtotal",
                "Profit",
                "Gross Profit",
                "Order Date",
                "Order Type",
            ],
        ];
        report.rawData.orders.forEach((order: any) => {
            if (order.items && order.items.length > 0) {
                order.items.forEach((item: any) => {
                    itemData.push([
                        order.orderNumber,
                        item.name,
                        item.product?.code || "N/A",
                        item.quantity,
                        item.price,
                        item.subtotal,
                        item.profit,
                        item.grossProfit,
                        formatDate(order.createdAt),
                        order.type,
                    ]);
                });
            }
        });
        const itemWs = XLSX.utils.aoa_to_sheet(itemData);
        XLSX.utils.book_append_sheet(wb, itemWs, "Order Items Detail");
    }

    // 9. Expense/Income Analysis sheet
    if (report.expenseIncomeAnalysis) {
        const expenseIncomeData = [
            ["EXPENSE & INCOME ANALYSIS", ""],
            ["", ""],
            ["Total Expenses", report.expenseIncomeAnalysis.totalExpenses],
            ["Total Incomes", report.expenseIncomeAnalysis.totalIncomes],
            ["Net Amount", report.expenseIncomeAnalysis.netAmount],
            ["", ""],
            ["INCOME BY CATEGORY", ""],
        ];

        if (report.expenseIncomeAnalysis.incomesByCategory?.length) {
            expenseIncomeData.push(["Category", "Amount"]);
            report.expenseIncomeAnalysis.incomesByCategory.forEach((income: any) => {
                expenseIncomeData.push([income.category, income.amount]);
            });
        }

        expenseIncomeData.push(["", ""]);
        expenseIncomeData.push(["EXPENSES BY CATEGORY", ""]);

        if (report.expenseIncomeAnalysis.expensesByCategory?.length) {
            expenseIncomeData.push(["Category", "Amount"]);
            report.expenseIncomeAnalysis.expensesByCategory.forEach((expense: any) => {
                expenseIncomeData.push([expense.category, expense.amount]);
            });
        }

        const expenseIncomeWs = XLSX.utils.aoa_to_sheet(expenseIncomeData);
        XLSX.utils.book_append_sheet(wb, expenseIncomeWs, "Expense Income Analysis");
    }

    XLSX.writeFile(
        wb,
        `Complete_Business_Report_${report.reportPeriod?.startDate}_to_${report.reportPeriod?.endDate}.xlsx`
    );
};

export const exportToPDF = (report: any) => {
    if (!report) return;

    try {
        const doc = new jsPDF("p", "mm", "a4");
        let currentY = 20;

        // Helper function to add page if needed
        const checkPageBreak = (neededSpace: number) => {
            if (currentY + neededSpace > 280) {
                doc.addPage();
                currentY = 20;
            }
        };

        // Title
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("Business Report", 20, currentY);
        currentY += 10;

        // Period
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(
            `Period: ${formatDate(report.reportPeriod?.startDate)} to ${formatDate(
                report.reportPeriod?.endDate
            )}`,
            20,
            currentY
        );
        currentY += 8;
        doc.text(`Duration: ${report.reportPeriod?.daysCount} days`, 20, currentY);
        currentY += 15;

        // Summary Section
        checkPageBreak(60);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Financial Summary", 20, currentY);
        currentY += 10;

        const summaryData = [
            ["Metric", "Value"],
            ["Total Revenue", formatCurrency(report.summary?.totalRevenue)],
            ["Actual Revenue", formatCurrency(report.summary?.actualRevenue)],
            ["Total Cost", formatCurrency(report.summary?.totalCost)],
            ["Actual Cost", formatCurrency(report.summary?.actualCost)],
            ["Gross Profit", formatCurrency(report.summary?.grossProfit)],
            ["Net Profit", formatCurrency(report.summary?.netProfit)],
            ["Total Orders", String(report.summary?.totalOrders)],
            ["Sell Orders", String(report.summary?.sellOrders)],
            ["Buy Orders", String(report.summary?.buyOrders)],
            ["Total Transactions", String(report.summary?.totalTransactions)],
            ["Total Expenses", formatCurrency(report.summary?.totalExpenses)],
            ["Total Incomes", formatCurrency(report.summary?.totalIncomes)],
            ["Net Income/Expense", formatCurrency(report.summary?.netIncomeExpense)],
        ];

        autoTable(doc, {
            head: [summaryData[0]],
            body: summaryData.slice(1),
            startY: currentY,
            theme: "striped",
            margin: { left: 20, right: 20 },
            styles: { fontSize: 10 },
        });

        currentY = doc.lastAutoTable.finalY + 15;

        // Payment Analysis Section
        if (report.paymentAnalysis) {
            checkPageBreak(60);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Payment Analysis", 20, currentY);
            currentY += 10;

            const paymentData = [
                ["Status", "Count", "Percentage", "Revenue"],
                [
                    "Paid",
                    String(report.paymentAnalysis.paid),
                    `${report.paymentAnalysis.paymentStatusPercentages?.paid || 0}%`,
                    formatCurrency(report.paymentAnalysis.revenueByStatus?.paid),
                ],
                [
                    "Pending",
                    String(report.paymentAnalysis.pending),
                    `${report.paymentAnalysis.paymentStatusPercentages?.pending || 0}%`,
                    formatCurrency(report.paymentAnalysis.revenueByStatus?.pending),
                ],
                [
                    "Partial",
                    String(report.paymentAnalysis.partial),
                    `${report.paymentAnalysis.paymentStatusPercentages?.partial || 0}%`,
                    formatCurrency(report.paymentAnalysis.revenueByStatus?.partial),
                ],
            ];

            autoTable(doc, {
                head: [paymentData[0]],
                body: paymentData.slice(1),
                startY: currentY,
                theme: "striped",
                margin: { left: 20, right: 20 },
                styles: { fontSize: 10 },
            });

            currentY = doc.lastAutoTable.finalY + 15;
        }

        // Top Products Section
        if (report.topProducts?.length) {
            checkPageBreak(60);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Top Products", 20, currentY);
            currentY += 10;

            const productsData = report.topProducts
                .slice(0, 10)
                .map((product: any) => [
                    product.name.substring(0, 30) + (product.name.length > 30 ? "..." : ""),
                    String(product.quantity),
                    formatCurrency(product.revenue),
                    String(product.orders),
                ]);

            autoTable(doc, {
                head: [["Product Name", "Qty", "Revenue", "Orders"]],
                body: productsData,
                startY: currentY,
                theme: "striped",
                margin: { left: 20, right: 20 },
                styles: { fontSize: 9 },
            });

            currentY = doc.lastAutoTable.finalY + 15;
        }

        // Top Customers Section
        if (report.topCustomers?.length) {
            checkPageBreak(60);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Top Customers", 20, currentY);
            currentY += 10;

            const customersData = report.topCustomers
                .slice(0, 10)
                .map((customer: any) => [
                    customer.name.substring(0, 25) + (customer.name.length > 25 ? "..." : ""),
                    String(customer.orders),
                    formatCurrency(customer.revenue),
                    customer.phone || "N/A",
                ]);

            autoTable(doc, {
                head: [["Customer Name", "Orders", "Revenue", "Phone"]],
                body: customersData,
                startY: currentY,
                theme: "striped",
                margin: { left: 20, right: 20 },
                styles: { fontSize: 9 },
            });

            currentY = doc.lastAutoTable.finalY + 15;
        }

        // Recent Transactions Section (limited to first 20 for PDF)
        if (report.rawData?.transactions?.length) {
            checkPageBreak(60);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Recent Transactions (Top 20)", 20, currentY);
            currentY += 10;

            const transactionData = report.rawData.transactions
                .slice(0, 20)
                .map((transaction: any) => [
                    formatDate(transaction.createdAt),
                    transaction.type,
                    formatCurrency(transaction.amount),
                    (transaction.account?.name || "N/A").substring(0, 15) +
                        ((transaction.account?.name || "").length > 15 ? "..." : ""),
                ]);

            autoTable(doc, {
                head: [["Date", "Type", "Amount", "Account"]],
                body: transactionData,
                startY: currentY,
                theme: "striped",
                margin: { left: 20, right: 20 },
                styles: { fontSize: 9 },
            });

            currentY = doc.lastAutoTable.finalY + 15;
        }

        // Daily Breakdown Section
        if (report.dailyBreakdown?.length) {
            checkPageBreak(60);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Daily Breakdown", 20, currentY);
            currentY += 10;

            const dailyData = report.dailyBreakdown
                .slice(0, 15)
                .map((day: any) => [
                    formatDate(day.date),
                    formatCurrency(day.revenue),
                    formatCurrency(day.cost),
                    String(day.orders),
                ]);

            autoTable(doc, {
                head: [["Date", "Revenue", "Cost", "Orders"]],
                body: dailyData,
                startY: currentY,
                theme: "striped",
                margin: { left: 20, right: 20 },
                styles: { fontSize: 9 },
            });
        }

        // Add footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text(
                `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
                20,
                287
            );
        }

        doc.save(
            `Business_Report_${report.reportPeriod?.startDate}_to_${report.reportPeriod?.endDate}.pdf`
        );
    } catch (error) {
        console.error("PDF Export Error:", error);
        alert("Error generating PDF. Please try again.");
    }
};

export const exportProductStockToExcel = (
    products: any[],
    organizationData: any,
    fileName?: string
) => {
    try {
        if (!products || products.length === 0) {
            alert("No products data to export");
            return;
        }

        const wb = XLSX.utils.book_new();

        // Calculate aggregated data with enhanced metrics
        let totalStock = 0;
        let totalBuyingPrice = 0;
        let totalEstimatedPrice = 0;
        let totalCurrentValue = 0;
        let totalVariants = 0;
        let lowStockVariants = 0;
        let outOfStockVariants = 0;
        let totalFifoEntries = 0;
        const lowStockThreshold = 10; // Can be configurable

        // 1. Enhanced Product Variants Detail Sheet
        const variantData = [
            [
                "Product Name",
                "Variant Name",
                "SKU",
                "Variant Code",
                "Stock Quantity",
                "Stock Status",
                "Buy Price (Avg)",
                "Buy Price (Min)",
                "Buy Price (Max)",
                "Estimated Price (Avg)",
                "Total Buy Value",
                "Total Estimated Value",
                "Potential Profit",
                "Profit Margin %",
                "FIFO Entries Count",
                "Oldest Stock Date",
                "Newest Stock Date",
                "Stock Age (Days)",
                "Category",
                "Product Description",
                "Variant Description",
                "Created At",
                "Updated At",
                "Published Status",
            ],
        ];

        products.forEach((product: any) => {
            if (product.variants && product.variants.length > 0) {
                product.variants.forEach((variant: any) => {
                    const fifoQueue = variant.stock_fifo_queue || [];
                    const variantStock = fifoQueue.reduce(
                        (sum: number, queue: any) => sum + queue.availableStock,
                        0
                    );

                    totalFifoEntries += fifoQueue.length;

                    // Calculate price statistics
                    const buyPrices = fifoQueue
                        .filter((q: any) => q.buyPrice > 0)
                        .map((q: any) => q.buyPrice);
                    const estimatedPrices = fifoQueue
                        .filter((q: any) => q.estimatedPrice > 0)
                        .map((q: any) => q.estimatedPrice);

                    const avgBuyPrice = buyPrices.length
                        ? buyPrices.reduce((a: number, b: number) => a + b, 0) / buyPrices.length
                        : variant.buyPrice || 0;
                    const minBuyPrice = buyPrices.length
                        ? Math.min(...buyPrices)
                        : variant.buyPrice || 0;
                    const maxBuyPrice = buyPrices.length
                        ? Math.max(...buyPrices)
                        : variant.buyPrice || 0;
                    const avgEstimatedPrice = estimatedPrices.length
                        ? estimatedPrices.reduce((a: number, b: number) => a + b, 0) /
                          estimatedPrices.length
                        : 0;

                    // Calculate dates for stock aging
                    const stockDates = fifoQueue
                        .map((q: any) => new Date(q.createdAt))
                        .filter((d: Date) => !isNaN(d.getTime()));
                    const oldestDate = stockDates.length
                        ? new Date(Math.min(...stockDates.map((d: Date) => d.getTime())))
                        : null;
                    const newestDate = stockDates.length
                        ? new Date(Math.max(...stockDates.map((d: Date) => d.getTime())))
                        : null;
                    const stockAgeInDays = oldestDate
                        ? Math.floor(
                              (new Date().getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)
                          )
                        : 0;

                    const totalBuyValue = variantStock * avgBuyPrice;
                    const totalEstimatedValue = variantStock * avgEstimatedPrice;
                    const potentialProfit = totalEstimatedValue - totalBuyValue;
                    const profitMargin =
                        totalBuyValue > 0 ? (potentialProfit / totalBuyValue) * 100 : 0;

                    // Stock status
                    let stockStatus = "Normal";
                    if (variantStock === 0) {
                        stockStatus = "Out of Stock";
                        outOfStockVariants++;
                    } else if (variantStock <= lowStockThreshold) {
                        stockStatus = "Low Stock";
                        lowStockVariants++;
                    } else if (variantStock > 100) {
                        stockStatus = "High Stock";
                    }

                    totalStock += variantStock;
                    totalBuyingPrice += totalBuyValue;
                    totalEstimatedPrice += totalEstimatedValue;
                    totalCurrentValue += totalBuyValue;
                    totalVariants++;

                    variantData.push([
                        product.name,
                        variant.name,
                        product.sku,
                        variant.code,
                        variantStock,
                        stockStatus,
                        avgBuyPrice.toFixed(2),
                        minBuyPrice.toFixed(2),
                        maxBuyPrice.toFixed(2),
                        avgEstimatedPrice.toFixed(2),
                        totalBuyValue.toFixed(2),
                        totalEstimatedValue.toFixed(2),
                        potentialProfit.toFixed(2),
                        profitMargin.toFixed(2) + "%",
                        fifoQueue.length,
                        oldestDate ? formatDate(oldestDate.toISOString()) : "N/A",
                        newestDate ? formatDate(newestDate.toISOString()) : "N/A",
                        stockAgeInDays,
                        product.category?.name || "Uncategorized",
                        product.description || "",
                        variant.description || "",
                        formatDate(variant.createdAt || product.createdAt),
                        formatDate(variant.updatedAt || product.updatedAt),
                        product.isPublished ? "Published" : "Draft",
                    ]);
                });
            } else {
                // Product without variants
                outOfStockVariants++;
                variantData.push([
                    product.name,
                    "Default Variant",
                    product.sku,
                    product.sku,
                    0,
                    "Out of Stock",
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    "0%",
                    0,
                    "N/A",
                    "N/A",
                    0,
                    product.category?.name || "Uncategorized",
                    product.description || "",
                    "",
                    formatDate(product.createdAt),
                    formatDate(product.updatedAt),
                    product.isPublished ? "Published" : "Draft",
                ]);
            }
        });

        const variantWs = XLSX.utils.aoa_to_sheet(variantData);
        XLSX.utils.book_append_sheet(wb, variantWs, "Variant Details");

        // 2. Enhanced Summary Sheet
        const avgBuyPrice = totalStock > 0 ? totalBuyingPrice / totalStock : 0;
        const avgEstimatedPrice = totalStock > 0 ? totalEstimatedPrice / totalStock : 0;
        const totalPotentialProfit = totalEstimatedPrice - totalBuyingPrice;
        const overallProfitMargin =
            totalBuyingPrice > 0 ? (totalPotentialProfit / totalBuyingPrice) * 100 : 0;

        const summaryData = [
            ["COMPREHENSIVE PRODUCT STOCK ANALYSIS", ""],
            ["", ""],
            ["REPORT METADATA", ""],
            [
                "Generated At",
                new Date().toLocaleString("en-IN", {
                    timeZone: "Asia/Katmandu",
                    dateStyle: "full",
                    timeStyle: "medium",
                }),
            ],
            ["Report Type", "Product Stock Inventory Analysis"],
            ["Data Source", "Product Management System"],
            ["Currency", "NPR (Nepalese Rupees)"],
            ["", ""],
            ["ORGANIZATION INFORMATION", ""],
            ["Organization Name", organizationData?.name || "N/A"],
            ["Contact Number", organizationData?.contact || "N/A"],
            ["PAN Number", organizationData?.pan || "N/A"],
            ["VAT Number", organizationData?.vat || "N/A"],
            ["VAT Status", organizationData?.vatStatus || "N/A"],
            ["Domain", organizationData?.domain || "N/A"],
            [
                "Depreciation Rate",
                organizationData?.depreciationRate
                    ? `${organizationData.depreciationRate}%`
                    : "N/A",
            ],
            ["", ""],
            ["INVENTORY OVERVIEW", ""],
            ["Total Products", products.length],
            ["Total Product Variants", totalVariants],
            ["Total FIFO Entries", totalFifoEntries],
            ["Products with Variants", products.filter((p) => p.variants?.length > 0).length],
            ["Products without Variants", products.filter((p) => !p.variants?.length).length],
            ["Published Products", products.filter((p) => p.isPublished).length],
            ["Draft Products", products.filter((p) => !p.isPublished).length],
            ["", ""],
            ["STOCK STATUS SUMMARY", ""],
            ["Total Stock Units", totalStock.toLocaleString("en-IN")],
            ["Variants In Stock", (totalVariants - outOfStockVariants).toLocaleString("en-IN")],
            ["Out of Stock Variants", outOfStockVariants.toLocaleString("en-IN")],
            [
                "Low Stock Variants (≤" + lowStockThreshold + " units)",
                lowStockVariants.toLocaleString("en-IN"),
            ],
            [
                "Normal Stock Variants",
                Math.max(0, totalVariants - outOfStockVariants - lowStockVariants).toLocaleString(
                    "en-IN"
                ),
            ],
            [
                "Stock Fill Rate",
                totalVariants > 0
                    ? `${(((totalVariants - outOfStockVariants) / totalVariants) * 100).toFixed(
                          1
                      )}%`
                    : "0%",
            ],
            ["", ""],
            ["FINANCIAL SUMMARY", ""],
            ["Total Inventory Value (Buy Price)", formatCurrency(totalBuyingPrice)],
            ["Total Estimated Value", formatCurrency(totalEstimatedPrice)],
            ["Current Market Value", formatCurrency(totalCurrentValue)],
            ["Total Potential Profit", formatCurrency(totalPotentialProfit)],
            ["Overall Profit Margin", `${overallProfitMargin.toFixed(2)}%`],
            ["", ""],
            ["PRICE ANALYTICS", ""],
            ["Average Buy Price per Unit", formatCurrency(avgBuyPrice)],
            ["Average Estimated Price per Unit", formatCurrency(avgEstimatedPrice)],
            [
                "Average Stock per Variant",
                totalVariants > 0 ? (totalStock / totalVariants).toFixed(1) : "0",
            ],
            [
                "Average Inventory Value per Product",
                formatCurrency(products.length > 0 ? totalBuyingPrice / products.length : 0),
            ],
            [
                "Average FIFO Entries per Variant",
                totalVariants > 0 ? (totalFifoEntries / totalVariants).toFixed(1) : "0",
            ],
            ["", ""],
            ["RISK INDICATORS", ""],
            [
                "Stock Coverage Ratio",
                `${
                    totalVariants > 0
                        ? (((totalVariants - outOfStockVariants) / totalVariants) * 100).toFixed(1)
                        : 0
                }%`,
            ],
            [
                "Inventory Turnover Health",
                outOfStockVariants > totalVariants * 0.2
                    ? "Poor (>20% out of stock)"
                    : outOfStockVariants > totalVariants * 0.1
                    ? "Fair (10-20% out of stock)"
                    : "Good (<10% out of stock)",
            ],
            [
                "Profit Margin Health",
                overallProfitMargin > 30
                    ? "Excellent (>30%)"
                    : overallProfitMargin > 15
                    ? "Good (15-30%)"
                    : overallProfitMargin > 5
                    ? "Fair (5-15%)"
                    : "Poor (<5%)",
            ],
        ];

        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, "Executive Summary");

        // 3. FIFO Queue Details Sheet
        const fifoData = [
            [
                "Product Name",
                "Variant Name",
                "Variant Code",
                "Entry Date",
                "Buy Price",
                "Estimated Price",
                "Original Stock",
                "Available Stock",
                "Used Stock",
                "Stock Usage %",
                "Entry Value",
                "Remaining Value",
                "Age (Days)",
                "Status",
            ],
        ];

        products.forEach((product: any) => {
            if (product.variants && product.variants.length > 0) {
                product.variants.forEach((variant: any) => {
                    if (variant.stock_fifo_queue && variant.stock_fifo_queue.length > 0) {
                        variant.stock_fifo_queue.forEach((queue: any) => {
                            const entryDate = new Date(queue.createdAt);
                            const ageInDays = Math.floor(
                                (new Date().getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
                            );
                            const usedStock = queue.originalStock - queue.availableStock;
                            const usagePercent =
                                queue.originalStock > 0
                                    ? (usedStock / queue.originalStock) * 100
                                    : 0;
                            const entryValue = queue.originalStock * queue.buyPrice;
                            const remainingValue = queue.availableStock * queue.buyPrice;

                            let status = "Active";
                            if (queue.availableStock === 0) status = "Depleted";
                            else if (ageInDays > 365) status = "Aged (>1 year)";
                            else if (ageInDays > 180) status = "Aging (>6 months)";

                            fifoData.push([
                                product.name,
                                variant.name,
                                variant.code,
                                formatDate(queue.createdAt),
                                queue.buyPrice.toFixed(2),
                                queue.estimatedPrice.toFixed(2),
                                queue.originalStock,
                                queue.availableStock,
                                usedStock,
                                `${usagePercent.toFixed(1)}%`,
                                entryValue.toFixed(2),
                                remainingValue.toFixed(2),
                                ageInDays,
                                status,
                            ]);
                        });
                    }
                });
            }
        });

        const fifoWs = XLSX.utils.aoa_to_sheet(fifoData);
        XLSX.utils.book_append_sheet(wb, fifoWs, "FIFO Queue Details");

        // 4. Stock Aging Analysis Sheet
        const agingData = [
            [
                "Age Range",
                "Stock Quantity",
                "Stock Value",
                "Variants Count",
                "Percentage of Total Stock",
                "Avg Buy Price",
                "Risk Level",
            ],
        ];

        const ageRanges = [
            { label: "0-30 days", min: 0, max: 30, risk: "Low" },
            { label: "31-90 days", min: 31, max: 90, risk: "Low" },
            { label: "91-180 days", min: 91, max: 180, risk: "Medium" },
            { label: "181-365 days", min: 181, max: 365, risk: "High" },
            { label: ">365 days", min: 366, max: Infinity, risk: "Very High" },
        ];

        ageRanges.forEach((range) => {
            let rangeStock = 0;
            let rangeValue = 0;
            let rangeVariants = 0;
            let rangeBuyPrices: number[] = [];

            products.forEach((product: any) => {
                if (product.variants) {
                    product.variants.forEach((variant: any) => {
                        if (variant.stock_fifo_queue) {
                            variant.stock_fifo_queue.forEach((queue: any) => {
                                const ageInDays = Math.floor(
                                    (new Date().getTime() - new Date(queue.createdAt).getTime()) /
                                        (1000 * 60 * 60 * 24)
                                );
                                if (
                                    ageInDays >= range.min &&
                                    ageInDays <= range.max &&
                                    queue.availableStock > 0
                                ) {
                                    rangeStock += queue.availableStock;
                                    rangeValue += queue.availableStock * queue.buyPrice;
                                    rangeBuyPrices.push(queue.buyPrice);
                                    rangeVariants++;
                                }
                            });
                        }
                    });
                }
            });

            const avgBuyPrice = rangeBuyPrices.length
                ? rangeBuyPrices.reduce((a: number, b: number) => a + b, 0) / rangeBuyPrices.length
                : 0;
            const percentageOfTotal = totalStock > 0 ? (rangeStock / totalStock) * 100 : 0;

            agingData.push([
                range.label,
                rangeStock + "",
                rangeValue.toFixed(2),
                rangeVariants + "",
                `${percentageOfTotal.toFixed(1)}%`,
                avgBuyPrice.toFixed(2),
                range.risk,
            ]);
        });

        const agingWs = XLSX.utils.aoa_to_sheet(agingData);
        XLSX.utils.book_append_sheet(wb, agingWs, "Stock Aging Analysis");

        // 5. Low Stock Alerts Sheet
        const alertsData = [
            [
                "Alert Type",
                "Product Name",
                "Variant Name",
                "Current Stock",
                "Threshold",
                "Days Until Out of Stock",
                "Total Value at Risk",
                "Recommended Action",
                "Priority",
            ],
        ];

        products.forEach((product: any) => {
            if (product.variants && product.variants.length > 0) {
                product.variants.forEach((variant: any) => {
                    const variantStock =
                        variant.stock_fifo_queue?.reduce(
                            (sum: number, queue: any) => sum + queue.availableStock,
                            0
                        ) || 0;

                    const avgBuyPrice = variant.stock_fifo_queue?.length
                        ? variant.stock_fifo_queue.reduce(
                              (sum: number, queue: any) => sum + queue.buyPrice,
                              0
                          ) / variant.stock_fifo_queue.length
                        : variant.buyPrice || 0;

                    const totalValue = variantStock * avgBuyPrice;

                    // Different alert types
                    if (variantStock === 0) {
                        alertsData.push([
                            "OUT OF STOCK",
                            product.name,
                            variant.name,
                            variantStock,
                            lowStockThreshold,
                            "0 (Immediate)",
                            totalValue.toFixed(2),
                            "Restock immediately",
                            "CRITICAL",
                        ]);
                    } else if (variantStock <= lowStockThreshold) {
                        const daysUntilOutOfStock = Math.floor(
                            variantStock / Math.max(1, variantStock * 0.1)
                        ); // Rough estimate
                        alertsData.push([
                            "LOW STOCK",
                            product.name,
                            variant.name,
                            variantStock,
                            lowStockThreshold,
                            daysUntilOutOfStock.toString(),
                            totalValue.toFixed(2),
                            "Consider restocking soon",
                            "HIGH",
                        ]);
                    } else if (variantStock > 200) {
                        alertsData.push([
                            "OVERSTOCK",
                            product.name,
                            variant.name,
                            variantStock,
                            "200",
                            "N/A",
                            totalValue.toFixed(2),
                            "Consider reducing inventory",
                            "MEDIUM",
                        ]);
                    }
                });
            }
        });

        // Add aging alerts
        products.forEach((product: any) => {
            if (product.variants) {
                product.variants.forEach((variant: any) => {
                    if (variant.stock_fifo_queue) {
                        variant.stock_fifo_queue.forEach((queue: any) => {
                            const ageInDays = Math.floor(
                                (new Date().getTime() - new Date(queue.createdAt).getTime()) /
                                    (1000 * 60 * 60 * 24)
                            );
                            if (ageInDays > 365 && queue.availableStock > 0) {
                                const value = queue.availableStock * queue.buyPrice;
                                alertsData.push([
                                    "AGED STOCK",
                                    product.name,
                                    variant.name,
                                    queue.availableStock,
                                    "365 days",
                                    "N/A",
                                    value.toFixed(2),
                                    "Consider discount sale or write-off",
                                    "LOW",
                                ]);
                            }
                        });
                    }
                });
            }
        });

        const alertsWs = XLSX.utils.aoa_to_sheet(alertsData);
        XLSX.utils.book_append_sheet(wb, alertsWs, "Stock Alerts");

        // 6. Enhanced Category Analysis Sheet
        const categoryMap = new Map();
        products.forEach((product: any) => {
            const categoryName = product.category?.name || "Uncategorized";
            if (!categoryMap.has(categoryName)) {
                categoryMap.set(categoryName, {
                    name: categoryName,
                    products: 0,
                    variants: 0,
                    totalStock: 0,
                    totalBuyValue: 0,
                    totalEstimatedValue: 0,
                    outOfStockVariants: 0,
                    lowStockVariants: 0,
                    fifoEntries: 0,
                    oldestStockAge: 0,
                    newestStockAge: 0,
                });
            }

            const category = categoryMap.get(categoryName);
            category.products++;
            category.variants += product.variants?.length || 0;

            const productStock =
                product.variants?.reduce(
                    (sum: number, variant: any) =>
                        sum +
                        (variant.stock_fifo_queue?.reduce(
                            (acc: number, queue: any) => acc + queue.availableStock,
                            0
                        ) || 0),
                    0
                ) || 0;

            const productBuyValue =
                product.variants?.reduce((sum: number, variant: any) => {
                    const variantStock =
                        variant.stock_fifo_queue?.reduce(
                            (acc: number, queue: any) => acc + queue.availableStock,
                            0
                        ) || 0;
                    const avgBuyPrice = variant.stock_fifo_queue?.length
                        ? variant.stock_fifo_queue.reduce(
                              (sum: number, queue: any) => sum + queue.buyPrice,
                              0
                          ) / variant.stock_fifo_queue.length
                        : variant.buyPrice || 0;
                    return sum + variantStock * avgBuyPrice;
                }, 0) || 0;

            const productEstimatedValue =
                product.variants?.reduce((sum: number, variant: any) => {
                    const variantStock =
                        variant.stock_fifo_queue?.reduce(
                            (acc: number, queue: any) => acc + queue.availableStock,
                            0
                        ) || 0;
                    const avgEstimatedPrice = variant.stock_fifo_queue?.length
                        ? variant.stock_fifo_queue.reduce(
                              (sum: number, queue: any) => sum + queue.estimatedPrice,
                              0
                          ) / variant.stock_fifo_queue.length
                        : 0;
                    return sum + variantStock * avgEstimatedPrice;
                }, 0) || 0;

            category.totalStock += productStock;
            category.totalBuyValue += productBuyValue;
            category.totalEstimatedValue += productEstimatedValue;

            // Count stock status variants
            if (product.variants) {
                product.variants.forEach((variant: any) => {
                    const variantStock =
                        variant.stock_fifo_queue?.reduce(
                            (sum: number, queue: any) => sum + queue.availableStock,
                            0
                        ) || 0;
                    category.fifoEntries += variant.stock_fifo_queue?.length || 0;

                    if (variantStock === 0) {
                        category.outOfStockVariants++;
                    } else if (variantStock <= lowStockThreshold) {
                        category.lowStockVariants++;
                    }
                });
            }
        });

        const categoryData = [
            [
                "Category",
                "Products",
                "Variants",
                "Total Stock",
                "Stock Fill Rate %",
                "Out of Stock",
                "Low Stock",
                "Total Buy Value",
                "Total Estimated Value",
                "Potential Profit",
                "Profit Margin %",
                "Avg Value per Unit",
                "FIFO Entries",
                "Category Health",
            ],
        ];

        Array.from(categoryMap.values()).forEach((category: any) => {
            const avgValuePerUnit =
                category.totalStock > 0 ? category.totalBuyValue / category.totalStock : 0;
            const potentialProfit = category.totalEstimatedValue - category.totalBuyValue;
            const profitMargin =
                category.totalBuyValue > 0 ? (potentialProfit / category.totalBuyValue) * 100 : 0;
            const stockFillRate =
                category.variants > 0
                    ? ((category.variants - category.outOfStockVariants) / category.variants) * 100
                    : 0;

            let categoryHealth = "Excellent";
            if (category.outOfStockVariants / category.variants > 0.3) categoryHealth = "Poor";
            else if (category.outOfStockVariants / category.variants > 0.15)
                categoryHealth = "Fair";
            else if (category.outOfStockVariants / category.variants > 0.05)
                categoryHealth = "Good";

            categoryData.push([
                category.name,
                category.products,
                category.variants,
                category.totalStock,
                `${stockFillRate.toFixed(1)}%`,
                category.outOfStockVariants,
                category.lowStockVariants,
                category.totalBuyValue.toFixed(2),
                category.totalEstimatedValue.toFixed(2),
                potentialProfit.toFixed(2),
                `${profitMargin.toFixed(1)}%`,
                avgValuePerUnit.toFixed(2),
                category.fifoEntries,
                categoryHealth,
            ]);
        });

        const categoryWs = XLSX.utils.aoa_to_sheet(categoryData);
        XLSX.utils.book_append_sheet(wb, categoryWs, "Category Analytics");

        // Generate and download file with enhanced naming
        const timestamp = new Date().toISOString().split("T")[0];
        const defaultFileName = `${
            organizationData?.name || "Organization"
        }-stock-analysis-${timestamp}.xlsx`;
        XLSX.writeFile(wb, fileName || defaultFileName);

        console.log("Enhanced product stock Excel export completed successfully");
    } catch (error) {
        console.error("Product Stock Excel Export Error:", error);
        alert("Error generating Excel file. Please try again.");
    }
};
