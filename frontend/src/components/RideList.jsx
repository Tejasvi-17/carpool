import axios from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

export default function RideList({ rides, setRides, setEditing }) {
    const { user } = useAuth();

    const del = async (id) => {
        try {
            await axios.delete(`/api/rides/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
            setRides(rides.filter(r => r._id !== id));
        } catch {
            alert('Delete failed');
        }
    };

    return (
        <div className="mt-4">
            <h3 className="font-semibold text-xl mb-2">My Rides</h3>
            {rides.length === 0 && <div className="text-gray-500">No rides yet.</div>}
            <div className="grid gap-3">
                {rides.map(r => (
                    <div key={r._id} className="border rounded-lg p-3 shadow-sm bg-white">
                        <div className="font-medium">
                            <span className="mr-2">{r.pickup?.label || 'Pickup'}</span>
                            <span>→</span>
                            <span className="ml-2">{r.dropoff?.label || 'Dropoff'}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Leaves: {new Date(r.departAt).toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Seats: {r.seatsAvailable}/{r.seatsTotal}</div>
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => setEditing(r)} className="border px-3 py-1 rounded">Edit</button>
                            <button onClick={() => del(r._id)} className="border px-3 py-1 rounded">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
