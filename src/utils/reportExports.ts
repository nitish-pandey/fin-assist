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
