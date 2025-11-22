import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { router } from "expo-router";

export default function useRequireAuth() {
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const token = await getToken();
            if (!token && mounted) {
                router.replace("/login");
            } else if (mounted) {
                setChecking(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    return { checking }; // screen can show loading while checking
}

