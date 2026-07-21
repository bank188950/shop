import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getLocations, saveLocations } from './admin-locations'

export function LocationTable() {
  const [locations, setLocations] = useState(getLocations)

  function deleteLocation(locationId: number, locationName: string) {
    if (!window.confirm(`ต้องการลบ ${locationName} ใช่หรือไม่?`)) return

    const nextLocations = locations.filter((location) => location.id !== locationId)
    setLocations(nextLocations)
    saveLocations(nextLocations)
  }

  return <section className="admin-page product-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">สถานที่รับสินค้า</h1></div><Link to="/admin/locations/add" className="admin-primary-button"><Plus size={19} />เพิ่มสถานที่</Link></div>
    <div className="product-table-wrap"><div className="product-table-scroll"><table className="product-table location-table"><thead><tr><th>สถานที่รับสินค้า</th><th>จัดการ</th></tr></thead><tbody>{locations.map((location) => <tr key={location.id}><td><span className="location-name"><MapPin size={19} aria-hidden="true" />{location.name}</span></td><td><div className="product-actions"><Link className="product-edit" to={`/admin/locations/${location.id}/edit`} aria-label={`แก้ไข ${location.name}`}><Pencil size={17} /></Link><button className="product-delete" type="button" aria-label={`ลบ ${location.name}`} onClick={() => deleteLocation(location.id, location.name)}><Trash2 size={17} /></button></div></td></tr>)}</tbody></table></div></div>
  </section>
}
