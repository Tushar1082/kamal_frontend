import { useState, useEffect, useRef } from "react";
import { CircleX, IndianRupee, PlusIcon, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { BillPDF } from "./BillPDF";
import { Toaster, toast } from "react-hot-toast";
import ItemAutocomplete from "./ItemAutocomplete";
import PPColumn from "./PPColumn";
import ConfirmDialog from "./ConfirmDialog";

export default function ViewInvoices({ invoiceNum, invoiceId, customerId, BillType, silverRate, setShowLoader, setShowInvoice, setAllCustomers }) {
    const [items, setItems] = useState([
        {
            itemIdx: null,
            itemName: '',
            rateGm: 0,
            ratePer: 0,
            weight: 0, // gross weight
            ppRows: [
                { count: 0, weight: 0 }
            ],
            amount: "0",
            newItems: true
        }
    ]);

    const [totalAmount, setTotalAmount] = useState("0");
    const [open, setOpen] = useState({ show: false, idx: null, dbDelIdx: null });
    const [isAddingRow, setIsAddingRow] = useState(false);
    const lastRowRef = useRef(null);

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

    const getTotalPPWeight = (ppRows = []) => {
        return ppRows.reduce((sum, row) => {
            const count = Number(row.count || 0);
            const weight = Number(row.weight || 0);
            return sum + count * weight;
        }, 0);
    };

    function convertPolyArray(arr) {
        if (!Array.isArray(arr) || arr.length === 0) {
            return [{ count: 0, weight: 0 }];
        }

        return arr.map(item => ({
            count: item?.noOfPPs ?? 0,
            weight: item?.weightOfOpp ?? 0
        }));
    }


    const closeInvoice = () => {
        setShowInvoice({
            show: false,
            invId: null,
            invoiceNo: null
        });
        setItems([]);
        // setOpen({ show: false, idx: null, dbDelIdx: null });
        setTotalAmount("0");
    }


    const handleInputChange = (idx, field, value) => {
        setItems((prev) =>
            prev.map((item, i) => {
                if (i === idx) {
                    const updatedItem = { ...item, [field]: value };

                    return updatedItem;
                }
                return item;
            })
        );

    };

    const addRow = () => {
        setItems((prev) => [
            ...prev,
            {
                itemIdx: null,
                itemName: '',
                rateGm: 0,
                ratePer: 0,
                weight: 0, // gross weight
                ppRows: [
                    { count: 0, weight: 0 }
                ],
                amount: "0",
                newItems: true
            }
        ]);

        setIsAddingRow(true);
    };

    const deleteCusItem = async (idx) => {
        // if (!open.idx || !open.dbDelIdx) {
        //     return;
        // }

        try {
            // setShowLoader(true);

            // const delRes = await fetch(
            //     `${import.meta.env.VITE_API_URL}/customer-items/delete`,
            //     {
            //         method: 'POST',
            //         headers: { 'content-type': 'application/json' },
            //         body: JSON.stringify({
            //             itemId: open.dbDelIdx
            //         })
            //     }
            // );

            // const delResult = await delRes.json();

            // if (delResult.status !== 'success') {
            //     toast.error('Something went wrong while deleting items');
            //     console.log(delResult);
            //     return;
            // }
            let totalAm = 0;

            setItems((prev) => {
                const updated = prev.filter((item, elmIdx) => (
                    elmIdx !== idx
                ))

                updated.forEach((elm) => {
                    totalAm += elm.amount
                })

                // If everything is deleted, reset to one empty row
                if (updated.length === 0) {
                    return [
                        {
                            itemIdx: null,
                            itemName: '',
                            rateGm: 0,
                            ratePer: 0,
                            weight: 0, // gross weight
                            ppRows: [
                                { count: 0, weight: 0 }
                            ],
                            amount: "0",
                            newItems: true
                        }
                    ];
                }

                return updated;
            });

            // setAllCustomers((prev) => {
            //     return prev.map((pElm) => {

            //         if (pElm.cusId === customerId) {
            //             return {
            //                 ...pElm,
            //                 invoices: pElm.invoices.map((elm) =>
            //                     elm.id === invoiceId
            //                         ? { ...elm, totalAmount: totalAm }
            //                         : elm
            //                 )
            //             };
            //         }

            //         return pElm;
            //     });
            // });

        } catch (error) {
            console.error(error);
            toast.error('Something Went Wrong, Try again later!');
        }
        // finally {
        //     setShowLoader(false);
        // }


    }

    const validateAll = () => {
        // Add new Customer
        if (!silverRate || parseInt(silverRate) <= 0) {
            toast.error("Please Provide Valid Sliver Rate..");
            return false;
        }

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const row = i + 1;

            // 1️⃣ Item name
            if (!item.itemName?.trim()) {
                toast.error(`Row ${row}: Item name is required`);
                return false;
            }

            // 2️⃣ Rate validation
            const hasRateGm = Number(item.rateGm) > 0;
            const hasRatePer = Number(item.ratePer) > 0;

            if (!hasRateGm && !hasRatePer) {
                toast.error(`Row ${row}: Enter Rate / Gram OR Rate / %`);
                return false;
            }

            // 3️⃣ Gross weight
            if (!item.weight || Number(item.weight) <= 0) {
                toast.error(`Row ${row}: Gross weight is required`);
                return false;
            }

            // 4️⃣ PP rows validation
            if (!Array.isArray(item.ppRows) || item.ppRows.length === 0) {
                toast.error(`Row ${row}: At least one PP row is required`);
                return false;
            }

            for (let j = 0; j < item.ppRows.length; j++) {
                const pp = item.ppRows[j];
                const ppRow = j + 1;

                if (Number(pp.count) < 0) {
                    toast.error(
                        `Row ${row}, PP ${ppRow}: No of polythenes must be greater than 0`
                    );
                    return false;
                }

                if (Number(pp.weight) < 0) {
                    toast.error(
                        `Row ${row}, PP ${ppRow}: PP weight cannot be negative`
                    );
                    return false;
                }
            }

            // 5️⃣ Net weight sanity check
            // const totalPPWeight = item.ppRows.reduce(
            //     (sum, pp) => sum + Number(pp.weight || 0),
            //     0
            // );

            // if (totalPPWeight >= Number(item.weight)) {
            //     toast.error(
            //         `Row ${row}: Total PP weight cannot be greater than or equal to gross weight`
            //     );
            //     return false;
            // }
        }

        return true;
    };

    const transformItemsForBackend = (items) =>
        items.map(item => {
            const polythenes = item.ppRows
                .filter(pp => pp.count && pp.weight)
                .map(pp => ({
                    noOfPPs: pp.count,
                    weight: pp.weight
                }));

            const totalPP = polythenes.reduce(
                (sum, p) => sum + (p.noOfPPs * p.weight),
                0
            );

            return {
                itemName: item.itemName,
                rateGm: item.rateGm || null,
                ratePer: item.ratePer || null,
                grossWeight: item.weight,
                netWeight: item.weight - totalPP,
                polythenes
            };
        });

    // const handleUpdate = async () => {
    //     try {
    //         if (!validateAll()) return;

    //         setShowLoader(true);

    //         const newIArr = transformItemsForBackend(items);

    //         if (!customerId || newIArr.length === 0) {
    //             toast.error("Invalid data");
    //             return;
    //         }

    //         const response = await fetch(
    //             `${import.meta.env.VITE_API_URL}/customer-items/add`,
    //             {
    //                 method: "POST",
    //                 headers: { "content-type": "application/json" },
    //                 body: JSON.stringify({
    //                     Items: newIArr,
    //                     CusId: customerId,
    //                     InvoiceNo: invoiceId+""
    //                 })
    //             }
    //         );

    //         if (!response.ok) {
    //             const errText = await response.text();
    //             console.log(errText);
    //             throw new Error(errText || "Server Error");
    //         }

    //         const result = await response.json();

    //         toast.success(result.message || "Items Updated Successfully!");

    //     } catch (error) {
    //         console.error(error);
    //         toast.error(error.message || "Something Went Wrong");
    //     } finally {
    //         setShowLoader(false);
    //     }
    // };


    const previewBill = async (isGenBill = true) => {
        try {
            if (!validateAll()) return;
            setShowLoader(true);

            // ADD ITEMS
            const newIArr = transformItemsForBackend(items);

            if (!customerId && !invoiceId) {
                return;
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/customer-items/add`,
                {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        Items: newIArr,
                        CusId: customerId,
                        BillType,
                        InvoiceNo: invoiceId + ""
                    })
                }
            );
            const result = await response.json();

            if (result.status !== 'success') {
                toast.error('Something went wrong while adding items');
                console.log(result);
                return;
            }

            generateBill(isGenBill);
        } catch (error) {
            console.error(error);
            toast.error('Something Went Wrong, Try again later!');
        } finally {
            setShowLoader(false);
        }
    };

    async function generateBill(isGenBill) {

        if (isGenBill) {
            const blob = await pdf(
                <BillPDF items={items} silverRate={silverRate} />
            ).toBlob();

            window.open(URL.createObjectURL(blob));
        }

        let total = 0;

        const updatedItems = items.map(item => {
            const netWeight = Math.max(0, item.weight - getTotalPPWeight(item.ppRows));
            let amount = 0;

            if (item.rateGm > 0 && netWeight > 0) {
                amount = Math.round(item.rateGm * netWeight);
            } else if (item.ratePer > 0 && netWeight > 0) {
                const silverPerKg = (item.ratePer / 100) * silverRate;
                amount = Math.round((silverPerKg * netWeight) / 1000);
            }

            total += amount;

            return {
                ...item,
                amount // keep as number
            };
        });

        setAllCustomers((prev) => {
            return prev.map((pElm) => {

                if (pElm.cusId === customerId) {
                    return {
                        ...pElm,
                        invoices: pElm.invoices.map((elm) =>
                            elm.id === invoiceId
                                ? { ...elm, totalAmount: total }
                                : elm
                        )
                    };
                }

                return pElm;
            });
        });

        setItems(updatedItems);
        setTotalAmount(total);
    }

    async function fetchInvoiceItems() {
        try {
            if (!invoiceId) {
                console.log("Invoice id is required!");
                return;
            }
            setShowLoader(true);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/customer-items/${invoiceId}/items`);
            const result = await response.json();
            console.log(result);
            if (result.status == 'success') {
                if (!Array.isArray(result.items)) {
                    console.log("Invoice Items Not Found!");
                    return;
                }
                let totalAm = 0;

                const mappedItems = result.items.map(item => {
                    const polythenes = item.polythenes ? convertPolyArray(item.polythenes) : [
                        { count: 0, weight: 0 }
                    ];
                    const netWeight = item.grossWeight - getTotalPPWeight(polythenes); // grams only
                    // console.log(netWeight);
                    // let itemAmount = item.gramOrPerc === "G" ?
                    //     Math.round(netWeight * item.rate)
                    //     :
                    //     Math.round(netWeight * ((silverRate * (item.rate / 100) / 1000)));

                    // totalAm += itemAmount;

                    let itemAmount = 0;

                    if (item.gramOrPerc === "G") {
                        itemAmount = Math.round(netWeight * item.rate);
                    } else if (item.gramOrPerc === "P") {
                        const effectiveRatePerGram = (silverRate * item.rate) / 100 / 1000;
                        itemAmount = Math.round(netWeight * effectiveRatePerGram);
                    }

                    totalAm += itemAmount;


                    return {
                        itemIdx: item.id,
                        itemName: stringFLCMaker(item.itemName) || "",

                        rateGm: item.gramOrPerc === "G" ? Number(item.rate) : 0,
                        ratePer: item.gramOrPerc === "P" ? Number(item.rate) : 0,

                        weight: Number(item.grossWeight) || 0,
                        ppRows: polythenes,

                        amount: itemAmount,
                        newItems: false
                    };
                });

                setItems(mappedItems);
                setTotalAmount(totalAm);
            } else if (result.status == 'error') {
                console.log("Error comes from the server...");
                console.log(result.message);
            } else {
                console.log(result.message);
            }

        } catch (error) {
            console.log("Error occur while fetching existing customer items..");
            console.log(error);
        } finally {
            setShowLoader(false);
        }
    }

    useEffect(() => {
        fetchInvoiceItems();
    }, []);

    useEffect(() => {
        if (isAddingRow && lastRowRef.current) {
            lastRowRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            setIsAddingRow(false);
        }
    }, [items, isAddingRow]);

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[50]">
            {/* <ConfirmDialog
                isOpen={open.show}
                onClose={() => setOpen({ show: false, idx: null, dbDelIdx: null })}
                onConfirm={deleteCusItem}
                title="Delete Item"
                message="Are you sure you want to delete this item?"
            /> */}

            <div className="w-[80%]">
                {/* Items container */}
                <div className="rounded-xl bg-white mb-3">
                    <div className="flex gap-6 items-center justify-between  border-b-2 border-gray-200 pt-5 px-7 pb-5">
                        <div style={{ alignItems: 'anchor-center' }} className="flex gap-3">
                            <img src="/billIcon.svg" width={30} alt="error" />
                            <h1 className="font-semibold text-2xl">Itemized Billing</h1>
                        </div>
                        <div className="px-4 py-2 bg-green-200 border-2 border-green-600 rounded-md">
                            <p className="text-sm text-green-600 font-semibold">INV: {invoiceNum ?? "New"}</p>
                        </div>
                    </div>
                    <div className="px-4 pt-2 pb-2 max-h-[60vh] overflow-auto">
                        <table className="border-separate border-spacing-4">
                            <thead>
                                <tr>
                                    <th className="text-left font-semibold">ITEM NAME</th>
                                    <th className="text-left font-semibold">RATE / GRAM</th>
                                    <th className="text-left font-semibold">RATE %</th>
                                    <th className="text-left font-semibold">GROSS WEIGHT (g)</th>
                                    <th className="text-left font-semibold">PP(QTY | WEIGHT)</th>
                                    <th className="text-left font-semibold">AMOUNT</th>
                                    <th className="text-center font-semibold">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items
                                    .map((item, idx) => (
                                        <tr key={idx} ref={idx === items.length - 1 ? lastRowRef : null} className="align-top">
                                            <td>
                                                <ItemAutocomplete
                                                    value={item.itemName}
                                                    idx={idx}
                                                    onChange={(val) =>
                                                        handleInputChange(idx, "itemName", val)
                                                    }
                                                    setItems={setItems}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={item.rateGm}
                                                    onChange={(e) =>
                                                        handleInputChange(idx, "rateGm", parseFloat(e.target.value))
                                                    }
                                                    disabled={item.ratePer > 0 ? true : false}
                                                    className={`border w-full border-gray-300 px-4 py-2 rounded-lg outline-none ${item.ratePer > 0 ? 'bg-[#d3d3d39e]' : ''}`}
                                                    placeholder="Rate (gm)"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={item.ratePer}
                                                    onChange={(e) =>
                                                        handleInputChange(idx, "ratePer", parseFloat(e.target.value))
                                                    }
                                                    disabled={item.rateGm > 0 ? true : false}
                                                    className={`border border-gray-300 w-full px-4 py-2 rounded-lg outline-none ${item.rateGm > 0 ? 'bg-[#d3d3d39e]' : ''}`}
                                                    placeholder="Rate (%)"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={item.weight}
                                                    onChange={(e) =>
                                                        handleInputChange(idx, "weight", parseFloat(e.target.value))
                                                    }
                                                    className="border w-full border-gray-300 px-4 py-2 rounded-lg outline-none"
                                                    placeholder="Gross Weight"
                                                />
                                            </td>
                                            <td>
                                                <PPColumn
                                                    itemIndex={idx}
                                                    ppRows={item.ppRows}
                                                    setItems={setItems}
                                                />
                                            </td>
                                            <td className="w-fit whitespace-nowrap font-semibold">
                                                Rs. {formatIndianAmount(item.amount)}
                                            </td>
                                            <td className="text-center flex items-center gap-2">
                                                <button
                                                    onClick={addRow}
                                                    className="bg-[#6366F1] hover:bg-[#4B50C1] transition-background duration-500 text-white p-2 font-semibold flex items-center gap-2 rounded-lg text-md w-fit"
                                                >
                                                    <PlusIcon />
                                                </button>
                                                <button onClick={() => deleteCusItem(idx)} className="bg-red-600 hover:bg-red-700 transition-background duration-500 text-white cursor-pointer p-2 px-3 font-semibold rounded-lg text-md w-fit mx-auto outline-none border-none"><Trash2 size={23} /></button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex items-center justify-between border border-[#6366F1] rounded-xl bg-white overflow-hidden px-8 py-6">
                    <div className="ml-1">
                        <p className="text-gray-600 font-semibold text-sm">NET AMOUNT</p>
                        <h1 className="font-bold text-[#6366F1] flex items-center text-3xl"><IndianRupee strokeWidth={3} size={28} /> {formatIndianAmount(totalAmount)}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={previewBill}
                            className="bg-[#6366F1] hover:bg-[#4B50C1] cursor-pointer transition-background duration-500 text-white px-8 py-3.5 font-medium flex items-center gap-3 rounded-lg text-md w-fit"
                        >
                            <img src="/printer-white.svg" width={25} alt="error" />
                            <span>
                                Generate Bill
                            </span>
                        </button>
                        <button onClick={() => previewBill(false)} className="bg-black/80 hover:bg-black/90 cursor-pointer transition-background duration-500 text-white pl-5 pr-8 py-3 font-medium flex items-center gap-3 rounded-lg text-md w-fit">
                            <RefreshCw className="w-5 h-5" />
                            Update
                        </button>
                        <button
                            className="
                                    flex items-center gap-3
                                    rounded-lg
                                    bg-red-500 px-8 py-3.5
                                    text-md font-medium text-white
                                    hover:bg-red-600
                                    transition
                                "
                            onClick={closeInvoice}
                        >
                            <CircleX className="h-6 w-6 text-white" />
                            Close
                        </button>
                    </div>
                </div>
            </div>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        pointerEvents: "none",
                    },
                }}
            />
        </div>
    );
}