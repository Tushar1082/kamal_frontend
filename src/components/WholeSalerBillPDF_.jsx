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

const getTotalPPWeight = (ppRows = []) => {
    return ppRows.reduce((sum, row) => {
        const count = Number(row.count || 0);
        const weight = Number(row.weight || 0);
        return sum + count * weight;
    }, 0);
};

function formatIndianAmount(amount) {
    return Number(amount).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    });
}

const calculateAmount = (item, silverRate) => {
    const grossWeight = Number(item.weight || 0);

    const totalPP = getTotalPPWeight(item.ppRows);

    const netWeight =
        grossWeight - totalPP;

    if (item.rateGm > 0 && netWeight > 0) {
        return Math.round(item.rateGm * netWeight);
    }

    if (item.ratePer > 0 && grossWeight > 0) {
        const silverAmount = (item.ratePer / 100) * silverRate;
        return Math.round((silverAmount * netWeight) / 1000);
    }

    return 0;
};

const formatNoRound = (num, decimals = 2) => {
    if (Number.isInteger(num)) return num;

    const [int, dec = ""] = num.toString().split(".");
    return dec
        ? Number(`${int}.${dec.slice(0, decimals)}`)
        : num;
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

const styles = StyleSheet.create({
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
        // height: "50%",
        width: "70%",
        margin: "0px auto"
    },

    rotatedWrapper: {
        height: "100%",
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
        marginBottom: 0.5
    },

    shopText: {
        fontSize: 6,
        lineHeight: 1.4,
    },

    estPhyText: {
        fontSize: 7,
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

    // borderBottom: {
    //     borderBottom: 0.3,
    //     width: '12%',
    //     paddingBottom: 1
    // },

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
        fontWeight: "400",
        marginBottom: 2,
    },

    itemRow: {
        flexDirection: "row",
        // justifyContent: "space-between",
        alignItems: 'flex-start'
    },

    weightBox: {
    },

    weightText: {
        flexDirection: 'row',
        fontSize: 7,
        lineHeight: 1.4,
    },

    rateBox: {
        fontSize: 7,
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
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
        fontSize: 6,
        fontWeight: "400",
        textAlign: "center",      // ⬅️ important
    },

    NameWtBox: {
        flex: 1
    },

    amountBox: {
        flex: 1,
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
    },

    /* ================= NON TABULAR ITEM STYLE ================= */

    itemsWrapper: {
        // marginTop: 10,
    },

    // itemBlock: {
    // paddingVertical: 7,
    // },

    itemTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },

    itemLeft: {
        flex: 1
    },

    // itemName: {
    //     fontSize: 9,
    //     fontWeight: "500",
    //     marginBottom: 2,
    // },

    itemDetails: {
        fontSize: 7,
        color: "#444",
        lineHeight: 1.4,
    },

    itemRateBlock: {
        flex: 1,
        alignItems: "center",
    },

    rateLabel: {
        fontSize: 6.5,
        color: "#666",
        marginBottom: 2,
    },

    rateValue: {
        fontSize: 8,
        fontWeight: "500",
    },

    itemAmount: {
        flex: 1,
        // width: "25%",
        alignItems: "flex-end",
    },

    // amountText: {
    //     fontSize: 9,
    //     fontWeight: "500",
    // },

    // itemDivider: {
    //     borderTopWidth: 0.4,
    //     borderColor: "#bbb",
    //     marginTop: 8,
    // },

    /* TOTAL SECTION */

    summarySection: {
        marginTop: 14,
        alignItems: "flex-end",
    },

    summaryText: {
        fontSize: 8,
        marginBottom: 2,
    },

    netAmountText: {
        fontSize: 11,
        fontWeight: "700",
        marginTop: 4,
    },


});

export const WholeSalerBillPDFA = ({ items, silverRate }) => {
    const SCALE = 100;

    function totalAmount() {
        let totalAm = 0;

        items.forEach((item) => {
            totalAm += calculateAmount(item, silverRate);
        });

        return totalAm;
    }
    const totalFine = items.reduce((sum, item) => {
        const gross = Math.round(Number(item.weight || 0) * SCALE);
        const ppTotal = Math.round(getTotalPPWeight(item.ppRows) * SCALE);

        const net = Math.max(0, gross - ppTotal);

        return item.ratePer ? net * (item.ratePer / 100) : 0;
    }, 0);

    const totalWeight = items.reduce((sum, item) => {
        const gross = Math.round(Number(item.weight || 0) * SCALE);
        const ppTotal = Math.round(getTotalPPWeight(item.ppRows) * SCALE);

        const net = Math.max(0, gross - ppTotal);

        return sum + net;
    }, 0) / SCALE;


    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.topHalf}>
                    <View style={styles.rotatedWrapper}>
                        <View style={styles.invoiceBox}>
                            {/* HEADER */}
                            <View style={styles.headerRow}>
                                <View>
                                    <Text style={styles.estPhyText}>Estimate Only</Text>
                                    <Text style={styles.estPhyText}>No Physical Transaction</Text>
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

                            <View style={styles.itemsWrapper}>
                                {items.map((item, idx) => {
                                    if (!item.itemName?.trim()) return null;

                                    const gross = Number(item.weight || 0);
                                    const totalPP = getTotalPPWeight(item.ppRows);
                                    const net = gross - totalPP;
                                    const amount = calculateAmount(item, silverRate);

                                    return (
                                        <View key={idx} style={styles.itemBlock}>
                                            <View style={styles.itemTopRow}>

                                                {/* LEFT SIDE */}
                                                <View style={styles.itemLeft}>
                                                    <Text style={styles.itemName}>
                                                        {stringFLCMaker(item.itemName)}
                                                    </Text>

                                                    <Text style={styles.itemDetails}>
                                                        Gr Wt. {formatNoRound(gross)}g, Nt Wt. {formatNoRound(net)}g
                                                    </Text>

                                                    {item?.ppRows &&
                                                        item.ppRows
                                                            .filter((elm) => elm.count > 0 && elm.weight > 0)
                                                            .map((ppElm, i) => (
                                                                <Text key={i} style={styles.itemDetails}>
                                                                    PP {ppElm.weight} x {ppElm.count}
                                                                </Text>
                                                            ))}
                                                </View>

                                                {/* CENTER RATE */}
                                                <View style={styles.itemRateBlock}>
                                                    <Text style={styles.rateLabel}>RATE</Text>
                                                    <Text style={styles.rateValue}>
                                                        {item.rateGm
                                                            ? `${formatNoRound(item.rateGm)}/g`
                                                            : `${formatIndianAmount(silverRate)}/kg`}
                                                    </Text>
                                                </View>

                                                {/* CENTER Labour */}
                                                <View style={styles.itemRateBlock}>
                                                    <Text style={styles.rateLabel}>FINE</Text>
                                                    <Text style={styles.rateValue}>
                                                        0
                                                        {/* {item.rateGm
                                                            ? `${formatNoRound(item.rateGm)}/g`
                                                            : `${formatIndianAmount(silverRate)}/kg`} */}
                                                    </Text>
                                                </View>

                                                {/* CENTER Labour */}
                                                <View style={styles.itemRateBlock}>
                                                    <Text style={styles.rateLabel}>LABOUR</Text>
                                                    <Text style={styles.rateValue}>
                                                        0
                                                        {/* {item.rateGm
                                                            ? `${formatNoRound(item.rateGm)}/g`
                                                            : `${formatIndianAmount(silverRate)}/kg`} */}
                                                    </Text>
                                                </View>

                                                {/* RIGHT AMOUNT */}
                                                <View style={styles.itemAmount}>
                                                    <Text style={styles.amountText}>
                                                        ₹{formatIndianAmount(amount)}
                                                    </Text>
                                                </View>

                                            </View>

                                            <View style={styles.itemDivider} />
                                        </View>
                                    );
                                })}
                            </View>


                            {/* TOTALS */}
                            <View style={styles.totalsBox}>
                                <Text style={styles.fineTotalText}>
                                    Total Fine: {formatNoRound(totalFine)} g
                                </Text>
                                <Text style={styles.totalText}>
                                    Total Weight: {formatNoRound(totalWeight)} g
                                </Text>
                                <Text style={styles.netAmount}>
                                    Net Amount: {rupee}
                                    {formatIndianAmount(totalAmount())}
                                </Text>
                            </View>

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
