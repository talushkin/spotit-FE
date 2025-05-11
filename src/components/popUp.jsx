import { useState } from "react";

export default function PopUp({ show, setShowPopup, InputPlaceHolder }) {
  const [inputValue, setInputValue] = useState("");

  if (!show) return null; // hide popup if 'show' is false

  return (
    <>
      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
            <h2 className="text-xl font-bold">Enter a value</h2>
            <input
              type="text"
              placeHolder={InputPlaceHolder}
              className="border p-2 w-full rounded"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-300 px-3 py-1 rounded"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded"
                onClick={() => {
                  console.log("Input value:", inputValue);
                  setShowPopup(false);
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
