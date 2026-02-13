import { UserPlus, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { Link, useLocation } from "react-router-dom";
import Loader from "./Loader";

export default function SideBar({ showLoader = false }) {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(null);

    function getActiveTab() {
        const currentTab = location.pathname;
        setActiveTab(currentTab);
    }

    useEffect(() => {
        getActiveTab();
    }, []);

    return (
        <div className="flex sticky top-0 bg-white h-[100vh] shadow-[0_0_14px_-2px_#d3d3d3]">
            {
                activeTab ?
                    <div className="items-left w-full p-8 pl-0 pr-4 flex flex-col gap-4">
                        <Link to="/" className={`${activeTab == "/" ? "text-white bg-[#6366F1]" : "text-black bg-white hover:bg-[#6366F1] hover:text-white"} flex items-center p-3 pl-8 px-6 cursor-pointer whitespace-nowrap font-semibold rounded-[0px_30px_30px_0px] transition-background duration-300`}><UserPlus className="mr-3" /> Add Customer</Link>
                        <Link to="/customerInvoices" className={`${activeTab == "/customerInvoices" ? "text-white bg-[#6366F1]" : "text-black bg-white hover:bg-[#6366F1] hover:text-white"} flex whitespace-nowrap items-center p-3 pl-8 px-6 cursor-pointer font-semibold rounded-[0px_30px_30px_0px] transition-background duration-300`}> <Receipt className="mr-3"/> Customer Invoices</Link>
                    </div> : <></>
            }
            {/* {showLoader ?  */}
            <Loader open={showLoader}/>
            {/* <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center"><LoaderPinwheel className="w-16 h-16 text-white animate-spin" /></div>  */}
            {/* : <></>} */}
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        pointerEvents: "none", // 🔑 does not interrupt loader
                    },
                }}
            />
        </div>
    );
}