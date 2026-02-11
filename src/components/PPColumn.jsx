import { Minus } from "lucide-react";

const PPColumn = ({ itemIndex, ppRows, setItems }) => {
    const HIGHLIGHT = "#6366F1";

    const updatePP = (ppIndex, field, value) => {
        setItems(prev =>
            prev.map((item, i) =>
                i === itemIndex
                    ? {
                        ...item,
                        ppRows: item.ppRows.map((pp, j) =>
                            j === ppIndex ? { ...pp, [field]: value } : pp
                        )
                    }
                    : item
            )
        );
    };

    const addPP = () => {
        setItems(prev =>
            prev.map((item, i) =>
                i === itemIndex
                    ? { ...item, ppRows: [...item.ppRows, { count: 0, weight: 0 }] }
                    : item
            )
        );
    };

    // const removePP = (ppIndex) => {

    //     setItems(prev =>{
    //         const updated =  prev.filter((item, i) =>
    //             i === itemIndex
    //                 ? { ...item, ppRows: item.ppRows.filter((_, j) => j !== ppIndex) }
    //                 : item
    //         )

    //         if(updated.length == 0){
    //             return { count: 0, weight: 0 }
    //         }

    //     });
    // };

    const removePP = (ppIndex) => {
        setItems(prev =>
            prev.map((item, i) => {
                if (i !== itemIndex) return item;

                const updatedPPRows = item.ppRows.filter((_, j) => j !== ppIndex);

                return {
                    ...item,
                    ppRows:
                        updatedPPRows.length > 0
                            ? updatedPPRows
                            : [{ count: 0, weight: 0 }] // empty row
                };
            })
        );
    };



    const totalPP = () => {
        const SCALE = 100; // 2 decimal precision (0.01g)

        if (!Array.isArray(ppRows) || ppRows.length === 0) {
            return 0;
        }

        const totalScaled = ppRows.reduce((sum, pp) => {
            const count = Number(pp.count) || 0;
            const weight = Number(pp.weight) || 0;

            // convert to integer safely
            return sum + count * Math.round(weight * SCALE);
        }, 0);

        return totalScaled / SCALE;
    };


    return (
        <div className="flex flex-col gap-2 min-w-[160px]">
            {ppRows.map((pp, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                    <input
                        type="number"
                        value={pp.count}
                        min={0}
                        onChange={(e) =>
                            updatePP(idx, "count", parseInt(e.target.value) || 0)
                        }
                        className="w-12 border border-gray-300 px-2 py-1 rounded-md outline-none"
                    />

                    <input
                        type="number"
                        value={pp.weight}
                        min={0}
                        onChange={(e) =>
                            updatePP(idx, "weight", parseFloat(e.target.value) || 0)
                        }
                        className="w-20 border border-gray-300 px-2 py-1 rounded-md outline-none"
                    />

                    <button
                        onClick={() => removePP(idx)}
                        className="bg-red-100 text-red-600 px-2 py-1 rounded-md"
                    >
                        <Minus size={14} />
                    </button>
                </div>
            ))}

            <button
                onClick={addPP}
                className="text-sm font-semibold mt-1 text-start"
                style={{ color: HIGHLIGHT }}
            >
                + ADD PP
            </button>

            <div className="flex justify-between text-sm pt-1 px-2 border-t border-gray-200">
                <span className="text-gray-400 font-semibold">TOTAL PP:</span>
                <span className="font-semibold" style={{ color: HIGHLIGHT }}>
                    {totalPP()} g
                </span>
            </div>
        </div>
    );
};

export default PPColumn;
