import SideBar from "./SideBar";
import { useState, useEffect } from "react";
import { CircleUserRound, IndianRupee, Phone, PlusIcon, RotateCcw, Trash2, TrendingUp } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { BillPDF } from "./BillPDF";
import { Toaster, toast } from "react-hot-toast";
import { useRef } from 'react';
import ItemAutocomplete from "./ItemAutocomplete";


export default function AddItems({ customerDetails, hasCustomer, resCusItem, setResCusItem, setShowLoader }) {
    const [customer, setCustomer] = useState({
        cus_id: null,
        name: "",
        phone: "",
        silverRate: 0
    });
    const [items, setItems] = useState([
        {
            itemIdx: null, //it will contain db row index
            itemName: '',
            rateGm: 0,
            pp: 0,
            ratePer: 0,
            weight: 0, //Gross Weight
            amount: "0",
            newItems: true
        }
    ]);
    const [totalAmount, setTotalAmount] = useState("0");
    const [isBillGen, setIsBillGen] = useState(false);
    const [isItemsSet, setIsItemSet] = useState(false);

    const debounceRef = useRef(null);


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


    const handleRegenerate = () => {
        window.location.reload();
    }

    // const fetchItemRate = async (itemName, idx) => {
    //     if (!itemName.trim()) return;

    //     try {
    //         const res = await fetch(
    //             `${import.meta.env.VITE_API_URL}/customer-items/fetch-rate?item_name=${itemName.trim()}`
    //         );

    //         const result = await res.json();

    //         // if (result.status === 'success') {
    //         //     const obj = result.rate_type=='gram'?{ ...item, rateGm: result.rate }: { ...item, ratePer: result.rate }
    //         //     setItems(prev =>
    //         //         prev.map((item, i) =>
    //         //             i === idx ? obj : item
    //         //         )
    //         //     );
    //         // }
    //         if (result.status === 'success' && result.rate != null) {
    //             setItems(prev =>
    //                 prev.map((it, i) => {
    //                     if (i !== idx) return it;

    //                     return result.rateType === 'gram'
    //                         ? { ...it, rateGm: result.rate, ratePer: 0 }
    //                         : { ...it, ratePer: result.rate, rateGm: 0 };
    //                 })
    //             );
    //         }

    //     } catch (error) {
    //         console.error(error);
    //         toast.error('Something went wrong!');
    //     }
    // };


    const handleInputChange = (idx, field, value) => {
        if (!hasCustomer) {
            toast.error("Please add a customer before creating the bill.");
            return;
        }

        setItems((prev) =>
            prev.map((item, i) => {
                if (i === idx) {
                    const updatedItem = { ...item, [field]: value };

                    // Calculate amount based on the active rate
                    // if (updatedItem.rateGm > 0 && updatedItem.weight > 0) {
                    //     let netWeight = (updatedItem.weight - updatedItem.pp);
                    //     updatedItem.amount = formatIndianAmount(Math.round(updatedItem.rateGm * netWeight));
                    // } else if (updatedItem.ratePer > 0 && updatedItem.weight > 0) {
                    //     let silverAmount = ((updatedItem.ratePer / 100) * customer.silverRate)
                    //     updatedItem.amount = formatIndianAmount(Math.round((silverAmount * updatedItem.weight) / 1000));
                    // }
                    return updatedItem;
                }
                return item;
            })
        );

        // Debounced API call
        // if (field === 'itemName') {
        //     clearTimeout(debounceRef.current);

        //     debounceRef.current = setTimeout(() => {
        //         fetchItemRate(value, idx); //It work for both gm and percentage
        //     }, 400); // debounce delay (300–500ms ideal)
        // }

    };

    const addRow = () => {
        if (!hasCustomer) {
            toast.error("Please add a customer before creating the bill.");
            return;
        }
        setItems((prev) => [
            ...prev,
            {
                itemIdx: null,
                itemName: '',
                rateGm: 0,
                pp: 0,
                ratePer: 0,
                weight: 0, //Gross Weight
                amount: "0",
                newItems: true
            }
        ]);
    };

    const deleteCusItem = async (itemIdx, db_item_idx) => {

        try {
            setShowLoader(true);

            if (db_item_idx == null) {
                console.log('del query not run for this time..');
                setItems((prev) => {
                    const updated = prev.filter((item, idx) => (
                        idx !== itemIdx
                    ))

                    // If everything is deleted, reset to one empty row
                    if (updated.length === 0) {
                        return [
                            {
                                itemIdx: null,
                                itemName: '',
                                rateGm: 0,
                                pp: 0,
                                ratePer: 0,
                                weight: 0,
                                amount: "0",
                                newItems: true
                            }
                        ];
                    }

                    return updated;
                });
                return;
            }

            const delRes = await fetch(
                `${import.meta.env.VITE_API_URL}/customer-items/delete`,
                {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        cusId: customerDetails.cus_id,
                        delId: db_item_idx
                    })
                }
            );

            const delResult = await delRes.json();

            if (delResult.status !== 'success') {
                toast.error('Something went wrong while deleting items');
                console.log(delResult);
                return;
            }

            setItems((prev) => {
                const updated = prev.filter((item, idx) => (
                    idx !== itemIdx
                ))

                // If everything is deleted, reset to one empty row
                if (updated.length === 0) {
                    return [
                        {
                            itemIdx: null,
                            itemName: '',
                            rateGm: 0,
                            pp: 0,
                            ratePer: 0,
                            weight: 0,
                            amount: "0",
                            newItems: true
                        }
                    ];
                }

                return updated;
            });

        } catch (error) {
            console.error(error);
            toast.error('Something Went Wrong, Try again later!');
        } finally {
            setShowLoader(false);
        }

    }


    const validateItems = (items) => {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const row = i + 1;

            if (!item.itemName?.trim()) {
                toast.error(`Row ${row}: Item name is required`);
                return false;
            }

            const hasRateGm = Number(item.rateGm) > 0;
            const hasRatePer = Number(item.ratePer) > 0;

            if (!hasRateGm && !hasRatePer) {
                toast.error(`Row ${row}: Enter Rate / Gram OR Rate / %`);
                return false;
            }

            if (!item.weight || Number(item.weight) <= 0) {
                toast.error(`Row ${row}: Weight is required`);
                return false;
            }

            if (Number(item.pp) < 0) {
                toast.error(`Row ${row}: Please enter a valid PP value.`);
                return false;
            }

        }

        return true;
    };


    const previewBill = async () => {
        try {
            setShowLoader(true);
            if (!validateItems(items)) return;

            const newItemsArr = items.filter(item =>
                item.newItems === true &&
                typeof item.itemName === 'string' &&
                item.itemName.trim() !== '' &&
                item.itemName !== 'undefined' &&
                item.itemName !== 'null'
            );

            setIsBillGen(true);

            // console.log(items);
            // return;

            // Nothing to add or delete → just generate bill
            if (newItemsArr.length === 0) {
                generateBill();
                return;
            }

            // console.log(customerDetails.cus_id);

            // ADD ITEMS
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/customer-items/add`,
                {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        items: newItemsArr,
                        CusId: customerDetails.cus_id
                    })
                }
            );

            const result = await response.json();

            // console.log(result);

            if (result.status !== 'success') {
                toast.error('Something went wrong while adding items');
                console.log(result);
                return;
            }

            // Mark only newly added items as not new
            // setItems(prev =>
            //     prev.map(item =>
            //         item.newItems ? { ...item, newItems: false } : item
            //     )
            // );
            await fetchCustomerItems(customerDetails.cus_id);
            generateBill();

        } catch (error) {
            console.error(error);
            toast.error('Something Went Wrong, Try again later!');
        } finally {
            setShowLoader(false);
        }
    };

    async function generateBill() {
        const blob = await pdf(<BillPDF items={items} silverRate={customer.silverRate} />).toBlob();
        const url = URL.createObjectURL(blob);
        window.open(url); // Opens PDF in new tab
    }

    async function fetchCustomerItems(cus_id) {
        try {
            if (!cus_id) {
                console.log("Missing field: cus_id!");
                return;
            }
            setShowLoader(true);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/customer-items?cus_id=${cus_id}`);
            const result = await response.json();
            // console.log(result);

            if (result.status == 'success') {
                // console.log(result);

                if (!Array.isArray(result.data)) {
                    console.log("Customer Items Data Not Found!");
                    return;
                }
                // console.log(result.data);

                const mappedItems = result.data.map(item => ({
                    itemIdx: item.id,
                    itemName: stringFLCMaker(item.itemName) || "",
                    rateGm: item.rateType === "gram" ? Number(item.rate) : 0,
                    pp: item.pp || 0,
                    ratePer: item.rateType === "percentage" ? Number(item.rate) : 0,
                    weight: Number(item.grossWeight) || 0,
                    amount: formatIndianAmount(Math.round(item.grossWeight * item.rate)) || "0",
                    newItems: false
                }));
                // console.log(mappedItems);
                setItems(mappedItems);
                setTimeout(() => {
                    setIsItemSet(true);
                }, 0);

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
        if (resCusItem) {
            setItems(
                [{
                    itemIdx: null, //it will contain db row index
                    itemName: '',
                    rateGm: 0,
                    pp: 0,
                    ratePer: 0,
                    weight: 0, //Gross Weight
                    amount: "0",
                    newItems: true
                }]
            )

            setTimeout(() => {
                setResCusItem(false);
            }, 0)
        }
    }, [resCusItem])

    useEffect(() => {
        if (hasCustomer && customerDetails?.cus_id) {
            fetchCustomerItems(customerDetails?.cus_id);
        }
        setCustomer(customerDetails);
    }, [hasCustomer]);

    useEffect(() => {
        if (Array.isArray(items) && isItemsSet && (isBillGen || hasCustomer)) {
            let totalAm = 0;

            items.forEach((item) => {
                totalAm += calculateAmount(item, customer.silverRate);
                // totalAm += Math.round((item.weight - parseFloat(item.pp)) * item.rateGm);
            });
            // console.log('here');

            setItems((prev) =>
                prev.map((item) => {
                    // Calculate amount based on the active rate
                    if (item.rateGm > 0 && item.weight > 0) {
                        let netWeight = (item.weight - item.pp);
                        item.amount = formatIndianAmount(Math.round(item.rateGm * netWeight));
                    } else if (item.ratePer > 0 && item.weight > 0) {
                        let silverAmount = ((item.ratePer / 100) * customer.silverRate)
                        item.amount = formatIndianAmount(Math.round((silverAmount * item.weight) / 1000));
                    }
                    return item;
                })
            );

            setTimeout(() => {
                setTotalAmount(formatIndianAmount(totalAm));
                setIsItemSet(false);
                setIsBillGen(false);
            }, 0)
        }
    }, [isBillGen, hasCustomer, isItemsSet])

    return (
        <div className="flex">
            {/* <SideBar showLoader={showLoader} /> */}
            <div className="w-full">
                {/* {hasCustomer ? <div className={"mb-8 mt-1 w-fit px-8 py-6 rounded-xl shadow-[0_0_14px_-2px_#d3d3d3] bg-white"}>
                    <div className={`flex items-center ${customer.phone ? 'justify-between' : 'justify-start'} gap-8`}>
                        <div className="flex items-center gap-2 text-lg">
                            <span className="font-semibold flex items-center gap-2"><CircleUserRound /> Customer Name:</span>
                            <span>{handleCusName(customer.name)}</span>
                        </div>
                        {customer?.phone && <div className="flex items-center gap-2 text-lg">
                            <span className="font-semibold flex items-center gap-2"><Phone /> Phone Number:</span>
                            <span>{customer.phone}</span>
                        </div>}
                        <div className="flex items-center gap-2 text-lg">
                            <span className="font-semibold flex items-center gap-2"> <TrendingUp /> Silver Rate (per kg):</span>
                            <span>Rs.{customer.silverRate}</span>
                        </div>
                    </div>
                </div> : <></>} */}

                {/* Items container */}
                <div className="rounded-xl shadow-[3px_2px_10px_-1px_lightgrey] bg-white mb-8">
                    <div className="flex gap-6 items-end  border-b-2 border-gray-200 pt-6 px-7 pb-3">
                        <div style={{ alignItems: 'anchor-center' }} className="flex gap-3">
                            <img src="/billIcon.svg" width={30} alt="error" />
                            <h1 className="font-semibold text-2xl">Itemized Billing</h1>
                        </div>
                        <div>
                            <button
                                className="
                                    flex items-center gap-2
                                    rounded-lg border border-gray-200
                                    bg-gray-100 px-4 py-2
                                    text-sm font-medium text-gray-800
                                    hover:bg-gray-200/80
                                    transition
                                "
                                onClick={handleRegenerate}
                            >
                                <RotateCcw className="h-4 w-4 text-gray-600" />
                                Re-generate
                            </button>
                        </div>
                    </div>
                    <div className="px-4 pt-4 pb-6">
                        {/* <div className="flex gap-4 mb-4 mx-4">
                            <button
                                onClick={addRow}
                                className="bg-[#6366F1] hover:bg-[#4B50C1] transition-background duration-500 text-white p-2 px-3 font-semibold flex items-center gap-2 rounded-lg text-md"
                            >
                                <PlusIcon />
                                Add Item
                            </button>
                            <button
                                className={`${items.length == 1 && !items[0].itemName ? 'bg-[#000000a6]' : 'bg-[#333333]'} text-white px-6 py-2 rounded-md font-medium`}
                                onClick={previewBill}
                                disabled={items.length == 1 && !items[0].itemName ? true : false}
                            >Preview</button>
                            <button
                                className={`bg-[#FF6600] text-white px-6 py-2 rounded-md font-medium`}
                                onClick={handleRegenerate}>Re-generate</button>
                        </div> */}
                        <table className="border-separate border-spacing-4">
                            <thead>
                                <tr>
                                    <th className="text-left font-semibold">ITEM NAME</th>
                                    <th className="text-left font-semibold">RATE / GRAM</th>
                                    <th className="text-left font-semibold">RATE %</th>
                                    <th className="text-left font-semibold">GROSS WEIGHT (g)</th>
                                    <th className="text-left font-semibold">PP(g)</th>
                                    <th className="text-left font-semibold">AMOUNT</th>
                                    <th className="text-center font-semibold">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items
                                    .map((item, idx) => (
                                        <tr key={idx}>
                                            {/* <td className="text-center">
                                                <button
                                                    onClick={addRow}
                                                    className="bg-[#6366F1] hover:bg-[#4B50C1] transition-background duration-500 text-white p-2 font-semibold flex items-center gap-2 rounded-lg text-md w-fit"
                                                >
                                                    <PlusIcon />
                                                </button>
                                            </td> */}
                                            {/* <td>
                                                <input
                                                    type="text"
                                                    value={item.itemName}
                                                    onChange={(e) =>
                                                        handleInputChange(idx, "itemName", e.target.value)
                                                    }
                                                    className="border border-gray-300 px-4 py-2 rounded-lg outline-none"
                                                    placeholder="Item"
                                                />
                                            </td> */}
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
                                                <input
                                                    type="number"
                                                    value={item.pp}
                                                    onChange={(e) =>
                                                        handleInputChange(idx, "pp", parseFloat(e.target.value))
                                                    }
                                                    className="border w-full border-gray-300 px-4 py-2 rounded-lg outline-none"
                                                    placeholder="PP"
                                                />
                                            </td>
                                            <td className="w-fit whitespace-nowrap font-semibold">
                                                Rs. {item.amount}
                                                {/* Rs. {formatIndianAmount(calculateAmount(item, customer.silverRate))} */}
                                            </td>
                                            <td className="text-center flex items-center gap-2">
                                                <button
                                                    onClick={addRow}
                                                    className="bg-[#6366F1] hover:bg-[#4B50C1] transition-background duration-500 text-white p-2 font-semibold flex items-center gap-2 rounded-lg text-md w-fit"
                                                >
                                                    <PlusIcon />
                                                </button>
                                                <button onClick={() => deleteCusItem(idx, item.itemIdx)} className="bg-red-600 hover:bg-red-700 transition-background duration-500 text-white cursor-pointer p-2 px-3 font-semibold rounded-lg text-md w-fit mx-auto outline-none border-none"><Trash2 size={23} /></button>
                                            </td>
                                            {/* <td>Rs. {Math.round((item.weight - parseFloat(item.pp)) * item.rateGm)}</td> */}
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                    {/* <div className="mt-4 mb-0 flex items-baseline gap-2 px-14 pt-4 pb-4 bg-[#6366F1] text-white">
                        <h1 className="font-semibold text-xl">Total Amount:</h1>
                        <p className="font-semibold text-xl">Rs. {totalAmount.toFixed(2)}</p>
                    </div> */}
                </div>

                <div className="flex items-center justify-between border border-[#6366F1] rounded-xl shadow-[3px_2px_10px_-1px_lightgrey] bg-white overflow-hidden px-8 py-6">
                    <div className="ml-1">
                        <p className="text-gray-600 font-semibold text-sm">NET AMOUNT</p>
                        <h1 className="font-bold text-[#6366F1] flex items-center text-3xl"><IndianRupee strokeWidth={3} size={28} /> {totalAmount}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            className="
                                    flex items-center gap-3
                                    rounded-lg border border-gray-200
                                    bg-gray-100 px-8 py-3.5
                                    text-md font-medium text-gray-800
                                    hover:bg-gray-200/80
                                    transition
                                "
                            onClick={handleRegenerate}
                        >
                            <RotateCcw className="h-6 w-6 text-gray-600" />
                            Re-generate
                        </button>
                        <button onClick={previewBill}
                            className="bg-[#6366F1] hover:bg-[#4B50C1] cursor-pointer transition-background duration-500 text-white px-8 py-3.5 font-medium flex items-center gap-3 rounded-lg text-md w-fit"
                        >
                            <img src="/printer-white.svg" width={25} alt="error" />
                            <span>
                                Generate Bill
                            </span>
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