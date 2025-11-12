import jsPDF from "jspdf";
import type { Order, Organization } from "@/data/types";

export const generateInvoicePDF = (order: Order, organization?: Organization | null): jsPDF => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const leftMargin = 20;
    const rightMargin = 20;
    let yPosition = 25;

    // Add organization logo in top-right corner if available
    if (organization?.logo) {
        try {
            const logoSize = 25; // 25mm width/height for small logo
            const logoX = pageWidth - rightMargin - logoSize;
            const logoY = 10; // 10mm from top

            // Determine image format from logo URL/data
            let imageFormat = "JPEG";
            const logoUrl = organization.logo.toLowerCase();
            if (logoUrl.includes("png") || logoUrl.includes("data:image/png")) {
                imageFormat = "PNG";
            } else if (
                logoUrl.includes("jpg") ||
                logoUrl.includes("jpeg") ||
                logoUrl.includes("data:image/jpeg")
            ) {
                imageFormat = "JPEG";
            }

            pdf.addImage(organization.logo, imageFormat, logoX, logoY, logoSize, logoSize);
        } catch (error) {
            console.warn("Failed to add logo to PDF:", error);
        }
    }

    // Company Header Section
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");

    // Company name and FY
    const companyName = organization?.name || "Microchip Expert";

    pdf.text(companyName, leftMargin, yPosition);
    yPosition += 8;

    // Address and Registration
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    const address = organization?.description || "-";
    const regNo = organization?.pan;

    pdf.text(`• ${address}`, leftMargin, yPosition);
    yPosition += 6;
    pdf.text(`Reg. No: ${regNo}`, leftMargin, yPosition);
    yPosition += 15;

    // SALES INVOICE Title
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(order.type == "SELL" ? "SALES INVOICE" : "PURCHASE INVOICE", leftMargin, yPosition);
    yPosition += 15;

    // Party and Invoice Details Section
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    // Left side - Party details
    pdf.text("Party:", leftMargin, yPosition);
    yPosition += 6;

    const partyName = order.entity?.name || "Customer";
    pdf.text(partyName, leftMargin, yPosition);
    yPosition += 8;

    pdf.text("Balance: Rs. 0", leftMargin, yPosition);
    yPosition += 15;

    // Right side - Invoice details (positioned from right)
    const rightColumnX = pageWidth - rightMargin - 60;
    let rightColumnY = yPosition - 35; // Start from higher position

    pdf.text(`Invoice No: ${order.orderNumber}`, rightColumnX, rightColumnY);
    rightColumnY += 6;

    // Convert date to Nepali format (simplified)
    const invoiceDate = new Date(order.createdAt).toLocaleDateString();
    pdf.text(`Invoice Date: ${invoiceDate}`, rightColumnX, rightColumnY);
    rightColumnY += 6;

    pdf.text("Payment Mode: Cash", rightColumnX, rightColumnY);

    // Items Table
    yPosition += 10;

    // Table headers
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);

    const colPositions = {
        sn: leftMargin,
        name: leftMargin + 15,
        quantity: leftMargin + 100,
        rate: leftMargin + 130,
        amount: leftMargin + 160,
    };

    pdf.text("S.N.", colPositions.sn, yPosition);
    pdf.text("Name", colPositions.name, yPosition);
    pdf.text("Quantity", colPositions.quantity, yPosition);
    pdf.text("Rate", colPositions.rate, yPosition);
    pdf.text("Amount", colPositions.amount, yPosition);

    yPosition += 8;

    // Table line
    pdf.setDrawColor(0, 0, 0);
    pdf.line(leftMargin, yPosition - 2, pageWidth - rightMargin, yPosition - 2);
    yPosition += 5;

    // Items rows
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    if (order.items && order.items.length > 0) {
        order.items.forEach((item, index) => {
            const subtotal = item.quantity * item.price;

            pdf.text((index + 1).toString(), colPositions.sn, yPosition);
            pdf.text(item.name, colPositions.name, yPosition);
            pdf.text(item.quantity.toString(), colPositions.quantity, yPosition);
            pdf.text(`Rs. ${item.price.toFixed(0)}`, colPositions.rate, yPosition);
            pdf.text(`Rs. ${subtotal.toFixed(0)}`, colPositions.amount, yPosition);

            yPosition += 8;
        });
    }

    // Table bottom line
    pdf.line(leftMargin, yPosition, pageWidth - rightMargin, yPosition);
    yPosition += 15;

    // Amount in Words
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("Amount in Words", leftMargin, yPosition);
    yPosition += 6;

    pdf.setFont("helvetica", "normal");
    // Convert number to words (simplified version)
    const amountInWords = convertNumberToWords(order.totalAmount);
    pdf.text(amountInWords, leftMargin, yPosition);
    yPosition += 15;

    // Summary section (right aligned)
    const summaryStartX = pageWidth - rightMargin - 80;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    // Subtotal
    pdf.text("Subtotal:", summaryStartX, yPosition);
    pdf.text(`Rs. ${order.baseAmount.toFixed(0)}`, pageWidth - rightMargin, yPosition, {
        align: "right",
    });
    yPosition += 8;

    // Total Amount
    pdf.setFont("helvetica", "bold");
    pdf.text("Total Amount:", summaryStartX, yPosition);
    pdf.text(`Rs. ${order.totalAmount.toFixed(0)}`, pageWidth - rightMargin, yPosition, {
        align: "right",
    });
    yPosition += 8;

    // Received Amount
    pdf.text("Received Amount:", summaryStartX, yPosition);
    const totalPaid =
        order.transactions?.reduce((sum, t) => sum + t.amount, 0) || order.totalAmount;
    pdf.text(`Rs. ${totalPaid.toFixed(0)}`, pageWidth - rightMargin, yPosition, { align: "right" });

    return pdf;
};

// Helper function to convert numbers to words (Indian numbering system)
const convertNumberToWords = (amount: number): string => {
    if (amount === 0) return "zero rupees";

    const ones = [
        "",
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
        "nine",
        "ten",
        "eleven",
        "twelve",
        "thirteen",
        "fourteen",
        "fifteen",
        "sixteen",
        "seventeen",
        "eighteen",
        "nineteen",
    ];
    const tens = [
        "",
        "",
        "twenty",
        "thirty",
        "forty",
        "fifty",
        "sixty",
        "seventy",
        "eighty",
        "ninety",
    ];
    const units = [
        { value: 10000000, str: "crore" },
        { value: 100000, str: "lakh" },
        { value: 1000, str: "thousand" },
        { value: 100, str: "hundred" },
    ];

    function numberToWords(n: number): string {
        let word = "";
        if (n < 20) {
            word += ones[n];
        } else if (n < 100) {
            word += tens[Math.floor(n / 10)];
            if (n % 10 > 0) word += " " + ones[n % 10];
        } else {
            for (const unit of units) {
                if (n >= unit.value) {
                    const count = Math.floor(n / unit.value);
                    word += numberToWords(count) + " " + unit.str;
                    n = n % unit.value;
                    if (n > 0) word += " ";
                }
            }
            if (n > 0) {
                if (word !== "") word += "and ";
                word += numberToWords(n);
            }
        }
        return word.trim();
    }

    let result = numberToWords(amount);
    // Capitalize first letter
    result = result.charAt(0).toUpperCase() + result.slice(1);
    return result + " rupees";
};

export const downloadInvoicePDF = (order: Order, organization?: Organization | null): void => {
    try {
        const pdf = generateInvoicePDF(order, organization);
        pdf.save(`Invoice-${order.orderNumber}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
        throw new Error("Failed to generate PDF");
    }
};

export const printInvoicePDF = (order: Order, organization?: Organization | null): void => {
    try {
        const pdf = generateInvoicePDF(order, organization);

        // Open PDF in a new window for printing
        const pdfUrl = pdf.output("bloburl");
        const printWindow = window.open(pdfUrl);

        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print();
            };
        }
    } catch (error) {
        console.error("Error generating PDF for printing:", error);
        throw new Error("Failed to generate PDF for printing");
    }
};
