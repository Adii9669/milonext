import {useState , useEffect } from "react";

export function useDebounce<T>(value: T, delay: number){

    //state for storing values 
    const [debounce, setDebounce] = useState(value);

    useEffect (() => {
        //set up the timer to update the value 
        const handler = setTimeout(() => {
            setDebounce(value);
        }, delay);


        return ()=> {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debounce;
} 
