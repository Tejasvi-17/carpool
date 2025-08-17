import { useState } from 'react';
import axios from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

export default function SearchForm({ onResults }) {
    const { user } = useAuth();
    const [form, setForm] = useState({
        pickupLng: '', pickupLat: '',
        dropLng: '', dropLat: '',
        radiusKm: 5,
        departAt: new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16),
        windowMin: 60,
        minSeats: 1
    });

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (form.pickupLng && form.pickupLat) params.set('pickup', `${form.pickupLng},${form.pickupLat}`);
        if (form.dropLng && form.dropLat) params.set('dropoff', `${form.dropLng},${form.dropLat}`);
        if (form.radiusKm) params.set('radiusKm', String(form.radiusKm));
        if (form.departAt) params.set('departAt', new Date(form.departAt).toISOString());
        if (form.windowMin) params.set('windowMin', String(form.windowMin));
        if (form.minSeats) params.set('minSeats', String(form.minSeats));

        try {
            const { data } = await axios.get(`/api/rides/search?${params.toString()}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            onResults(data);
        } catch {
            alert('Search failed');
        }
    };

    return (
        <form onSubmit={submit} className="grid gap-3 bg-white border rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-xl">Find a Ride</h3>

            <div className="grid sm:grid-cols-2 gap-3">
                <label>Pickup Lng<input name="pickupLng" value={form.pickupLng} onChange={onChange} /></label>
                <label>Pickup Lat<input name="pickupLat" value={form.pickupLat} onChange={onChange} /></label>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
                <label>Drop Lng<input name="dropLng" value={form.dropLng} onChange={onChange} /></label>
                <label>Drop Lat<input name="dropLat" value={form.dropLat} onChange={onChange} /></label>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
                <label>Radius (km)<input name="radiusKm" value={form.radiusKm} onChange={onChange} /></label>
                <label>Depart At<input type="datetime-local" name="departAt" value={form.departAt} onChange={onChange} /></label>
                <label>Window (min)<input name="windowMin" value={form.windowMin} onChange={onChange} /></label>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
                <label>Min Seats<input name="minSeats" value={form.minSeats} onChange={onChange} /></label>
            </div>

            <div className="flex gap-2">
                <button type="submit" className="primary">Search</button>
                <button type="button" onClick={() => onResults([])}>Clear</button>
            </div>
        </form>
    );
}
