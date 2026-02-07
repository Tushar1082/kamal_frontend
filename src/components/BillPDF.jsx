import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Register font globally
Font.register({
    family: "Roboto",
    fonts: [
        { src: "/fonts/Roboto-Regular.ttf", fontWeight: "normal" },
        { src: "/fonts/Roboto-Medium.ttf", fontWeight: "500" },
        { src: "/fonts/Roboto-Italic.ttf", fontStyle: "italic" },
    ],
});

const rupee = "\u20B9";

const stringFLCMaker = (str) => {
    if (!str) {
        return "";
    }

    const strArr = str.split(" ");

    // Capitalize the first letter of each word
    const word = strArr
        .map((elm) => {
            return elm.charAt(0).toUpperCase() + elm.slice(1).toLowerCase();
        })
        .join(" ");

    return word;
};

function formatIndianAmount(amount) {
    return Number(amount).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    });
}

const calculateAmount = (item, silverRate) => {
    const weight = Number(item.weight || 0);
    const pp = Number(item.pp || 0);
    const netWeight = weight - pp;

    if (item.rateGm > 0 && netWeight > 0) {
        return Math.round(item.rateGm * netWeight);
    }

    if (item.ratePer > 0 && weight > 0) {
        const silverAmount = (item.ratePer / 100) * silverRate;
        return Math.round((silverAmount * netWeight) / 1000);
    }

    return 0;
};

function billDate() {
    const date = new Date();

    const formattedDate = date
        .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        .replace(/ /g, "-")
        .toLowerCase();

    return formattedDate;
}

function billTime() {
    const formattedTime = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return formattedTime; // 02:45 PM
}

// function billDateTime() {
//     const now = new Date();

//     const date = now
//         .toLocaleDateString("en-GB", {
//             day: "2-digit",
//             month: "short",
//             year: "numeric",
//         })
//         .replace(/ /g, "-")
//         .toLowerCase();

//     const time = now.toLocaleTimeString("en-GB", {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//     });

//     return `${date}, ${time}`;
//     // 20-feb-2026 02:45 PM

// }

const styles = StyleSheet.create({
    // page: {
    //     padding: 40,
    //     fontFamily: "Roboto",
    //     fontSize: 9,
    //     backgroundColor: "#fff",
    // },
    page: {
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: 50,
        paddingRight: 50,
        fontFamily: "Roboto",
        fontSize: 9,
        backgroundColor: "#fff",
    },


    topHalf: {
        height: "50%",
        width: "70%",
        margin: "0px auto"
    },

    rotatedWrapper: {
        height: "100%",
        // transform: "rotate(270deg)",
        transformOrigin: "center center",
    },

    invoiceBox: {
        borderWidth: 1,
        borderColor: "#000",
        padding: 14,
    },

    /* HEADER */
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    shopName: {
        fontSize: 14,
        fontWeight: "500",
    },

    shopText: {
        fontSize: 6,
        lineHeight: 1.4,
    },

    rightText: {
        fontSize: 7,
        textAlign: "right",
        fontWeight: 'bold'
    },

    rightHeaderText: {
        fontSize: 6,
        textAlign: "right",
        fontWeight: 'bold'
    },

    divider: {
        borderTopWidth: 0.3,
        marginVertical: 8
    },

    rateText: {
        fontSize: 7,
        fontWeight: "500",
        marginBottom: 10,
        alignContent: 'center',
        justifyContent: 'center'
    },

    borderBottom: {
        borderBottom: 0.3,
        width: '12%'
    },

    sectionTitle: {
        fontSize: 10,
        fontWeight: "500",
        marginBottom: 6,
    },

    /* ITEM BLOCK */
    itemBlock: {
        marginBottom: 8,
    },

    itemName: {
        fontSize: 9,
        fontWeight: "500",
        marginBottom: 2,
    },

    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'flex-start'
    },

    weightBox: {
        width: "50%",
    },

    weightText: {
        fontSize: 7,
        lineHeight: 1.4,
    },

    rateBox: {
        fontSize: 7,
        width: "50%",
        alignItems: "center",
        justifyContent: "center",
    },

    mainRightHeader: {
        justifyContent: 'space-between'
    },

    silverRateBlockMain: {
        marginBottom: 0,
        alignItems: "flex-end",     // ⬅️ center the whole block
    },

    silverRateBlock: {
        alignItems: "center",     // ⬅️ center text horizontally
        justifyContent: "center", // ⬅️ center vertically
    },

    silverRateLabel: {
        fontSize: 6,
        fontWeight: "500",
        marginBottom: 1,
        textAlign: "center",      // ⬅️ important
    },

    silverRateValue: {
        fontSize: 5,
        fontWeight: "400",
        textAlign: "center",      // ⬅️ important
    },

    amountBox: {
        width: "50%",
        alignItems: "flex-end",
        justifyContent: "center",
    },

    amountText: {
        fontSize: 7,
        fontWeight: "500",
    },

    itemDivider: {
        borderTopWidth: 0.3,
        marginTop: 6,
        color: 'lightgrey'
    },

    totalsBox: {
        marginTop: 10,
        alignItems: "flex-end",
    },

    totalText: {
        fontSize: 7,
    },

    netAmount: {
        fontSize: 9,
        fontWeight: "500",
        marginTop: 4,
    },

    footerDivider: {
        borderTopWidth: 0.3,
        marginVertical: 10,
    },

    // footerText: {
    //     fontSize: 8,
    //     textAlign: "center",
    //     fontStyle: "italic",
    //     marginTop: 20
    // },
    // footerSub: {
    //     fontSize: 5,
    //     textAlign: "center",
    //     color: "#555",
    //     marginTop: 2,
    // }

    footer: {
        marginTop: 20,
        textAlign: "center",
    },

    footerText: {
        fontSize: 8,
        textAlign: "center",
        fontStyle: "italic",
        lineHeight: 1.4,
    },

    footerSub: {
        fontSize: 6,
        textAlign: "center",
        color: "#555",
        marginTop: 4,
    }


});

export const BillPDF = ({ items, silverRate }) => {
    const grandTotal = items.reduce(
        (sum, i) => sum + Number(i.amount || 0),
        0
    );
    function totalAmount() {
        let totalAm = 0;

        items.forEach((item) => {
            totalAm += calculateAmount(item, silverRate);
        });

        return totalAm;
    }

    const totalWeight = items.reduce(
        (sum, i) =>
            sum + Math.max(0, Number(i.weight || 0) - Number(i.pp || 0)),
        0
    );

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.topHalf}>
                    <View style={styles.rotatedWrapper}>
                        <View style={styles.invoiceBox}>
                            {/* HEADER */}
                            <View style={styles.headerRow}>
                                <View>
                                    <Text style={styles.shopText}>Estimate Only</Text>
                                    <Text style={styles.shopText}>No Physical Transaction</Text>
                                    <Text style={styles.shopName}>Kamal Jewellers</Text>
                                    <Text style={styles.shopText}>
                                        28/66, Seo ka Bazar, Agra
                                    </Text>
                                    <Text style={styles.shopText}>
                                        Phone: +91 8126394316
                                    </Text>
                                </View>

                                <View style={styles.mainRightHeader}>
                                    <View>
                                        <Text style={styles.rightHeaderText}>
                                            Date: {billDate()}
                                        </Text>
                                        <Text style={styles.rightHeaderText}>
                                            Time: {billTime()}
                                        </Text>
                                    </View>

                                    <View style={styles.silverRateBlockMain}>
                                        <View style={styles.silverRateBlock}>
                                            <Text style={styles.silverRateLabel}>
                                                Silver Rate
                                            </Text>

                                            <Text style={styles.silverRateValue}>
                                                {formatIndianAmount(silverRate)}/kg
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.divider} />


                            {/* <Text style={styles.sectionTitle}>Issued Items</Text> */}

                            {items.map((item, idx) => {
                                if (!item.itemName?.trim()) return null;

                                const gross = Number(item.weight || 0);
                                const pp = Number(item.pp || 0);
                                const net = gross - pp;

                                return (
                                    <View key={idx} style={styles.itemBlock}>
                                        <Text style={styles.itemName}>{stringFLCMaker(item.itemName)}</Text>

                                        <View style={styles.itemRow}>
                                            {/* WEIGHT */}
                                            <View style={styles.weightBox}>
                                                <Text style={styles.weightText}>
                                                    Gr wt {gross} g
                                                </Text>
                                                <Text style={styles.weightText}>
                                                    PP {pp} g
                                                </Text>
                                                <Text style={styles.weightText}>
                                                    Nt wt = {net} g
                                                </Text>
                                            </View>

                                            {/* RATE */}
                                            <View style={styles.rateBox}>
                                                <Text>
                                                    RATE
                                                </Text>
                                                <Text>
                                                    {item.rateGm
                                                        ? `${item.rateGm}/g`
                                                        : `${formatIndianAmount((item.ratePer / 100) * silverRate)}/kg`}
                                                </Text>
                                            </View>

                                            {/* AMOUNT */}
                                            <View style={styles.amountBox}>
                                                <Text style={styles.amountText}>
                                                    {rupee}
                                                    {formatIndianAmount(calculateAmount(item, silverRate))}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.itemDivider} />
                                    </View>
                                );
                            })}

                            {/* TOTALS */}
                            <View style={styles.totalsBox}>
                                <Text style={styles.totalText}>
                                    Total Weight: {totalWeight} g
                                </Text>
                                <Text style={styles.netAmount}>
                                    Net Amount: {rupee}
                                    {formatIndianAmount(totalAmount())}
                                </Text>
                            </View>

                            {/* <View style={styles.footerDivider} /> */}
                            {/* <View style={styles.footerText}>
                                <Text>
                                    Thank you for your business
                                </Text>
                                <Text>
                                    Follow us on our instagram page @kamaljewellersagra
                                </Text>
                            </View>

                            <Text style={styles.footerSub}>
                                This is a computer-generated invoice.
                            </Text> */}

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>
                                    Thank you for your business
                                </Text>

                                <Text style={styles.footerText}>
                                    Follow us on Instagram @kamaljewellersagra
                                </Text>

                                <Text style={styles.footerSub}>
                                    This is a computer-generated invoice.
                                </Text>
                            </View>


                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
