import { Combobox } from "@headlessui/react";
import { useState } from "react";

export default function ItemAutocomplete({ value, onChange, onSelect, idx, setItems }) {
    const [query, setQuery] = useState("");
    const [fetchItems, setFetchItems] = useState([]);

    const fetchSuggestions = async (q) => {
        if (!q.trim()) {
            setFetchItems([]);
            return;
        }

        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/customer-items/search?q=${encodeURIComponent(q)}`
        );
        const data = await res.json();

        if (data.status === "success") {
            setFetchItems(data.data);
        }
    };

    const fetchRate = async (itemName) => {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/customer-items/fetch-rate?item_name=${encodeURIComponent(itemName)}`
        );
        const data = await res.json();

        if (data.status === "success") {

            if (data?.rate == null || !data?.rateType) {
                return;
            }

            setItems((prev) =>
                prev.map((it, i) => {
                    if (i === idx) {
                        const field =
                            data.rateType === "gram" ? "rateGm" : "ratePer";

                        return {
                            ...it,
                            [field]: data.rate
                        };
                    }
                    return it;
                })
            );
        }

    };

    return (
        <Combobox
            value={value}
            onChange={(val) => {
                onChange(val);
                fetchRate(val);
                onSelect?.(val);
            }}
        >
            <div className="relative">
                <Combobox.Input
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Item"
                    value={value}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onChange(e.target.value);
                        fetchSuggestions(e.target.value);
                    }}
                />

                {fetchItems.length > 0 && (
                    <Combobox.Options className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto">
                        {fetchItems.map((item, idx) => (
                            <Combobox.Option
                                key={idx}
                                value={item}
                                className={({ active }) =>
                                    `px-4 py-2 cursor-pointer ${active ? "bg-blue-100" : ""
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
