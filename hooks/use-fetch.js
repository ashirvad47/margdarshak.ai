// hooks/use-fetch.js
import { useState, useCallback } from "react"; // Added useCallback
import { toast } from "sonner";

const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(false); // Changed initial state to false
  const [error, setError] = useState(null);

  const fn = useCallback(async (...args) => { // Wrapped fn in useCallback
    setLoading(true);
    setError(null);
    setData(undefined); // Reset data on new fetch call
    try {
      const response = await cb(...args);
      setData(response);
      // setError(null); // Already set to null above
      return response; // Return response for potential chaining or direct use
    } catch (error) {
      console.error("Error in useFetch callback:", error); // Log the actual error
      setError(error);
      toast.error(error.message || "An unexpected error occurred."); // Display error message
      return undefined; // Return undefined on error
    } finally {
      setLoading(false);
    }
  }, [cb]); // cb is the dependency for useCallback

  return { data, loading, error, fn, setData }; // Keep setData if manual setting is needed elsewhere
};

export default useFetch;