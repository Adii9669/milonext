import { useState, useEffect } from "react";
import { useDebounce } from "./ useDebounce";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function useCheckUsername(username: string) {
    const [isLoading, setIsLoading] = useState(false);
    const [isAvailable, setIsAvailable] = useState(null);
    const [error, setError] = useState<string | null>(null);


    const debounceUser = useDebounce(username, 500)

    useEffect(() => {
        //check the user name is not too short or empty 
        if (!debounceUser || debounceUser.length < 3) {
            setIsAvailable(null);
            return;
        }

        setIsLoading(true);
        setIsAvailable(null);
        setError(null);


        // The fetching beings here 
        fetch(`${API_URL}/auth/check-availability`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                field: 'username',
                value: debounceUser
            }),
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network Respone not ok');
                }
                return res.json();
            })
            .then(data => {
                //   console.log("Response from backend:", data);
                setIsAvailable(data.available);
            })
            .catch(err => {

                let errorMessage = "An unknown error occurred."; // 1. Start with a generic message.

                // 2. Check if 'err' is an actual Error object.
                if (err instanceof Error) {
                    // Inside this block, TypeScript now knows that 'err' is an Error,
                    // so it's safe to access 'err.message'.
                    errorMessage = err.message;
                }

                // 3. Set the state with the safe error message.
                setError(errorMessage);
            })
            .finally(() => {
                setIsLoading(false);
            })


    }, [debounceUser])
    return { isLoading, isAvailable, error };
}
