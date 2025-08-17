import { useState } from "react";
import SearchForm from "../components/SearchForm";

export default function Search() {
  const [results, setResults] = useState([]);
  return (
    <div className="max-w-6xl mx-auto p-4 grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Find a Ride</h1>
      </div>
      <SearchForm onResults={setResults} />
      <div className="grid gap-3">
        {results.length === 0 && (
          <div className="text-gray-500">No results yet.</div>
        )}
        {results.map((r) => (
          <div key={r._id} className="border rounded-lg p-3 bg-white shadow-sm">
            <div className="font-medium">
              <span className="mr-2">{r.pickup?.label || "Pickup"}</span>
              <span>→</span>
              <span className="ml-2">{r.dropoff?.label || "Dropoff"}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Leaves: {new Date(r.departAt).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Seats: {r.seatsAvailable}/{r.seatsTotal}
            </div>
            {typeof r.price === "number" && (
              <div className="text-sm text-gray-600">Price: {r.price}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
