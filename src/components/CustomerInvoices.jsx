// import { useState } from "react";
import SideBar from "./SideBar";
import React, { useEffect, useState, useRef } from 'react';
import { ChevronDown, ChevronRight, Search, Calendar, Download, Plus, Edit, X, RotateCcw } from 'lucide-react';
import toast from "react-hot-toast";
import ViewInvoices from "./ViewInvoices";

const CustomerDirectory = () => {
    const [expandedCustomers, setExpandedCustomers] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState({ start: '2023-10-01', end: '2023-12-31' });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [paginatedCustomers, setPaginatedCustomers] = useState([]);
    const [totalPages, setTotalPages] = useState();

    const [allCustomers, setAllCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [silverRate, setSilverRate] = useState(null);
    const [showInvoice, setShowInvoice] = useState({
        show: false,
        billType: 'R',
        invId: null,
        cusId: null,
        invoiceNo: null
    });
    const datePickerRef = useRef(null);

    const itemsPerPage = 10;

    // Sample data based on your database schema

    const [showLoader, setShowLoader] = useState(false);

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

    const updateSilverRate = ()=>{
        if(silverRate){
            localStorage.setItem('kamal_silver_rate', silverRate);
            toast.success('Silver rate updated successfully!');
        }
    }

    async function fetchAllCustomer(silverRate) {
        try {
            if (!silverRate) {
                toast.error("Please define the silver rate before continuing.");
                return;
            }
            setShowLoader(true);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/customer/summary?silverRate=${silverRate}`);
            const result = await response.json();
            // console.log(result);

            if (result.status == 'success') {
                // console.log(result);

                if (!Array.isArray(result.data)) {
                    console.log("Customers Data Not Found!");
                    return;
                }

                setAllCustomers(result.data);
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
                let silverRate = 0;

                if (customerDetails) {
                    silverRate = customerDetails.silverRate;
                } else {
                    silverRate = localStorage.getItem('kamal_silver_rate') ?? 0;
                }
                // console.log(silverRate);
                // const silverRate = localStorage.getItem('');

                // const mappedItems = result.data.map(item => ({
                //     itemIdx: item.id,
                //     itemName: stringFLCMaker(item.itemName) || "",
                //     rateGm: item.rateType === "gram" ? Number(item.rate) : 0,
                //     pp: item.pp || 0,
                //     ratePer: item.rateType === "percentage" ? Number(item.rate) : 0,
                //     weight: Number(item.grossWeight) || 0,
                //     amount: item.rateType === "gram" ? (formatIndianAmount(Math.round((item.grossWeight - item.pp) * item.rate)) || "0"): formatIndianAmount( Math.round( (((item.rate / 100) * silverRate) / 1000) * ((item.grossWeight - item.pp) / 100) ) ),
                //     newItems: false
                // }));

                // console.log(result.data);

                const mappedItems = result.data.map(item => {
                    const netWeight = item.grossWeight - item.pp; // grams only
                    // console.log(netWeight);
                    return {
                        itemIdx: item.id,
                        itemName: stringFLCMaker(item.itemName) || "",

                        rateGm: item.rateType === "gram" ? Number(item.rate) : 0,
                        ratePer: item.rateType === "percentage" ? Number(item.rate) : 0,

                        weight: Number(item.grossWeight) || 0,
                        pp: Number(item.pp) || 0,

                        amount:
                            item.rateType === "gram"
                                ? formatIndianAmount(
                                    Math.round(netWeight * item.rate)
                                )
                                : formatIndianAmount(
                                    Math.round(
                                        (netWeight *
                                            ((item.rate / 100) * silverRate)) / 1000
                                    )
                                ),

                        newItems: false
                    };
                });

                // console.log("below");
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

    // const deleteCusItem = async (itemIdx, db_item_idx) => {

    //     try {
    //         setShowLoader(true);

    //         if (db_item_idx == null) {
    //             console.log('del query not run for this time..');
    //             setItems((prev) => {
    //                 const updated = prev.filter((item, idx) => (
    //                     idx !== itemIdx
    //                 ))

    //                 // If everything is deleted, reset to one empty row
    //                 if (updated.length === 0) {
    //                     return [
    //                         {
    //                             itemIdx: null,
    //                             itemName: '',
    //                             rateGm: 0,
    //                             pp: 0,
    //                             ratePer: 0,
    //                             weight: 0,
    //                             amount: "0",
    //                             newItems: true
    //                         }
    //                     ];
    //                 }

    //                 return updated;
    //             });
    //             return;
    //         }

    //         const delRes = await fetch(
    //             `${import.meta.env.VITE_API_URL}/customer-items/delete`,
    //             {
    //                 method: 'POST',
    //                 headers: { 'content-type': 'application/json' },
    //                 body: JSON.stringify({
    //                     cusId: customerDetails.cus_id,
    //                     delId: db_item_idx
    //                 })
    //             }
    //         );

    //         const delResult = await delRes.json();

    //         if (delResult.status !== 'success') {
    //             toast.error('Something went wrong while deleting items');
    //             console.log(delResult);
    //             return;
    //         }

    //         setItems((prev) => {
    //             const updated = prev.filter((item, idx) => (
    //                 idx !== itemIdx
    //             ))

    //             // If everything is deleted, reset to one empty row
    //             if (updated.length === 0) {
    //                 return [
    //                     {
    //                         itemIdx: null,
    //                         itemName: '',
    //                         rateGm: 0,
    //                         pp: 0,
    //                         ratePer: 0,
    //                         weight: 0,
    //                         amount: "0",
    //                         newItems: true
    //                     }
    //                 ];
    //             }

    //             return updated;
    //         });

    //     } catch (error) {
    //         console.error(error);
    //         toast.error('Something Went Wrong, Try again later!');
    //     } finally {
    //         setShowLoader(false);
    //     }

    // }

    const handleRowClick = (customerId) => {
        setExpandedCustomers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(customerId)) {
                newSet.delete(customerId);
            } else {
                newSet.add(customerId);
            }
            return newSet;
        });
    };

    const applyDateSearch = () => {
        setShowDatePicker(false);

        const updated = allCustomers.filter(customer =>
            customer.invoices.some(invoice => {
                const d = new Date(invoice.invoiceDate);
                return d >= new Date(dateRange.start) && d <= new Date(dateRange.end);
            })
        );

        setFilteredCustomers(updated);
        setCurrentPage(1);
    };


    const applyTextSearch = () => {
        if (!searchQuery.trim()) {
            setFilteredCustomers(allCustomers);
            setCurrentPage(1);
            return;
        }

        // console.log(searchQuery);
        // return;

        const updated = allCustomers.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phone?.includes(searchQuery)
        );

        setFilteredCustomers(updated);
        setCurrentPage(1);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString)
            .toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            })
            .replace(/\//g, '-');
    };

    const invoiceMaker = (invId, name, amount, datetime) => {
        const cusName =
            name?.toLowerCase()?.replace(/\s+/g, "-") || "customer";

        const cusAmount = Math.round(Number(amount));

        // Split ISO datetime
        const [datePart, timePart] = datetime.split("T");

        // yyyy-mm-dd → dd-mm-yyyy
        const [year, month, day] = datePart.split("-");
        const date = `${day}-${month}-${year}`;

        // HH:mm:ss.ms → HH-MM (no seconds)
        const time = timePart
            .split(":")
            .slice(0, 2)
            .join("-");

        const finalInvoiceNo = `${invId}-${cusName}-${cusAmount}-${date}-${time}`;
        return finalInvoiceNo;
    };

    useEffect(() => {
        const silverRate = localStorage.getItem('kamal_silver_rate');

        setSilverRate(silverRate);
        fetchAllCustomer(silverRate);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                datePickerRef.current &&
                !datePickerRef.current.contains(event.target)
            ) {
                setShowDatePicker(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    useEffect(() => {
        setFilteredCustomers(allCustomers);
        setCurrentPage(1);
    }, [allCustomers]);


    useEffect(() => {
        const total = Math.ceil(filteredCustomers.length / itemsPerPage);

        const safeTotalPages = total > 0 ? total : 1;
        setTotalPages(safeTotalPages);

        const safeCurrentPage =
            currentPage > safeTotalPages ? 1 : currentPage;

        if (safeCurrentPage !== currentPage) {
            setCurrentPage(safeCurrentPage);
            return;
        }

        const start = (safeCurrentPage - 1) * itemsPerPage;
        const end = safeCurrentPage * itemsPerPage;

        setPaginatedCustomers(filteredCustomers.slice(start, end));
    }, [filteredCustomers, currentPage]);

    useEffect(() => {
        setExpandedCustomers(new Set());
    }, [currentPage]);

    function handleCusInvoice(invoiceNum, invId, cusId) {
        if (!invoiceNum || !invId || !cusId) {
            return;
        }

        setShowInvoice({ show: true, billType: 'R', invoiceNo: invoiceNum, invId: invId, cusId });
    }

    return (
        <div className="flex gap-4">
            <SideBar showLoader={showLoader} />
            {showInvoice.show && <ViewInvoices invoiceNum={showInvoice.invoiceNo} invoiceId={showInvoice.invId} customerId={showInvoice.cusId} BillType={showInvoice.billType} silverRate={silverRate} setShowLoader={setShowLoader} setShowInvoice={setShowInvoice} setAllCustomers={setAllCustomers} />}
            <div className="p-5 pt-8 mb-10 mx-auto w-[80%]">
                <div className="">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Customer Invoices</h1>
                            <p className="text-sm sm:text-base text-gray-600">Manage client profiles, transaction history, and detailed billing data.</p>
                        </div>

                        {/* Controls */}
                        <div className="bg-white rounded-lg shadow-[0_0_14px_-2px_#d3d3d3] mb-8 p-3 sm:p-4">
                            <div className="flex flex-col items-center sm:flex-row gap-3">
                                <div className="relative w-fit">
                                    <button
                                        onClick={() => setShowDatePicker(!showDatePicker)}
                                        className="flex items-center gap-2 px-3 bg-white sm:px-4 py-3.5 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto text-sm"
                                    >
                                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                                        <span className="text-gray-700 whitespace-nowrap">
                                            {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-gray-600" />
                                    </button>

                                    {showDatePicker && (
                                        <div ref={datePickerRef} id="datePickerMain" className="absolute -right-[12.3rem] top-16 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[280px]">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-semibold text-gray-900 text-sm">Date Range</h3>
                                                {/* <button onClick={() => setShowDatePicker(false)} className="text-gray-400 hover:text-gray-600">
                                                    <X className="w-4 h-4" />
                                                </button> */}
                                            </div>
                                            <div className="flex gap-4 items-end">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                                                    <input
                                                        type="date"
                                                        value={dateRange.start}
                                                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                                                    <input
                                                        type="date"
                                                        value={dateRange.end}
                                                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <button
                                                    onClick={applyDateSearch}
                                                    className="w-full px-4 py-2 bg-[#6366F1] text-white mb-1 rounded-lg hover:bg-indigo-700 text-sm font-medium"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Search */}
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-6 sm:h-6" />
                                    <input
                                        type="text"
                                        placeholder="Search by Name or Phone"
                                        value={searchQuery}
                                        onKeyDown={(e) => e.key === "Enter" ? applyTextSearch() : ""}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 sm:pl-10 pr-4 py-3 text-md border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                <button onClick={applyTextSearch} className="bg-[#6366F1] hover:bg-[#4B50C1] cursor-pointer transition-background duration-500 text-white pl-5 pr-8 py-3 font-medium flex items-center gap-3 rounded-lg text-md w-fit">
                                    <Search className="w-5 h-5" />
                                    Search
                                </button>
                                <button onClick={() => { setFilteredCustomers(allCustomers); setSearchQuery(""); }} className="bg-black/80 hover:bg-black/90 cursor-pointer transition-background duration-500 text-white pl-5 pr-8 py-3 font-medium flex items-center gap-3 rounded-lg text-md w-fit">
                                    <RotateCcw className="w-5 h-5" />
                                    Reset
                                </button>

                                {/* Date Range Filter */}


                                {/* Export Button */}
                                {/* <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">
                                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="font-medium">Export</span>
                                </button> */}

                                {/* New Customer Button */}
                                {/* <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="font-medium">New Customer</span>
                                </button> */}

                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-fit mb-4 ml-1 gap-3">
                                <h1 className="text-sm font-semibold text-gray-500 whitespace-nowrap">Silver Rate(kg):</h1>
                                <input type="number"
                                    value={silverRate ?? 0}
                                    onChange={(e) => setSilverRate(e.target.value)}
                                    placeholder="Silver rate"
                                    className="w-full px-4 py-3 text-md shadow-[0_0_14px_-2px_#d3d3d3] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <button onClick={updateSilverRate} className="bg-[#6366F1] hover:bg-[#4B50C1] cursor-pointer transition-background duration-500 text-white pl-5 pr-8 py-3 font-medium flex items-center gap-3 rounded-lg text-md w-fit">
                                    <RotateCcw className="w-5 h-5" />
                                    Update
                                </button>
                            </div>

                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-lg clear-both shadow-[0_0_14px_-2px_#d3d3d3] overflow-hidden">
                            {/* Desktop Table Header */}
                            <div className="hidden lg:grid grid-cols-4 gap-4 px-4 py-[1.3rem] bg-gray-50 border-b border-gray-200 font-semibold text-gray-600 uppercase tracking-wider">
                                <div className="text-start ml-8">Customer Name</div>
                                <div className="text-start">Contact Details</div>
                                <div className="text-start">Last Purchase</div>
                                <div className="text-start">Total Spent</div>
                            </div>

                            {/* Table Body */}
                            <div className="divide-y divide-gray-200">
                                {paginatedCustomers.length > 0 && paginatedCustomers.map((customer) => (
                                    <div key={customer.cusId} className="transition-all duration-200">
                                        {/* Customer Row */}
                                        <div
                                            onClick={() => handleRowClick(customer.cusId)}
                                            className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                                        >
                                            {/* Desktop View */}
                                            <div className="hidden lg:grid grid-cols-4 gap-4 px-4 py-4 items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-gray-400 transition-transform duration-200">
                                                        {expandedCustomers.has(customer.cusId) ? (
                                                            <ChevronDown className="w-5 h-5" />
                                                        ) : (
                                                            <ChevronRight className="w-5 h-5" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 text-sm">{stringFLCMaker(customer.name)}</div>
                                                        {/* <div className="text-xs text-gray-500">ID: {customer.cusId}</div> */}
                                                    </div>
                                                </div>
                                                <div className="">
                                                    <div className="text-sm text-gray-900">{customer.phone}</div>
                                                    <div className="text-xs text-gray-500 truncate">{stringFLCMaker(customer.city)}</div>
                                                </div>
                                                <div className="text-sm text-gray-900">{customer.lastPurchase}</div>
                                                <div className="text-base font-bold text-[#6366F1]">{formatCurrency(customer.totalSpent)}</div>
                                                {/* <div className="col-span-2 flex justify-end">
                                                    <button
                                                        onClick={handleActionClick}
                                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                </div> */}
                                            </div>

                                        </div>

                                        {/* Expanded Billing History */}
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCustomers.has(customer.cusId) ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                                                }`}
                                        >
                                            {expandedCustomers.has(customer.cusId) && (
                                                <div className="bg-white px-4 sm:px-6 py-5 border-t border-gray-200">
                                                    {/* Billing History Header */}
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <RotateCcw className="w-5 h-5 text-gray-700" />
                                                            <span className="font-semibold text-gray-900 text-base sm:text-lg">Billing History</span>
                                                        </div>
                                                        <span className="text-xs sm:text-sm font-bold text-[#6366F1] bg-purple-50 px-3 py-1 rounded-md">
                                                            {customer.invoices.length} INVOICES FOUND
                                                        </span>
                                                    </div>

                                                    {/* Invoice Table - Desktop */}
                                                    <div className="bg-white rounded-lg border border-gray-300 mx-4 max-h-[50vh] overflow-auto">
                                                        <table className="w-full">
                                                            <thead className="bg-gray-200/90 border-b border-gray-300">
                                                                <tr>
                                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Invoice ID</th>
                                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Bill Type</th>
                                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Net Weight (g)</th>
                                                                    {/* <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th> */}
                                                                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Total Amount</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100">
                                                                {customer.invoices.map((invoice) => (
                                                                    <tr key={invoice.id} className="hover:bg-gray-100 cursor-pointer transition-colors">
                                                                        <td className="px-6 py-4" onClick={() => handleCusInvoice(invoiceMaker(invoice.id, customer.name, invoice.totalAmount, invoice.invoiceDate), invoice.id, customer.cusId)}>
                                                                            <span className="font-semibold text-[#6366F1]">#{invoiceMaker(invoice.id, customer.name, invoice.totalAmount, invoice.invoiceDate)}</span>
                                                                        </td>
                                                                        <td className="px-6 py-4 text-gray-700">{invoice.billType == 'R' ? 'Retail' : 'WholeSale'}</td>
                                                                        <td className="px-6 py-4 text-gray-700">{formatDate(invoice.invoiceDate)}</td>
                                                                        <td className="px-6 py-4 text-gray-700">{invoice.netWeight}g</td>
                                                                        {/* <td className="px-6 py-4">
                                                                            <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700">
                                                                                PAID
                                                                            </span>
                                                                        </td> */}
                                                                        <td className="px-6 py-4 text-right font-bold text-gray-900">{formatCurrency(invoice.totalAmount)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="px-4 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="text-sm text-gray-600">
                                    {filteredCustomers.length === 0 ? (
                                        "No customers found"
                                    ) : (
                                        <>
                                            Showing{" "}
                                            <span className="font-medium">
                                                {(currentPage - 1) * itemsPerPage + 1}
                                            </span>
                                            {" - "}
                                            <span className="font-medium">
                                                {Math.min(currentPage * itemsPerPage, filteredCustomers.length)}
                                            </span>
                                            {" of "}
                                            <span className="font-medium">
                                                {filteredCustomers.length}
                                            </span>{" "}
                                            customers
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    {/* Page Numbers */}
                                    <div className="flex items-center gap-1">
                                        {/* {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = idx + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = idx + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + idx;
                                            } else {
                                                pageNum = currentPage - 2 + idx;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`px-3 py-2 text-sm font-medium rounded-lg ${currentPage === pageNum
                                                        ? 'text-white bg-indigo-600 border border-indigo-600'
                                                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })} */}
                                        {totalPages > 1 &&
                                            [...Array(Math.min(5, totalPages))].map((_, idx) => {
                                                let pageNum;

                                                if (totalPages <= 5) {
                                                    pageNum = idx + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = idx + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + idx;
                                                } else {
                                                    pageNum = currentPage - 2 + idx;
                                                }

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`px-3 py-2 text-sm font-medium rounded-lg ${currentPage === pageNum
                                                            ? "text-white bg-[#6366F1]"
                                                            : "text-gray-700 bg-white border"
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}

                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default CustomerDirectory;