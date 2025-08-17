import { useState, useEffect } from "react";
import axios from "../axiosConfig";
import { useAuth } from "../context/AuthContext";
import RideForm from "../components/RideForm";
import RideList from "../components/RideList";
import { Link } from "react-router-dom";

export default function Rides() {
    const { user } = useAuth();
    const [rides, setRides] = useState([]);
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get("/api/rides/mine", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setRides(res.data);
            } catch {
                alert("Failed to fetch rides");
            }
        })();
    }, [user]);

    return (
        <div className="max-w-6xl mx-auto p-4 grid gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">My Rides</h1>
                <Link to="/find" className="px-3 py-2 rounded-md border">
                    Find a Ride
                </Link>
            </div>
            <RideForm
                rides={rides}
                setRides={setRides}
                editing={editing}
                setEditing={setEditing}
            />
            <RideList rides={rides} setRides={setRides} setEditing={setEditing} />
        </div>
    );
}
