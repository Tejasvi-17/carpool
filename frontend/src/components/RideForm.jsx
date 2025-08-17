import { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

export default function RideForm({ rides, setRides, editing, setEditing }) {
    const { user } = useAuth();
    const [form, setForm] = useState({
        seatsTotal: 3, seatsAvailable: 3,
        pickupLabel: '', pickupLng: '', pickupLat: '',
        dropLabel: '', dropLng: '', dropLat: '',
        departAt: new Date().toISOString().slice(0, 16),
        price: 0, notes: ''
    });

    useEffect(() => {
        if (!editing) return;
        const r = editing;
        setForm({
            seatsTotal: r.seatsTotal,
            seatsAvailable: r.seatsAvailable,
            pickupLabel: r.pickup?.label || '',
            pickupLng: r.pickup?.location?.coordinates?.[0] || '',
            pickupLat: r.pickup?.location?.coordinates?.[1] || '',
            dropLabel: r.dropoff?.label || '',
            dropLng: r.dropoff?.location?.coordinates?.[0] || '',
            dropLat: r.dropoff?.location?.coordinates?.[1] || '',
            departAt: new Date(r.departAt).toISOString().slice(0, 16),
            price: r.price || 0,
            notes: r.notes || ''
        });
    }, [editing]);

    const submit = async (e) => {
        e.preventDefault();
        const body = {
            seatsTotal: Number(form.seatsTotal),
            seatsAvailable: Number(form.seatsAvailable),
            pickup: { label: form.pickupLabel, location: { type: 'Point', coordinates: [Number(form.pickupLng), Number(form.pickupLat)] } },
            dropoff: { label: form.dropLabel, location: { type: 'Point', coordinates: [Number(form.dropLng), Number(form.dropLat)] } },
            departAt: new Date(form.departAt),
            price: Number(form.price),
            notes: form.notes
        };
        try {
            if (editing) {
                const { data } = await axios.put(`/api/rides/${editing._id}`, body, { headers: { Authorization: `Bearer ${user.token}` } });
                setRides(rides.map(r => r._id === editing._id ? data : r));
                setEditing(null);
            } else {
                const { data } = await axios.post('/api/rides', body, { headers: { Authorization: `Bearer ${user.token}` } });
                setRides([data, ...rides]);
            }
        } catch {
            alert('Failed to save ride');
        }
    };

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    return (
        <form onSubmit={submit} className="grid gap-3 max-w-3xl bg-white border rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-xl">{editing ? 'Edit Ride' : 'Offer a Ride'}</h3>

            <div className="grid sm:grid-cols-2 gap-3">
                <label>Seats Total<input name="seatsTotal" value={form.seatsTotal} onChange={onChange} /></label>
                <label>Seats Available<input name="seatsAvailable" value={form.seatsAvailable} onChange={onChange} /></label>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
                <label>Pickup Location<input name="pickupLabel" value={form.pickupLabel} onChange={onChange} /></label>
                <label>Pickup Lng<input name="pickupLng" value={form.pickupLng} onChange={onChange} /></label>
                <label>Pickup Lat<input name="pickupLat" value={form.pickupLat} onChange={onChange} /></label>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
                <label>Drop Location<input name="dropLabel" value={form.dropLabel} onChange={onChange} /></label>
                <label>Drop Lng<input name="dropLng" value={form.dropLng} onChange={onChange} /></label>
                <label>Drop Lat<input name="dropLat" value={form.dropLat} onChange={onChange} /></label>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
                <label>Depart At<input type="datetime-local" name="departAt" value={form.departAt} onChange={onChange} /></label>
                <label>Price<input name="price" value={form.price} onChange={onChange} /></label>
                <label>Notes<input name="notes" value={form.notes} onChange={onChange} /></label>
            </div>

            <div className="flex gap-2">
                <button type="submit" className="primary">{editing ? 'Update' : 'Create'}</button>
                {editing && <button type="button" onClick={() => setEditing(null)}>Cancel</button>}
            </div>
        </form>
    );
}
