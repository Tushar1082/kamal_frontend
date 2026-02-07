import { LoaderPinwheel } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function SideBar({showLoader=false}){
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(null);

    function getActiveTab(){
        const currentTab = location.pathname;
        setActiveTab(currentTab);
    }

    useEffect(()=>{
        getActiveTab();
    },[]);

    return (
        <div className="flex w-[22%] bg-white h-[100vh] shadow-[0_0_14px_-2px_#d3d3d3]">
            {
                activeTab?
                <div className="items-left w-full p-8 pl-0 flex flex-col gap-4">
                <Link to="/" className={`${activeTab=="/"?"text-white bg-[#6366F1]":"text-black bg-white hover:bg-[#6366F1] hover:text-white"} p-3 pl-8 px-6 cursor-pointer font-semibold rounded-[0px_30px_30px_0px] transition-background duration-300`}>Add Customer</Link>
                {/* <Link to="/addItems" className={`${activeTab=="/addItems"?"text-white bg-[#6366F1]":"text-black bg-white hover:bg-[#6366F1] hover:text-white"} p-3 pl-8 px-6 cursor-pointer font-semibold rounded-[0px_30px_30px_0px] transition-background duration-300`}>Add Items</Link> */}
            </div>:<></>
            }
            {showLoader?<div className="absolute left-0 right-0 top-0 bottom-0 bg-black/40 flex justify-center items-center"><LoaderPinwheel className="w-16 h-16 text-white animate-spin" /></div>:<></>}
        </div>
    );
}