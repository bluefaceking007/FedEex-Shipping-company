js
import React, { useState, useEffect } from 'react';
export default function TrackingUI(){
  const [shipments, setShipments] = useState([]);
  useEffect(()=>{
    setShipments([{ trackingId: 'FX-INTL-784523961187', status: 'In Transit' }]);
  },[]);
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Courier App Tracking</h1>
      {shipments.map(s=>(
        <div key={s.trackingId} className="mt-2 p-2 border rounded">{s.trackingId}: {s.status}</div>
      ))}
    </div>
  );
}
