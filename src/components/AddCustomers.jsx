import { useState } from "react";
import SideBar from "./SideBar";
import AddItems from "./AddItems";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import CustomerNamesComplete from "./CustomerNamesComplete";

export function RetailWholesaleToggle({ billType = "R", setBillType }) {

    return (
        <div className="flex items-center bg-gray-200/80 p-1 rounded-2xl w-fit">
            {/* Retail Button */}
            <button
                onClick={() => setBillType('R')}
                className={`px-8 py-2 rounded-2xl text-lg font-medium transition-all duration-300
          ${billType === 'R'
                        ? "bg-[#6366F1] hover:bg-[#4B50C1] text-white shadow-md"
                        : "text-gray-700"
                    }`}
            >
                Retail
            </button>

            {/* Wholesale Button */}
            <button
                onClick={() => setBillType('W')}
                className={`px-8 py-2 rounded-2xl text-lg font-medium transition-all duration-300
          ${billType === 'W'
                        ? "bg-[#6366F1] hover:bg-[#4B50C1] text-white shadow-md"
                        : "text-gray-700"
                    }`}
            >
                Wholesale
            </button>
        </div>
    );
}


export default function AddCustomers() {
    const [customer, setCustomer] = useState({
        cus_id: null,
        name: "",
        phone: null,
        address: null,
        city: null,
        silverRate: 0
    });
    const [showLoader, setShowLoader] = useState(false);
    const [billType, setBillType] = useState('R');

    async function handleAddCustomer() {
        try {
            setShowLoader(true);
            // if (!customer.name) {
            //     toast.error("Please Enter Customer Name..");
            //     return false;
            // }

            // // Add new Customer
            // if (!customer.silverRate || parseInt(customer.silverRate) <= 0) {
            //     toast.error("Please Enter Valid Sliver Rate..");
            //     return false;
            // }

            // if (customer.phone) {
            //     if (customer.phone.length != 10) {
            //         toast.error("Phone Number Size Should be 10 Digits...");
            //         return false;
            //     }
            // }


            const response = await fetch(`${import.meta.env.VITE_API_URL}/customer`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ ...customer, billType })
            });
            const result = await response.json();

            if (result.status == 'success') {
                // toast.success(result.message);
                console.log(result.message);
                const cusD = result.data[0];
                localStorage.setItem('kamal_silver_rate', customer.silverRate);

                setCustomer((prev) => ({
                    ...prev,
                    cus_id: cusD.cus_id,
                    // name: cusD.name,
                    phone: cusD.phone,
                    address: cusD.address,
                    city: cusD.city
                }));


                return cusD.cus_id;
            } else if (result.status == 'error') {
                console.log("Error comes from the server...");
                console.log(result.message);
                toast.error("Something Went Wrong, Try again later!");
                return false;
            } else {
                toast.error("Something Went Wrong, Try again later!");
                console.log(result.message);
                return false;
            }

        } catch (error) {
            toast.error("Something Went Wrong, Try again later!");
            console.log("Error occur while adding new customer..");
            console.log(error);
            return false;
        } finally {
            setShowLoader(false);
        }

    }

    function formatIndianAmount(amount) {
        if (!amount) return "";
        return Number(amount).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
        });
    }

    const handleSilverRateChange = (e) => {
        const rawValue = e.target.value.replace(/,/g, ""); // remove commas

        if (!isNaN(rawValue)) {
            setCustomer((prev) => ({
                ...prev,
                silverRate: rawValue,
            }));
        }
    };


    useEffect(() => {
        const silverRate = localStorage.getItem('kamal_silver_rate') ?? 0;
        setCustomer((prev) => ({ ...prev, silverRate: silverRate }));
    }, []);

    return (
        <div className="flex gap-4">
            <SideBar showLoader={showLoader} />
            <div className="p-5 mx-auto w-[80%]">
                <div className="">
                    <div className="flex bg-white py-4 px-7 mb-3 justify-between rounded-xl shadow-[3px_2px_10px_-1px_lightgrey]">
                        <div>
                            <h1 className="text-4xl font-bold mb-1">Kamal Jewellers</h1>
                            <h3 className="text-[#6366F1] text-sm font-medium">Create customer records and itemized silver bills</h3>
                        </div>
                        <div className="bg-[#6366F1]/10 px-5 py-3 rounded-lg border border-[#6366F1]">
                            <p className="text-[#6366F1] font-semibold text-[11px]">CURRENT DATE</p>
                            <h1 className="text-md font-semibold">{new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}</h1>
                        </div>
                    </div>
                    <div className="bg-white mb-3 shadow-[3px_2px_10px_-1px_lightgrey] rounded-xl">
                        <div className="flex items-center justify-between border-b-2 border-gray-200 pt-5 px-7 pb-3">
                            <h1 style={{ alignItems: 'anchor-center' }} className="text-center whitespace-nowrap flex gap-3 font-semibold text-2xl mb-0">
                                <svg width="23px" height="24px" viewBox="0 0 16 16" fill="#6366F1" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" />
                                    <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" />
                                </svg>
                                Customer Information
                            </h1>
                            <RetailWholesaleToggle billType={billType} setBillType={setBillType} />
                        </div>
                        <div className="grid items-end grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mb-5 px-7 py-4">
                            <div className="flex flex-col">
                                <label htmlFor="" className="text-sm font-medium text-gray-600">Name:</label>
                                <CustomerNamesComplete
                                    value={customer.name}
                                    setCustomer={setCustomer}
                                />
                                {/* <input type="text" onKeyDown={(e) => e.key === 'Enter' ? handleAddCustomer() : ''} onChange={(e) => setCustomer((prev) => ({ ...prev, name: e.target.value }))} value={customer.name} placeholder="Enter Customer Name" className="border border-gray-300 px-4 py-2 rounded-lg outline-none" /> */}
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="" className="text-sm font-medium text-gray-600">Phone No(Optional):</label>
                                <input type="number" onChange={(e) => setCustomer((prev) => ({ ...prev, phone: e.target.value }))} value={customer.phone || ""} placeholder="Enter Customer Phone Number" className="border border-gray-300 px-4 py-2 rounded-lg outline-none" />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="" className="text-sm font-medium text-gray-600">Silver Rate(Per kg):</label>
                                <input type="text" onChange={handleSilverRateChange} value={formatIndianAmount(customer.silverRate)} placeholder="Enter Silver rate" className="border border-gray-300 px-4 py-2 rounded-lg outline-none" />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="" className="text-sm font-medium text-gray-600">Address:</label>
                                <input type="text" onChange={(e) => setCustomer((prev) => ({ ...prev, address: e.target.value }))} value={customer.address || ""} placeholder="Enter Customer Address" className="border border-gray-300 px-4 py-2 rounded-lg outline-none" />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="" className="text-sm font-medium text-gray-600">City:</label>
                                <input type="text" onChange={(e) => setCustomer((prev) => ({ ...prev, city: e.target.value }))} value={customer.city || ""} placeholder="Enter Customer City" className="border border-gray-300 px-4 py-2 rounded-lg outline-none" />
                            </div>

                        </div>
                    </div>

                </div>
                <AddItems customer={customer} billType={billType} setShowLoader={setShowLoader} handleAddCustomer={handleAddCustomer} />
            </div>
        </div>
    );
}