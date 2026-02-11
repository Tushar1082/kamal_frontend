import { Combobox } from "@headlessui/react";
import { useState } from "react";

export default function CustomerNamesComplete({ value, setCustomer }) {
    const [fetchItems, setFetchItems] = useState([]);

    const fetchSuggestions = async (q) => {
        if (!q.trim()) {
            setFetchItems([]);
            return;
        }

        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/customer/search?q=${encodeURIComponent(q)}`
        );
        const data = await res.json();

        if (data.status === "success") {
            setFetchItems(data.data);
        }
    };

    const fetchCustomer = async (name) => {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/customer/details?name=${encodeURIComponent(name)}`
        );
        const result = await res.json();

        if (result.status === "success") {
            const c = result.data;

            setCustomer(prev => ({
                ...prev,
                cus_id: c.id,
                name: c.name,
                phone: c.phone,
                address: c.address,
                city: c.city
            }));
        } else {
            // customer not found → keep typed name, clear rest
            setCustomer(prev => ({
                ...prev,
                cus_id: null,
                name,
                phone: null,
                address: null,
                city: null
            }));
        }
    };

    return (
        <Combobox value={value} onChange={fetchCustomer}>
            <div className="relative">
                <Combobox.Input
                    autoComplete="off"
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Customer name"
                    value={value}
                    onChange={(e) => {
                        const name = e.target.value;
                        setCustomer(prev => ({ ...prev, name }));
                        fetchSuggestions(name);
                    }}
                />

                {fetchItems.length > 0 && (
                    <Combobox.Options
                        style={{ width: "max-content" }}
                        className="absolute z-50 mt-1 w-max min-w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto"
                    >
                        {fetchItems.map((item, idx) => (
                            <Combobox.Option
                                key={idx}
                                value={item}
                                className={({ active }) =>
                                    `px-4 py-2 whitespace-nowrap cursor-pointer ${
                                        active ? "bg-blue-100" : ""
                                    }`
                                }
                            >
                                {item}
                            </Combobox.Option>
                        ))}
                    </Combobox.Options>
                )}
            </div>
        </Combobox>
    );
}
