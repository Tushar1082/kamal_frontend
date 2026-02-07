import { useState } from "react";
import SideBar from "./SideBar";
import AddItems from "./addItems";
import { useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { CircleUserRound, LoaderPinwheel, User } from "lucide-react";

export default function AddCustomers() {
    const [customer, setCustomer] = useState({
        cus_id: null,
        name: "",
        phone: null,
        silverRate: 0
        // isCusExists: false
    });
    // const [showAdditem, setShowAddItem] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [hasCustomer, setHasCustomer] = useState(false);
    const [resCusItem, setResCusItem] = useState(false);

    async function handleAddCustomer() {
        try {
            setShowLoader(true);
            if (!customer.name) {
                toast.error("Please Enter Customer Name..");
                return;
            }

            // Add new Customer
            if (!customer.silverRate || parseInt(customer.silverRate) <= 0) {
                toast.error("Please Enter Valid Sliver Rate..");
                return;
            }

            if (customer.phone) {
                if (customer.phone.length != 10) {
                    toast.error("Phone Number Size Should be 10 Digits...");
                    return;
                }
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/customer`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(customer)
            });
            const result = await response.json();

            if (result.status == 'success') {
                toast.success(result.message);
                console.log(result.message);
                const cusD = result.data[0];
                localStorage.setItem('kamal_silver_rate', customer.silverRate);

                setCustomer((prev) => ({
                    ...prev,
                    cus_id: cusD.cus_id,
                    // name: cusD.name,
                    phone: cusD.phone
                }));

                setTimeout(() => {
                    setHasCustomer(true);
                    setResCusItem(true);
                }, 0);
            } else if (result.status == 'error') {
                console.log("Error comes from the server...");
                console.log(result.message);
                toast.error("Something Went Wrong, Try again later!");
            } else {
                toast.error("Something Went Wrong, Try again later!");
                console.log(result.message);
            }

        } catch (error) {
            toast.error("Something Went Wrong, Try again later!");
            console.log("Error occur while adding new customer..");
            console.log(error);
        } finally {
            setShowLoader(false);
        }

    }

    useEffect(() => {
        const silverRate = localStorage.getItem('kamal_silver_rate') ?? 0;
        setCustomer((prev) => ({ ...prev, silverRate: silverRate }));
    }, []);

    // useEffect(()=>{
    //     console.log(resCusItem);
    // },[resCusItem])

    return (
        <div className="my-10 mx-auto w-[80%]">
            <div className="">
                {/* <SideBar showLoader={showLoader} /> */}
                <div className="flex bg-white py-5 px-7 mb-8 justify-between rounded-xl shadow-[3px_2px_10px_-1px_lightgrey]">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Kamal Jewellers</h1>
                        <h3 className="text-[#6366F1] text-sm font-medium">Create customer records and itemized silver bills</h3>
                    </div>
                    <div className="bg-[#6366F1]/10 px-5 py-3 rounded-lg border border-[#6366F1]">
                        <p className="text-[#6366F1] font-semibold text-[11px]">CURRENT DATE</p>
                        <h1 className="text-md font-semibold">{new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}</h1>
                    </div>
                </div>
                {/* <div className="flex w-full justify-center h-fit"> */}
                <div className="bg-white mb-8 shadow-[3px_2px_10px_-1px_lightgrey] rounded-xl overflow-hidden">
                    <h1 style={{alignItems:'anchor-center'}} className="text-center border-b-2 border-gray-200 pt-6 px-7 pb-3 whitespace-nowrap flex gap-3 font-semibold text-2xl mb-6">
                        {/* <CircleUserRound size={25} /> */}
                        <svg width="23px" height="24px" viewBox="0 0 16 16" fill="#6366F1" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" />
                            <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" />
                        </svg>
                        Customer Information
                    </h1>
                    <div className="flex items-end gap-6 mb-5 px-7 pb-2">
                        <div className="flex flex-col">
                            <label htmlFor="" className="text-sm font-medium text-gray-600">Name:</label>
                            <input type="text" onKeyDown={(e) => e.key === 'Enter' ? handleAddCustomer() : ''} onChange={(e) => setCustomer((prev) => ({ ...prev, name: e.target.value }))} value={customer.name} placeholder="Enter Customer Name" className="border border-gray-300 px-4 py-2 rounded-lg outline-none" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="" className="text-sm font-medium text-gray-600">Phone No(Optional):</label>
                            <input type="number" onChange={(e) => setCustomer((prev) => ({ ...prev, phone: e.target.value }))} value={customer.phone || ""} placeholder="Enter Customer Phone Number" className="border border-gray-300 px-4 py-2 rounded-lg outline-none" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="" className="text-sm font-medium text-gray-600">Silver Rate(Per kg):</label>
                            <input type="number" onChange={(e) => setCustomer((prev) => ({ ...prev, silverRate: e.target.value }))} value={customer.silverRate} placeholder="Enter Silver rate" className="border border-gray-300 px-4 py-2 rounded-lg outline-none" />
                        </div>
                        <div className="">
                            <button onClick={handleAddCustomer} className="bg-[#6366F1] hover:bg-[#4B50C1] transition-background duration-500 text-white px-16 cursor-pointer py-3 font-semibold rounded-lg">Add To Bill</button>
                        </div>
                    </div>
                </div>

                {/* </div> */}
            </div>
            {/* {showAdditem ? */}
            <AddItems customerDetails={customer} hasCustomer={hasCustomer} resCusItem={resCusItem} setResCusItem={setResCusItem} setShowLoader={setShowLoader} />
            {/* :<></>} */}
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        pointerEvents: "none", // 🔑 does not interrupt loader
                    },
                }}
            />
            {showLoader?<div className="fixed left-0 right-0 top-0 bottom-0 bg-black/40 flex justify-center items-center"><LoaderPinwheel className="w-16 h-16 text-white animate-spin" /></div>:<></>}
        </div>
    );
}