import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function SupabaseTest() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  async function testSupabaseConnection() {
    try {
      setLoading(true);
      // Test connection by trying to query the users table
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .limit(1);

      if (error) {
        console.error("Supabase connection error:", error);
        setError(error.message);
      } else {
        console.log("Supabase connection successful:", data);
        setData(data || []);
      }
    } catch (err) {
      console.error("Test error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Supabase Connection Test</h3>
      {loading && <p>Testing connection...</p>}
      {error && (
        <div className="text-red-600">
          <p>Error: {error}</p>
          <p className="text-sm mt-2">
            This might be because the database tables don't exist yet. 
            Please run the database schema in your Supabase SQL editor.
          </p>
        </div>
      )}
      {!loading && !error && (
        <div className="text-green-600">
          <p>✅ Supabase connection successful!</p>
          <p className="text-sm mt-2">
            Found {data.length} records in users table.
          </p>
        </div>
      )}
    </div>
  );
}

export default SupabaseTest; 